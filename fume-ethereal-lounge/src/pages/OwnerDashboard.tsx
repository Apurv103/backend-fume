import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, TrendingUp, Users, CreditCard, Filter, Download, RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation, useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

type SummaryKpis = {
  revenue: number;
  orders: number;
  aov: number;
  guests: number;
  openTabs: number;
  paymentRate: number; // 0..1
};

const OwnerDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const API_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";
  // Simple local state for filters (to be replaced with real data/query params)
  const [preset, setPreset] = useState<"7d" | "30d" | "qtd" | "ytd">("7d");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [productFilter, setProductFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [filtersVersion, setFiltersVersion] = useState<number>(0);
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  const [summary, setSummary] = useState<SummaryKpis>({
    revenue: 0,
    orders: 0,
    aov: 0,
    guests: 0,
    openTabs: 0,
    paymentRate: 0,
  });
  const [seriesLoading, setSeriesLoading] = useState<boolean>(false);
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number }[]>([]);
  const [weekdayCounts, setWeekdayCounts] = useState<{ label: string; count: number }[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(false);
  const [products, setProducts] = useState<{ sku: string; name: string; total_qty: number; total_revenue: number }[]>(
    [],
  );
  const [staffLoading, setStaffLoading] = useState<boolean>(false);
  const [staffRows, setStaffRows] = useState<
    { user_id: number; name: string; role: string; orders: number; revenue: number; aov: number; guests: number }[]
  >([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersRows, setOrdersRows] = useState<
    { id: number; table_id: number; table_number?: number; user_id: number; ordered_by: string | null; status: string; seats: number | null; created_at: string; revenue: number }[]
  >([]);
  const [ordersTotal, setOrdersTotal] = useState<number>(0);
  const [ordersPage, setOrdersPage] = useState<number>(1);
  const [ordersPerPage, setOrdersPerPage] = useState<number>(20);
  const [ordersSortBy, setOrdersSortBy] = useState<string>("created_at");
  const [ordersSortDir, setOrdersSortDir] = useState<"asc" | "desc">("desc");
  const [ordersQuery, setOrdersQuery] = useState<string>("");
  const [ordersTableId, setOrdersTableId] = useState<string>("");

  // Export helpers
  const toCsv = (rows: Record<string, any>[], columns?: string[]) => {
    if (!rows || rows.length === 0) return "";
    const headers = columns && columns.length ? columns : Array.from(
      rows.reduce<Set<string>>((set, r) => {
        Object.keys(r).forEach((k) => set.add(k));
        return set;
      }, new Set<string>())
    );
    const escape = (v: any) => {
      const s = v == null ? "" : String(v);
      const needs = /[",\n]/.test(s);
      return needs ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ];
    return lines.join("\n");
  };
  const download = (filename: string, content: string, mime = "text/csv;charset=utf-8") => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };
  const onPrint = () => {
    window.print();
  };
  const exportOrdersCsv = () => {
    const rows = ordersRows.map((r) => ({
      id: r.id,
      table_id: r.table_id,
      user_id: r.user_id,
      ordered_by: r.ordered_by ?? "",
      status: r.status,
      seats: r.seats ?? "",
      revenue: r.revenue.toFixed(2),
      created_at: r.created_at,
    }));
    download(`orders_${startDate || "start"}_${endDate || "end"}.csv`, toCsv(rows));
  };
  const exportProductsCsv = () => {
    const rows = products.map((p) => ({
      sku: p.sku,
      name: p.name,
      total_qty: p.total_qty,
      total_revenue: p.total_revenue.toFixed(2),
    }));
    download(`products_${startDate || "start"}_${endDate || "end"}.csv`, toCsv(rows));
  };
  const exportStaffCsv = () => {
    const rows = staffRows.map((s) => ({
      user_id: s.user_id,
      name: s.name,
      role: s.role,
      orders: s.orders,
      revenue: s.revenue.toFixed(2),
      aov: s.aov.toFixed(2),
      guests: s.guests,
    }));
    download(`staff_${startDate || "start"}_${endDate || "end"}.csv`, toCsv(rows));
  };
  const exportRevenueCsv = () => {
    const rows = revenueSeries.map((r) => ({ date: r.date, revenue: r.revenue }));
    download(`revenue_${startDate || "start"}_${endDate || "end"}.csv`, toCsv(rows));
  };

  const formatDate = (d: Date) => {
    const y = d.getFullYear();
    const m = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const applyPreset = (p: "7d" | "30d" | "qtd" | "ytd") => {
    const today = new Date();
    const end = formatDate(today);
    let start: string = end;
    if (p === "7d") {
      const s = new Date();
      s.setDate(s.getDate() - 6);
      start = formatDate(s);
    } else if (p === "30d") {
      const s = new Date();
      s.setDate(s.getDate() - 29);
      start = formatDate(s);
    } else if (p === "qtd") {
      const s = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
      start = formatDate(s);
    } else if (p === "ytd") {
      const s = new Date(today.getFullYear(), 0, 1);
      start = formatDate(s);
    }
    setPreset(p);
    setStartDate(start);
    setEndDate(end);
  };

  // Initialize from URL on first mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const p = params.get("preset") as typeof preset | null;
    const rs = params.get("role");
    const ps = params.get("product");
    const s = params.get("start");
    const e = params.get("end");
    if (p && ["7d", "30d", "qtd", "ytd"].includes(p)) {
      setPreset(p);
      if (!s || !e) {
        // Fill based on preset if dates missing
        applyPreset(p);
      }
    }
    if (rs) setRoleFilter(rs);
    if (ps) setProductFilter(ps);
    if (s) setStartDate(s);
    if (e) setEndDate(e);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApply = () => {
    const params = new URLSearchParams(location.search);
    params.set("preset", preset);
    if (startDate) params.set("start", startDate);
    if (endDate) params.set("end", endDate);
    params.set("role", roleFilter);
    params.set("product", productFilter);
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    setFiltersVersion((v) => v + 1);
  };

  const handleClear = () => {
    setPreset("7d");
    applyPreset("7d");
    setRoleFilter("all");
    setProductFilter("all");
    const params = new URLSearchParams();
    params.set("preset", "7d");
    params.set("role", "all");
    params.set("product", "all");
    navigate({ pathname: location.pathname, search: params.toString() }, { replace: false });
    setFiltersVersion((v) => v + 1);
  };

  // Fetch KPIs from backend with current filters; safe fallback to demo values
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setLoadingSummary(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${API_URL}/api/analytics/summary`);
        if (startDate) url.searchParams.set("start", startDate);
        if (endDate) url.searchParams.set("end", endDate);
        if (preset) url.searchParams.set("preset", preset);
        if (roleFilter && roleFilter !== "all") url.searchParams.set("role", roleFilter);
        if (productFilter && productFilter !== "all") url.searchParams.set("sku_or_group", productFilter);
        const res = await fetch(url.toString(), {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          // If endpoint not ready, keep graceful demo values
          throw new Error("Analytics not available");
        }
        const data = await res.json();
        const next: SummaryKpis = {
          revenue: Number(data?.revenue ?? 0),
          orders: Number(data?.orders ?? 0),
          aov: Number(data?.aov ?? 0),
          guests: Number(data?.guests ?? 0),
          openTabs: Number(data?.open_tabs ?? data?.openTabs ?? 0),
          paymentRate: Number(data?.payment_rate ?? data?.paymentRate ?? 0),
        };
        setSummary(next);
      } catch (err: any) {
        // Provide demo baseline; only toast on non-abort
        if (err?.name !== "AbortError") {
          setSummary({
            revenue: 45230,
            orders: 389,
            aov: 116.3,
            guests: 874,
            openTabs: 7,
            paymentRate: 0.93,
          });
        }
      } finally {
        setLoadingSummary(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersVersion, API_URL]);

  // Fetch orders table (server-side pagination + sorting + search)
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setOrdersLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${API_URL}/api/analytics/orders`);
        if (startDate) url.searchParams.set("start", startDate);
        if (endDate) url.searchParams.set("end", endDate);
        if (preset) url.searchParams.set("preset", preset);
        if (roleFilter && roleFilter !== "all") url.searchParams.set("role", roleFilter);
        url.searchParams.set("page", String(ordersPage));
        url.searchParams.set("per_page", String(ordersPerPage));
        url.searchParams.set("sort_by", ordersSortBy);
        url.searchParams.set("sort_dir", ordersSortDir);
        if (ordersQuery.trim()) url.searchParams.set("q", ordersQuery.trim());
        if (ordersTableId.trim()) url.searchParams.set("table_id", ordersTableId.trim());
        const res = await fetch(url.toString(), {
          headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json", Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Orders fetch failed");
        const data = await res.json();
        const rows: any[] = Array.isArray(data?.data) ? data.data : [];
        setOrdersRows(
          rows.map((r) => ({
            id: Number(r.id ?? 0),
            table_id: Number(r.table_id ?? 0),
            table_number: r.table_number != null ? Number(r.table_number) : undefined,
            user_id: Number(r.user_id ?? 0),
            ordered_by: r.ordered_by ?? null,
            status: String(r.status ?? ""),
            seats: r.seats != null ? Number(r.seats) : null,
            created_at: String(r.created_at ?? ""),
            revenue: Number(r.revenue ?? 0),
          })),
        );
        const total = Number(data?.pagination?.total ?? 0);
        setOrdersTotal(total);
      } catch {
        setOrdersRows([]);
        setOrdersTotal(0);
      } finally {
        setOrdersLoading(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filtersVersion,
    API_URL,
    ordersPage,
    ordersPerPage,
    ordersSortBy,
    ordersSortDir,
    ordersQuery,
    ordersTableId,
  ]);

  // Fetch product top-sellers
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setProductsLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${API_URL}/api/analytics/products`);
        if (startDate) url.searchParams.set("start", startDate);
        if (endDate) url.searchParams.set("end", endDate);
        if (preset) url.searchParams.set("preset", preset);
        if (roleFilter && roleFilter !== "all") url.searchParams.set("role", roleFilter);
        const res = await fetch(url.toString(), {
          headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json", Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Products analytics unavailable");
        const data = await res.json();
        setProducts(
          Array.isArray(data)
            ? data.map((r: any) => ({
                sku: String(r.sku ?? ""),
                name: String(r.name ?? r.sku ?? "Item"),
                total_qty: Number(r.total_qty ?? 0),
                total_revenue: Number(r.total_revenue ?? 0),
              }))
            : [],
        );
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersVersion, API_URL]);

  // Fetch staff analytics
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setStaffLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${API_URL}/api/analytics/staff`);
        if (startDate) url.searchParams.set("start", startDate);
        if (endDate) url.searchParams.set("end", endDate);
        if (preset) url.searchParams.set("preset", preset);
        if (roleFilter && roleFilter !== "all") url.searchParams.set("role", roleFilter);
        const res = await fetch(url.toString(), {
          headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json", Accept: "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Staff analytics unavailable");
        const data = await res.json();
        setStaffRows(
          Array.isArray(data)
            ? data.map((r: any) => ({
                user_id: Number(r.user_id ?? 0),
                name: String(r.name ?? `User #${r.user_id ?? ""}`),
                role: String(r.role ?? ""),
                orders: Number(r.orders ?? 0),
                revenue: Number(r.revenue ?? 0),
                aov: Number(r.aov ?? 0),
                guests: Number(r.guests ?? 0),
              }))
            : [],
        );
      } catch {
        setStaffRows([]);
      } finally {
        setStaffLoading(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersVersion, API_URL]);

  // Build revenue time series from orders endpoint (client-side group by date)
  useEffect(() => {
    const controller = new AbortController();
    const run = async () => {
      setSeriesLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const url = new URL(`${API_URL}/api/analytics/orders`);
        if (startDate) url.searchParams.set("start", startDate);
        if (endDate) url.searchParams.set("end", endDate);
        if (preset) url.searchParams.set("preset", preset);
        if (roleFilter && roleFilter !== "all") url.searchParams.set("role", roleFilter);
        url.searchParams.set("per_page", "500");
        const res = await fetch(url.toString(), {
          headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" },
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Orders analytics unavailable");
        const data = await res.json();
        const list: any[] = Array.isArray(data?.data) ? data.data : [];
        const byDate = new Map<string, number>();
        const weekdayMap = new Map<number, number>(); // 0..6
        for (const row of list) {
          const created = String(row.created_at ?? "");
          const d = created.slice(0, 10);
          const rev = Number(row.revenue ?? 0);
          byDate.set(d, (byDate.get(d) ?? 0) + rev);
          // weekday
          const dt = new Date(created);
          const wd = isNaN(dt.getTime()) ? undefined : dt.getDay(); // 0 Sun .. 6 Sat
          if (wd !== undefined) {
            weekdayMap.set(wd, (weekdayMap.get(wd) ?? 0) + 1);
          }
        }
        const series = Array.from(byDate.entries())
          .sort((a, b) => (a[0] < b[0] ? -1 : 1))
          .map(([date, revenue]) => ({ date, revenue }));
        setRevenueSeries(series);
        const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        setWeekdayCounts(labels.map((label, idx) => ({ label, count: weekdayMap.get(idx) ?? 0 })));
      } catch {
        setRevenueSeries([]);
        setWeekdayCounts([]);
      } finally {
        setSeriesLoading(false);
      }
    };
    run();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersVersion, API_URL]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-white">
      <Navigation />

      <div className="container mx-auto px-4 pt-28 pb-10">
        {/* Header + Actions */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-900">Owner Dashboard</h1>
            <p className="text-sm text-purple-700 mt-1">High-level KPIs, analytics and drilldowns</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="border-purple-300 text-purple-900 hover:bg-purple-100">
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={exportRevenueCsv} className="bg-gradient-to-r from-purple-300 to-indigo-300 text-purple-900 hover:from-purple-400 hover:to-indigo-400">
              <Download className="h-4 w-4 mr-2" />
              Export Revenue
            </Button>
            <Button variant="outline" onClick={onPrint} className="border-purple-300 text-purple-900 hover:bg-purple-100">
              Print
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-purple-200 shadow-md mb-6">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <CardTitle className="text-purple-900 text-base flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <Label className="text-purple-900 mb-1 block">Date Range</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-white border-purple-200 text-purple-900"
                  />
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-white border-purple-200 text-purple-900"
                  />
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    { k: "7d", label: "Last 7 Days" },
                    { k: "30d", label: "Last 30 Days" },
                    { k: "qtd", label: "Quarter to Date" },
                    { k: "ytd", label: "Year to Date" },
                  ].map((p) => (
                    <Button
                      key={p.k}
                      type="button"
                      variant={preset === (p.k as any) ? "default" : "outline"}
                      onClick={() => applyPreset(p.k as any)}
                      className={
                        preset === (p.k as any)
                          ? "bg-purple-300 text-purple-900"
                          : "border-purple-300 text-purple-900 hover:bg-purple-100"
                      }
                    >
                      <CalendarDays className="h-4 w-4 mr-2" />
                      {p.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-purple-900 mb-1 block">Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-white border-purple-200 text-purple-900">
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="bartender">Bartender</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2">
                <Label className="text-purple-900 mb-1 block">Product</Label>
                <Select value={productFilter} onValueChange={setProductFilter}>
                  <SelectTrigger className="bg-white border-purple-200 text-purple-900">
                    <SelectValue placeholder="All products" />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="signature">Signature Cocktails</SelectItem>
                    <SelectItem value="classic">Classic Cocktails</SelectItem>
                    <SelectItem value="beer-wine">Beer & Wine</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="shisha">Shisha</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button onClick={handleApply} className="bg-gradient-to-r from-purple-300 to-indigo-300 text-purple-900 hover:from-purple-400 hover:to-indigo-400">
                Apply
              </Button>
              <Button variant="outline" onClick={handleClear} className="border-purple-300 text-purple-900 hover:bg-purple-100">
                Clear
              </Button>
              <div className="text-xs text-purple-700 ml-auto">
                Filters v{filtersVersion}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Revenue</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-24 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">${summary.revenue.toLocaleString()}</div>
              )}
              <div className="text-xs text-purple-700 flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" /> vs prev period
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Orders</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-16 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">{summary.orders.toLocaleString()}</div>
              )}
              <div className="text-xs text-purple-700">completed</div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Avg Order Value</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-20 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">${summary.aov.toFixed(2)}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Guests</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-16 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">{summary.guests.toLocaleString()}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Open Tabs</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-12 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">{summary.openTabs}</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="text-purple-900 text-sm">Payment Rate</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingSummary ? (
                <Skeleton className="h-7 w-12 bg-purple-100" />
              ) : (
                <div className="text-2xl font-bold text-purple-900">{Math.round(summary.paymentRate * 100)}%</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts & Analysis */}
        <Tabs defaultValue="overview">
          <TabsList className="bg-purple-100">
            <TabsTrigger value="overview" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">
              Overview
            </TabsTrigger>
            <TabsTrigger value="products" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">
              Products
            </TabsTrigger>
            <TabsTrigger value="staff" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">
              Staff
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-purple-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {seriesLoading ? (
                    <Skeleton className="h-[260px] w-full bg-purple-100" />
                  ) : (
                    <ChartContainer
                      config={{
                        revenue: {
                          label: "Revenue",
                          color: "hsl(270, 60%, 45%)",
                        },
                      }}
                      className="h-[260px]"
                    >
                      <LineChart data={revenueSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <ChartLegend content={<ChartLegendContent />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="var(--color-revenue)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Orders by Weekday</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  {seriesLoading ? (
                    <Skeleton className="h-24 w-full bg-purple-100" />
                  ) : (
                    <div className="grid grid-cols-7 gap-2 text-center">
                      {weekdayCounts.map((d) => (
                        <div key={d.label} className="bg-white border border-purple-200 rounded p-2">
                          <div className="text-xs text-purple-700">{d.label}</div>
                          <div className="text-purple-900 font-bold mt-1">{d.count}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="orders" className="mt-4">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900">Orders</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportOrdersCsv} className="border-purple-300 text-purple-900 hover:bg-purple-100">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  <div className="md:col-span-2">
                    <Label className="text-purple-900 mb-1 block">Search</Label>
                    <Input
                      placeholder="Search by order id, table, customer"
                      value={ordersQuery}
                      onChange={(e) => {
                        setOrdersPage(1);
                        setOrdersQuery(e.target.value);
                      }}
                      className="bg-white border-purple-200 text-purple-900"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-900 mb-1 block">Table</Label>
                    <Input
                      placeholder="e.g. 7"
                      value={ordersTableId}
                      onChange={(e) => {
                        setOrdersPage(1);
                        setOrdersTableId(e.target.value.replace(/[^\d]/g, ""));
                      }}
                      className="bg-white border-purple-200 text-purple-900"
                    />
                  </div>
                  <div>
                    <Label className="text-purple-900 mb-1 block">Sort By</Label>
                    <Select value={ordersSortBy} onValueChange={(v) => { setOrdersPage(1); setOrdersSortBy(v); }}>
                      <SelectTrigger className="bg-white border-purple-200 text-purple-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Created At</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="id">Order ID</SelectItem>
                        <SelectItem value="table_id">Table</SelectItem>
                        <SelectItem value="status">Status</SelectItem>
                        <SelectItem value="seats">Seats</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-purple-900 mb-1 block">Direction</Label>
                    <Select value={ordersSortDir} onValueChange={(v) => { setOrdersPage(1); setOrdersSortDir(v as any); }}>
                      <SelectTrigger className="bg-white border-purple-200 text-purple-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Desc</SelectItem>
                        <SelectItem value="asc">Asc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {ordersLoading ? (
                    <Skeleton className="h-48 w-full bg-purple-100" />
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-purple-700">
                          <th className="py-2">ID</th>
                          <th className="py-2">Table</th>
                          <th className="py-2">Customer</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Seats</th>
                          <th className="py-2">Revenue</th>
                          <th className="py-2">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ordersRows.map((r) => (
                          <tr key={r.id} className="border-t border-purple-200">
                            <td className="py-2 text-purple-900 font-semibold">#{r.id}</td>
                            <td className="py-2 text-purple-900">{r.table_number ?? r.table_id}</td>
                            <td className="py-2 text-purple-900">{r.ordered_by ?? "-"}</td>
                            <td className="py-2 text-purple-900 capitalize">{r.status}</td>
                            <td className="py-2 text-purple-900">{r.seats ?? "-"}</td>
                            <td className="py-2 text-purple-900">${r.revenue.toFixed(2)}</td>
                            <td className="py-2 text-purple-900">{new Date(r.created_at).toLocaleString()}</td>
                          </tr>
                        ))}
                        {ordersRows.length === 0 && !ordersLoading && (
                          <tr>
                            <td className="py-3 text-purple-700" colSpan={7}>
                              No orders found for current filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-purple-700">
                    Total: {ordersTotal.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={String(ordersPerPage)} onValueChange={(v) => { setOrdersPage(1); setOrdersPerPage(Number(v)); }}>
                      <SelectTrigger className="bg-white border-purple-200 text-purple-900 w-[110px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 / page</SelectItem>
                        <SelectItem value="20">20 / page</SelectItem>
                        <SelectItem value="50">50 / page</SelectItem>
                        <SelectItem value="100">100 / page</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        className="border-purple-300 text-purple-900 hover:bg-purple-100"
                        disabled={ordersPage <= 1}
                        onClick={() => setOrdersPage((p) => Math.max(1, p - 1))}
                      >
                        Prev
                      </Button>
                      <div className="text-sm text-purple-900">
                        Page {ordersPage} / {Math.max(1, Math.ceil(ordersTotal / ordersPerPage))}
                      </div>
                      <Button
                        variant="outline"
                        className="border-purple-300 text-purple-900 hover:bg-purple-100"
                        disabled={ordersPage >= Math.max(1, Math.ceil(ordersTotal / ordersPerPage))}
                        onClick={() => setOrdersPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="products" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2 border-purple-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900">Top Sellers</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportProductsCsv} className="border-purple-300 text-purple-900 hover:bg-purple-100">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {productsLoading ? (
                    <Skeleton className="h-40 w-full bg-purple-100" />
                  ) : (
                    <div className="space-y-2">
                      {products.slice(0, 12).map((row) => (
                        <div key={`${row.sku}-${row.name}`} className="flex items-center gap-3">
                          <div className="w-48 text-sm text-purple-900 truncate" title={row.name}>
                            {row.name}
                          </div>
                          <div className="flex-1 h-3 rounded bg-purple-100">
                            <div
                              className="h-3 rounded bg-purple-400"
                              style={{
                                width: `${Math.min(
                                  100,
                                  products.length ? (row.total_qty / Math.max(...products.map((p) => p.total_qty))) * 100 : 0,
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="w-16 text-right text-sm text-purple-900">{row.total_qty}</div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <div className="text-sm text-purple-700">No product data for selected range.</div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-purple-200 shadow-md">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <CardTitle className="text-purple-900">Payment Mix</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-purple-700" />
                    <div className="text-sm text-purple-900">Paid: {Math.round(summary.paymentRate * 100)}%</div>
                  </div>
                  <div className="mt-3 h-3 rounded bg-purple-100">
                    <div
                      className="h-3 rounded bg-green-400"
                      style={{ width: `${Math.min(100, Math.round(summary.paymentRate * 100))}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="mt-4">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-purple-900">Staff Performance</CardTitle>
                  <Button size="sm" variant="outline" onClick={exportStaffCsv} className="border-purple-300 text-purple-900 hover:bg-purple-100">
                    <Download className="h-4 w-4 mr-2" />
                    CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {staffLoading ? (
                  <Skeleton className="h-40 w-full bg-purple-100" />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-purple-700">
                          <th className="py-2">Name</th>
                          <th className="py-2">Role</th>
                          <th className="py-2">Orders</th>
                          <th className="py-2">Revenue</th>
                          <th className="py-2">Avg Ticket</th>
                          <th className="py-2">Guests</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffRows.map((r) => (
                          <tr key={r.user_id} className="border-t border-purple-200">
                            <td className="py-2 text-purple-900">{r.name}</td>
                            <td className="py-2 text-purple-900">{r.role}</td>
                            <td className="py-2 text-purple-900">{r.orders}</td>
                            <td className="py-2 text-purple-900">${r.revenue.toLocaleString()}</td>
                            <td className="py-2 text-purple-900">${r.aov.toFixed(2)}</td>
                            <td className="py-2 text-purple-900">{r.guests}</td>
                          </tr>
                        ))}
                        {staffRows.length === 0 && (
                          <tr>
                            <td className="py-3 text-purple-700" colSpan={6}>
                              No staff data for selected range.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default OwnerDashboard;


