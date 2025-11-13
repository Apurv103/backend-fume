import { useEffect, useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Eye, LayoutDashboard, DollarSign, Users, Clock, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";

interface OrderItemRow {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  tableNumber: number;
  customerName: string;
  seats: number;
  items: OrderItemRow[];
  total: number;
  isPaid: boolean;
  server: string;
  timestamp: string;
}

// No local mock fallback; we always show live data (or an empty state)

const ManagerDashboard = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [summary, setSummary] = useState<{ totalOrders: number; paidOrders: number; unpaidOrders: number; totalRevenue: number; pendingRevenue: number; totalGuests: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<keyof Order | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const API_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

  const parseBackendOrder = (o: any): Order => {
    const items: OrderItemRow[] = Array.isArray(o.items)
      ? o.items.map((it: any) => ({
          name: String(it.name ?? it.sku ?? "Item"),
          quantity: Number(it.qty ?? it.quantity ?? 0),
          price: Number(it.price ?? 0),
        }))
      : [];
    const total = items.reduce((s, it) => s + it.price * it.quantity, 0);
    return {
      id: String(o.id),
      tableNumber: Number(o.table_id ?? 0),
      customerName: String(o.ordered_by ?? "Guest"),
      seats: Number(o.seats ?? 0),
      items,
      total,
      isPaid: String(o.status) === "paid",
      server: String(o.user?.name ?? "Server"),
      timestamp: new Date(o.created_at).toLocaleString(),
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Not authenticated");
      const [ordersRes, sumRes] = await Promise.all([
        fetch(`${API_URL}/api/orders?limit=100`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/orders/summary`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const ordersJson = await ordersRes.json();
      const sumJson = await sumRes.json();
      const dataArray = Array.isArray(ordersJson?.data) ? ordersJson.data : [];
      setOrders(dataArray.map(parseBackendOrder));
      if (sumJson && typeof sumJson === "object") setSummary(sumJson);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => { fetchData(); }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNumber.toString().includes(searchQuery) ||
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const sortedOrders = useMemo(() => {
    if (!sortBy) return filteredOrders;
    const copy = [...filteredOrders];
    copy.sort((a, b) => {
      const av = a[sortBy] as any;
      const bv = b[sortBy] as any;
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      const as = String(av);
      const bs = String(bv);
      return sortDir === "asc" ? as.localeCompare(bs) : bs.localeCompare(as);
    });
    return copy;
  }, [filteredOrders, sortBy, sortDir]);

  const pageCount = Math.max(1, Math.ceil(sortedOrders.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const pagedOrders = useMemo(() => {
    const start = currentPage * pageSize;
    return sortedOrders.slice(start, start + pageSize);
  }, [sortedOrders, currentPage, pageSize]);

  const renderSortableHead = (label: string, key: keyof Order) => {
    const isActive = sortBy === key;
    const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
    return (
      <button
        className="inline-flex items-center gap-1 text-purple-900 hover:text-purple-700"
        onClick={() => {
          if (sortBy !== key) {
            setSortBy(key);
            setSortDir("asc");
          } else {
            setSortDir(sortDir === "asc" ? "desc" : "asc");
          }
        }}
      >
        <span>{label}</span>
        <Icon className="h-3.5 w-3.5" />
      </button>
    );
  };

  const togglePaymentStatus = (orderId: string) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, isPaid: !order.isPaid } : order
      )
    );
  };

  const unpaidOrders = orders.filter((o) => !o.isPaid);
  const totalRevenue = summary?.totalRevenue ?? orders.filter((o) => o.isPaid).reduce((sum, o) => sum + o.total, 0);
  const pendingRevenue = summary?.pendingRevenue ?? unpaidOrders.reduce((sum, o) => sum + o.total, 0);
  const totalGuests = summary?.totalGuests ?? orders.reduce((sum, o) => sum + o.seats, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-white">
      <Navigation />

      {/* Header */}
      <header className="bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900 py-4 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-purple-700">{loading ? "Loading orders…" : `Showing ${orders.length} orders`}</p>
          <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-100" onClick={fetchData}>Refresh</Button>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-purple-100 to-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-900">
                <Users className="h-4 w-4" />
                Active Tables
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-900">{orders.length}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-purple-100 to-indigo-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-purple-900">
                <Clock className="h-4 w-4" />
                Unpaid Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-900">{unpaidOrders.length}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-green-100 to-emerald-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-emerald-900">
                <DollarSign className="h-4 w-4" />
                Paid Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-emerald-900">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 shadow-md bg-gradient-to-br from-orange-100 to-amber-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-900">
                <DollarSign className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-900">${pendingRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-purple-200 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-1">Total Guests</p>
                <p className="text-2xl font-bold text-purple-900">{totalGuests}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-1">Avg. Order Value</p>
                <p className="text-2xl font-bold text-purple-900">
                  {orders.length > 0 ? `$${((totalRevenue + pendingRevenue) / orders.length).toFixed(2)}` : "0.00"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-purple-200 shadow-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-purple-600 mb-1">Payment Rate</p>
                <p className="text-2xl font-bold text-purple-900">
                  {orders.length > 0 ? Math.round(((orders.length - unpaidOrders.length) / orders.length) * 100) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="border-purple-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-900">All Orders</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-purple-400" />
                <Input
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setPageIndex(0); }}
                  className="pl-8 border-purple focus-visible:ring-2 focus-visible:ring-purple-300 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto rounded-lg border border-purple-200">
              <Table className="bg-white divide-y divide-purple-100">
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="text-purple-900">{renderSortableHead("Order ID", "id")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Table", "tableNumber")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Customer", "customerName")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Seats", "seats")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Server", "server")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Total", "total")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Status", "isPaid")}</TableHead>
                    <TableHead className="text-purple-900">{renderSortableHead("Time", "timestamp")}</TableHead>
                    <TableHead className="text-right text-purple-900">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pagedOrders.map((order) => (
                    <TableRow key={order.id} className="border-purple-100 bg-white even:bg-gray-50 hover:bg-gray-50">
                      <TableCell className="font-medium text-purple-900">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="text-purple-700 hover:text-purple-900 hover:underline transition-colors">
                              {order.id}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="border-purple-200">
                            <DialogHeader>
                              <DialogTitle className="text-purple-900">Order Details - {order.id}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p className="text-purple-600">Customer</p>
                                  <p className="font-medium text-purple-900">{order.customerName}</p>
                                </div>
                                <div>
                                  <p className="text-purple-600">Table</p>
                                  <p className="font-medium text-purple-900">Table {order.tableNumber}</p>
                                </div>
                                <div>
                                  <p className="text-purple-600">Seats</p>
                                  <p className="font-medium text-purple-900">{order.seats}</p>
                                </div>
                                <div>
                                  <p className="text-purple-600">Server</p>
                                  <p className="font-medium text-purple-900">{order.server}</p>
                                </div>
                              </div>
                              <div>
                                <p className="text-sm text-purple-600 mb-2 font-semibold">Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm border-b border-purple-100 pb-2 bg-purple-50 p-2 rounded">
                                      <span className="text-purple-900">
                                        {item.name} <span className="text-purple-600">x{item.quantity}</span>
                                      </span>
                                      <span className="font-semibold text-purple-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-purple-300 text-purple-900">
                                <span>Total</span>
                                <span>${order.total.toFixed(2)}</span>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-purple-300 text-purple-700">
                          Table {order.tableNumber}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-purple-900">{order.customerName}</TableCell>
                      <TableCell className="text-purple-900">{order.seats}</TableCell>
                      <TableCell className="text-purple-900">{order.server}</TableCell>
                      <TableCell className="font-semibold text-purple-900">${order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge className={order.isPaid ? "bg-green-200 text-green-900 hover:bg-green-300" : "bg-amber-200 text-amber-900 hover:bg-amber-300"}>
                          {order.isPaid ? "Paid" : "Unpaid"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-purple-700">{order.timestamp}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedOrder(order)}
                                className="border-purple-300 text-purple-700 hover:bg-purple-100"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="border-purple-200">
                              <DialogHeader>
                                <DialogTitle className="text-purple-900">Order Details - {selectedOrder?.id}</DialogTitle>
                              </DialogHeader>
                              {selectedOrder && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <p className="text-purple-600">Customer</p>
                                      <p className="font-medium text-purple-900">{selectedOrder.customerName}</p>
                                    </div>
                                    <div>
                                      <p className="text-purple-600">Table</p>
                                      <p className="font-medium text-purple-900">Table {selectedOrder.tableNumber}</p>
                                    </div>
                                    <div>
                                      <p className="text-purple-600">Seats</p>
                                      <p className="font-medium text-purple-900">{selectedOrder.seats}</p>
                                    </div>
                                    <div>
                                      <p className="text-purple-600">Server</p>
                                      <p className="font-medium text-purple-900">{selectedOrder.server}</p>
                                    </div>
                                  </div>
                                  <div>
                                    <p className="text-sm text-purple-600 mb-2 font-semibold">Items</p>
                                    <div className="space-y-2">
                                      {selectedOrder.items.map((item, index) => (
                                        <div key={index} className="flex justify-between text-sm border-b border-purple-100 pb-2 bg-purple-50 p-2 rounded">
                                          <span className="text-purple-900">
                                            {item.name} <span className="text-purple-600">x{item.quantity}</span>
                                          </span>
                                          <span className="font-semibold text-purple-900">
                                            ${(item.price * item.quantity).toFixed(2)}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg pt-2 border-t-2 border-purple-300 text-purple-900">
                                    <span>Total</span>
                                    <span>${selectedOrder.total.toFixed(2)}</span>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant={order.isPaid ? "outline" : "default"}
                            size="sm"
                            onClick={async () => {
                              try {
                                const token = localStorage.getItem("authToken");
                                if (!token) throw new Error("Not authenticated");
                                const next = order.isPaid ? "pending" : "paid";
                                const res = await fetch(`${API_URL}/api/orders/${order.id}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                                  body: JSON.stringify({ status: next }),
                                });
                                if (!res.ok) throw new Error("Failed to update");
                                togglePaymentStatus(order.id);
                              } catch {
                                // noop; UI not updated
                              }
                            }}
                            className={order.isPaid ? "border-amber-300 text-amber-700 hover:bg-amber-50" : "bg-white border border-emerald-300 text-emerald-900 hover:bg-emerald-50"}
                          >
                            {order.isPaid ? "Mark Unpaid" : "Mark Paid"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pagedOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10 text-purple-700">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-purple-700">
                Page {currentPage + 1} of {pageCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-purple-300"
                  onClick={() => setPageIndex(0)}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-purple-300"
                  onClick={() => setPageIndex(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-purple-300"
                  onClick={() => setPageIndex(Math.min(pageCount - 1, currentPage + 1))}
                  disabled={currentPage >= pageCount - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-purple-300"
                  onClick={() => setPageIndex(pageCount - 1)}
                  disabled={currentPage >= pageCount - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <select
                  className="ml-2 h-9 rounded-md border border-purple-200 bg-white px-2 text-sm text-purple-900"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPageIndex(0);
                  }}
                >
                  {[10, 20, 25, 30, 40, 50].map((n) => (
                    <option key={n} value={n}>{n} / page</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default ManagerDashboard;


