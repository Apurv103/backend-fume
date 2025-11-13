import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { foodMenu, drinksMenu, shishaMenu, MenuItem } from "@/data/menuData";
import { useToast } from "@/hooks/use-toast";

interface OrderItem extends MenuItem {
  quantity: number;
  selectedFlavor?: string;
}

const ServerWorkspace = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customerName, setCustomerName] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [seatCount, setSeatCount] = useState("");
  // New items being staged in this session (not yet merged)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  // Items already on the existing open tab (loaded from backend)
  const [existingItems, setExistingItems] = useState<OrderItem[]>([]);
  const [openOrderId, setOpenOrderId] = useState<number | null>(null);
  const [comments, setComments] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [tableTakenMessage, setTableTakenMessage] = useState<string | null>(null);
  const API_URL = (import.meta as any).env?.VITE_API_URL || "http://127.0.0.1:8000";

  const addItem = (item: MenuItem, flavor?: string) => {
    const existingItem = orderItems.find(
      (oi) => oi.id === item.id && oi.selectedFlavor === flavor
    );
    if (existingItem) {
      setOrderItems(
        orderItems.map((oi) =>
          oi.id === item.id && oi.selectedFlavor === flavor
            ? { ...oi, quantity: oi.quantity + 1 }
            : oi
        )
      );
    } else {
      setOrderItems([...orderItems, { ...item, quantity: 1, selectedFlavor: flavor }]);
    }
  };

  const updateQuantity = (id: string, flavor: string | undefined, delta: number) => {
    setOrderItems((items) =>
      items
        .map((item) =>
          item.id === id && item.selectedFlavor === flavor
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const existingSubtotal = existingItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;
  const combinedTotal = existingSubtotal + subtotal + (existingSubtotal + subtotal) * 0.1;

  const handlePlaceOrder = async () => {
    if (!selectedTable) {
      toast({ title: "Missing table", description: "Please select a table number.", variant: "destructive" });
      return;
    }
    if (orderItems.length === 0) {
      toast({ title: "No items", description: "Add at least one item to place an order.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      const payload = {
        table_id: Number(selectedTable),
        ordered_by: customerName || undefined,
        seats: seatCount ? Number(seatCount) : undefined,
        items: orderItems.map((it) => ({
          sku: it.id,
          name: it.name,
          qty: it.quantity,
          price: it.price,
          flavor: it.selectedFlavor,
        })),
        notes: comments || undefined,
      };
      const res = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (res.status === 409) {
          throw new Error(data?.message || "Table has an open bill awaiting payment.");
        }
        throw new Error(data?.message || "Failed to place order");
      }
      const data = await res.json();
      // Update UI from backend's merged order
      const items = Array.isArray(data?.items) ? data.items as any[] : [];
      const mapped: OrderItem[] = items.map((it: any) => ({
        id: String(it.sku ?? it.id ?? ''),
        name: String(it.name ?? it.sku ?? 'Item'),
        price: Number(it.price ?? 0),
        quantity: Number(it.qty ?? it.quantity ?? 0),
        selectedFlavor: it.flavor ?? undefined,
        category: undefined,
      }));
      {
        const idNum = Number(data?.id);
        setOpenOrderId(Number.isFinite(idNum) && idNum > 0 ? idNum : null);
      }
      // Merged list becomes the new "existing" items; clear staged items
      setExistingItems(mapped);
      setOrderItems([]);
      toast({ title: "Order placed", description: "Items appended to the existing tab." });
      setOrderPlaced(true);
    } catch (err: any) {
      toast({ title: "Order failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  // Load open tab for selected table
  const loadOpenTab = async (tableId: number) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;
      const url = new URL(`${API_URL}/api/orders/open`);
      url.searchParams.set("table_id", String(tableId));
      const res = await fetch(url.toString(), { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        if (res.status === 409) {
          // Table has an open tab by another server
          setTableTakenMessage("This table has an open tab with another server.");
          setOpenOrderId(null);
          setExistingItems([]);
          setOrderPlaced(false);
          toast({ title: "Table taken", description: "This table’s tab is owned by another server.", variant: "destructive" });
        }
        return;
      }
      setTableTakenMessage(null);
      const data = await res.json();
      if (!data || data?.id == null) {
        setOpenOrderId(null);
        setExistingItems([]);
        setOrderPlaced(false);
        return;
      }
      {
        const idNum = Number(data?.id);
        if (!Number.isFinite(idNum) || idNum <= 0) {
          setOpenOrderId(null);
          setExistingItems([]);
          setOrderPlaced(false);
          return;
        }
        setOpenOrderId(idNum);
      }
      const items = Array.isArray(data?.items) ? data.items as any[] : [];
      const mapped: OrderItem[] = items.map((it: any) => ({
        id: String(it.sku ?? it.id ?? ''),
        name: String(it.name ?? it.sku ?? 'Item'),
        price: Number(it.price ?? 0),
        quantity: Number(it.qty ?? it.quantity ?? 0),
        selectedFlavor: it.flavor ?? undefined,
        category: undefined,
      }));
      // Hydrate existing items; keep staged items empty on table switch
      setExistingItems(mapped);
      setOrderPlaced(true);
    } catch {
      // ignore
    }
  };

  // When table changes, try to hydrate open tab
  useEffect(() => {
    if (selectedTable) {
      // Clear staged items when switching tables
      setOrderItems([]);
      loadOpenTab(Number(selectedTable));
    } else {
      setOpenOrderId(null);
      setExistingItems([]);
      setOrderItems([]);
      setOrderPlaced(false);
      setTableTakenMessage(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTable]);

  const handleCheckout = async () => {
    if (!openOrderId) return;
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Not authenticated");
      }
      const res = await fetch(`${API_URL}/api/orders/${openOrderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "paid" }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || "Failed to settle bill");
      }
      toast({ title: "Payment recorded", description: "Tab settled successfully." });
      setOpenOrderId(null);
      setOrderItems([]);
      setOrderPlaced(false);
    } catch (err: any) {
      toast({ title: "Checkout failed", description: err?.message ?? "Please try again.", variant: "destructive" });
    }
  };
  const groupByCategory = (items: MenuItem[]) => {
    return items.reduce((acc, item) => {
      const cat = item.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-gray-50 to-white">
      <Navigation />

      <header className="bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900 py-4 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Server Workspace</h1>
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span className="font-semibold">{orderItems.length} new</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-purple-900">Customer Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div>
                  <Label htmlFor="customerName" className="text-purple-200">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name"
                    className="bg-white border-purple-200 focus:border-purple-500 text-purple-900 placeholder:text-purple-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="table" className="text-purple-200">Table Number</Label>
                    <Select value={selectedTable} onValueChange={setSelectedTable}>
                      <SelectTrigger id="table" className="bg-white border-purple-200 text-purple-900">
                        <SelectValue placeholder="Select table" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={`${num}`}>Table {num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {tableTakenMessage && (
                      <p className="mt-2 text-sm text-red-600">{tableTakenMessage}</p>
                    )}
                    {openOrderId && !tableTakenMessage && existingItems.length > 0 && (
                      <p className="mt-2 text-sm text-green-700">Open tab loaded for this table.</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="seats" className="text-purple-200">Number of Seats</Label>
                    <Input
                      id="seats"
                      type="number"
                      min="1"
                      value={seatCount}
                      onChange={(e) => setSeatCount(e.target.value)}
                      placeholder="Seats"
                      className="bg-white border-purple-200 focus:border-purple-100 text-purple-900 placeholder:text-purple-400"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-purple-900">Menu</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="food">
                  <TabsList className="grid w-full grid-cols-3 bg-purple-100">
                    <TabsTrigger value="food" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">Food</TabsTrigger>
                    <TabsTrigger value="drinks" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">Drinks</TabsTrigger>
                    <TabsTrigger value="shisha" className="data-[state=active]:bg-purple-300 data-[state=active]:text-purple-900">Shisha</TabsTrigger>
                  </TabsList>

                  <TabsContent value="food" className="space-y-4 mt-4 max-h-[600px] overflow-y-auto">
                    {Object.entries(groupByCategory(foodMenu)).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="font-bold text-purple-200 mb-2 text-lg">{category}</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors bg-white">
                              <div className="flex-1">
                                <p className="font-semibold text-purple-900">{item.name}</p>
                                {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                                <p className="text-sm font-bold text-purple-600">${item.price.toFixed(2)}</p>
                              </div>
                              <Button size="sm" onClick={() => addItem(item)} className="bg-white border border-purple-300 text-purple-900 hover:bg-purple-50">
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="drinks" className="space-y-4 mt-4 max-h-[600px] overflow-y-auto">
                    {Object.entries(groupByCategory(drinksMenu)).map(([category, items]) => (
                      <div key={category}>
                        <h3 className="font-bold text-purple-200 mb-2 text-lg">{category}</h3>
                        <div className="space-y-2">
                          {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors bg-white">
                              <div className="flex-1">
                                <p className="font-semibold text-purple-900">{item.name}</p>
                                {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                                <p className="text-sm font-bold text-purple-600">${item.price.toFixed(2)}</p>
                              </div>
                              <Button size="sm" onClick={() => addItem(item)} className="bg-white border border-purple-300 text-purple-900 hover:bg-purple-50">
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="shisha" className="space-y-2 mt-4 max-h-[600px] overflow-y-auto">
                    {shishaMenu.map((item) => (
                      <div key={item.id} className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-purple-600">{item.name}</p>
                            {item.description && <p className="text-xs text-gray-600">{item.description}</p>}
                            <p className="text-sm font-bold text-purple-600 mt-1">${item.price.toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-purple-900 mb-1">Select Flavor:</Label>
                          <Select onValueChange={(flavor) => addItem(item, flavor)}>
                            <SelectTrigger className="border-purple-200">
                              <SelectValue placeholder="Choose flavor & add" />
                            </SelectTrigger>
                            <SelectContent className="max-h-64">
                              {item.flavors?.map((flavor) => (
                                <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="border-purple-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <CardTitle className="text-purple-900">Special Requests</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <Textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Add any special requests or notes..."
                  rows={3}
                  className="bg-white border-purple-200 focus:border-purple-500 text-purple-900 placeholder:text-purple-400"
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24 border-purple-300 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-200 to-indigo-200 text-purple-900">
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {/* Existing tab items */}
                {existingItems.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-purple-800 mb-2">Existing Tab Items</p>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
                      {existingItems.map((item, index) => (
                        <div key={`existing-${item.id}-${item.selectedFlavor || ""}-${index}`} className="bg-white rounded-lg p-3 border border-purple-200">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-purple-900 text-sm">{item.name}</p>
                              {item.selectedFlavor && <p className="text-xs text-purple-700">{item.selectedFlavor}</p>}
                              <p className="text-xs text-purple-600">x{item.quantity}</p>
                            </div>
                            <p className="font-semibold text-purple-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm text-purple-900 mt-2">
                      <span>Existing Subtotal:</span>
                      <span className="font-semibold">${existingSubtotal.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-purple-200 my-4" />
                  </div>
                )}

                {/* New items being staged */}
                <div>
                  <p className="text-sm font-semibold text-purple-800 mb-2">New Items</p>
                  {orderItems.length === 0 ? (
                    <div className="text-center py-6">
                      <ShoppingCart className="h-10 w-10 mx-auto text-purple-300 mb-2" />
                      <p className="text-purple-600">No new items added</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {orderItems.map((item, index) => (
                        <div key={`${item.id}-${item.selectedFlavor || ""}-${index}`} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="font-semibold text-purple-900 text-sm">{item.name}</p>
                              {item.selectedFlavor && (
                                <p className="text-xs text-purple-700 bg-purple-100 inline-block px-2 py-0.5 rounded mt-1">{item.selectedFlavor}</p>
                              )}
                            </div>
                            <p className="font-bold text-purple-900">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 justify-end">
                            <Button size="icon" variant="outline" className="h-7 w-7 border-purple-300 hover:bg-purple-100" onClick={() => updateQuantity(item.id, item.selectedFlavor, -1)}>
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold text-purple-900">{item.quantity}</span>
                            <Button size="icon" variant="outline" className="h-7 w-7 border-purple-300 hover:bg-purple-100" onClick={() => updateQuantity(item.id, item.selectedFlavor, 1)}>
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totals for new items and combined hint */}
                <div className="space-y-2 pt-4 border-t-2 border-purple-200">
                  <div className="flex justify-between text-sm text-purple-900">
                    <span>New Subtotal:</span>
                    <span className="font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-purple-900">
                    <span>Tax on New (10%):</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  {existingItems.length > 0 && (
                    <div className="text-xs text-purple-700">
                      Note: Combined total (existing + new) will be reflected in the tab after placing.
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <Button className="w-full bg-gradient-to-r from-purple-300 to-indigo-300 hover:from-purple-400 hover:to-indigo-400 text-purple-900 font-bold" size="lg" onClick={handlePlaceOrder} disabled={submitting || orderItems.length === 0 || !!tableTakenMessage}>
                    {openOrderId ? "Append to Tab" : "Place Order"}
                  </Button>
                  <Button className="w-full bg-gradient-to-r from-green-300 to-emerald-300 hover:from-green-400 hover:to-emerald-400 text-green-900 font-bold" size="lg" onClick={handleCheckout} disabled={!openOrderId}>
                    Settle Bill
                  </Button>
                </div>

                {openOrderId && (
                  <div className="text-xs text-purple-700 text-center">
                    Tab #{openOrderId} {existingItems.length > 0 ? `| Existing items: ${existingItems.length}` : ''}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ServerWorkspace;



