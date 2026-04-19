import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { QrCode, LogOut, ShoppingCart, TrendingUp, Plus, MessageCircle, UtensilsCrossed, Trash2 } from 'lucide-react';
import {
  findRestaurantById,
  getOrdersForRestaurant,
  getMenuForRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem as deleteMenuItemStore,
  updateOrderStatus,
  getAssignmentsForRestaurant,
  assignQR,
} from '@/store/localStore';
import type { MenuCategory, MenuItem, OrderStatus } from '@/types';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import AssignmentModal from '@/components/AssignmentModal';

const STATUS_OPTIONS: OrderStatus[] = ['Received', 'Preparing', 'Cooking', 'Prepared', 'Completed'];

export default function RestaurantDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('orders');
  const [showQR, setShowQR] = useState<number | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState<{ name: string; category: MenuCategory; price: string; isVeg: boolean }>({ name: '', category: 'Starters', price: '', isVeg: true });
  const [assignTable, setAssignTable] = useState<number | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = () => setRefreshTick(t => t + 1);

  const restaurantId = sessionStorage.getItem('restaurantId');
  const restaurantName = sessionStorage.getItem('restaurantName');

  const restaurant = useMemo(() => restaurantId ? findRestaurantById(restaurantId) : undefined, [restaurantId, refreshTick]);
  const orders = useMemo(() => restaurantId ? getOrdersForRestaurant(restaurantId) : [], [restaurantId, refreshTick]);
  const menuItems = useMemo<MenuItem[]>(() => restaurantId ? getMenuForRestaurant(restaurantId) : [], [restaurantId, refreshTick]);
  const assignments = useMemo(() => restaurantId ? getAssignmentsForRestaurant(restaurantId) : {}, [restaurantId, refreshTick]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const dailySales = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => {
      const d = new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
      map.set(d, (map.get(d) || 0) + o.total);
    });
    return Array.from(map.entries()).slice(0, 14).map(([date, amount]) => ({ date, amount }));
  }, [orders]);

  const topItems = useMemo(() => {
    const map = new Map<string, number>();
    orders.forEach(o => o.items.forEach(it => map.set(it.name, (map.get(it.name) || 0) + it.quantity)));
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, count]) => ({ name, count }));
  }, [orders]);

  if (!restaurantId) { navigate('/restaurant/login'); return null; }

  const handleStatusUpdate = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    refresh();
    toast.success(`Order ${orderId} → ${status}`);
  };

  const toggleAvailability = (item: MenuItem) => {
    updateMenuItem(restaurantId, item.id, { isAvailable: !item.isAvailable });
    refresh();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantId) return;
    addMenuItem({
      id: `${restaurantId}_menu_${Date.now()}`,
      restaurantId,
      name: newItem.name,
      category: newItem.category,
      price: parseInt(newItem.price, 10),
      description: '',
      isAvailable: true,
      isVeg: newItem.isVeg,
    });
    setShowAddItem(false);
    setNewItem({ name: '', category: 'Starters', price: '', isVeg: true });
    refresh();
    toast.success('Item added!');
  };

  const handleDeleteItem = (itemId: string) => {
    deleteMenuItemStore(restaurantId, itemId);
    refresh();
    toast.success('Item deleted');
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground truncate max-w-[200px]">{restaurantName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem('restaurantId'); sessionStorage.removeItem('restaurantName'); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Orders', value: orders.length, icon: ShoppingCart },
            { label: 'Revenue', value: `₹${(totalRevenue / 1000).toFixed(0)}K`, icon: TrendingUp },
            { label: 'Menu Items', value: menuItems.length, icon: UtensilsCrossed },
            { label: 'Tables', value: restaurant?.tables || 0, icon: QrCode },
          ].map((s) => (
            <Card key={s.label}><CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            </CardContent></Card>
          ))}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="qr">QR Codes</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Orders */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="text-center py-12"><CardContent>
                <ShoppingCart className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No orders yet. Orders placed via QR will appear here.</p>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Table</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {orders.slice(0, 50).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.id}</TableCell>
                          <TableCell>T-{o.tableNumber}</TableCell>
                          <TableCell>{o.customerName}</TableCell>
                          <TableCell className="text-sm max-w-[200px] truncate">{o.items.map(i => `${i.name}×${i.quantity}`).join(', ')}</TableCell>
                          <TableCell className="font-medium">₹{o.total}</TableCell>
                          <TableCell><Badge variant={o.status === 'Completed' ? 'default' : 'secondary'}>{o.status}</Badge></TableCell>
                          <TableCell>
                            <Select value={o.status} onValueChange={(v) => handleStatusUpdate(o.id, v as OrderStatus)}>
                              <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* Menu */}
          <TabsContent value="menu">
            <div className="flex justify-end mb-4">
              <Button className="gradient-primary text-primary-foreground" onClick={() => setShowAddItem(true)}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>
            {menuItems.length === 0 ? (
              <Card className="text-center py-12"><CardContent>
                <UtensilsCrossed className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No menu items yet. Click "Add Item" to start building your menu.</p>
              </CardContent></Card>
            ) : (
              <Card><CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Available</TableHead>
                      <TableHead>Delete</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {menuItems.map((m) => (
                        <TableRow key={m.id} className={!m.isAvailable ? 'opacity-50' : ''}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell><Badge variant="secondary">{m.category}</Badge></TableCell>
                          <TableCell>₹{m.price}</TableCell>
                          <TableCell><Switch checked={m.isAvailable} onCheckedChange={() => toggleAvailability(m)} /></TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(m.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent></Card>
            )}
          </TabsContent>

          {/* QR Codes */}
          <TabsContent value="qr">
            <Card className="mb-4">
              <CardContent className="pt-6 text-sm text-muted-foreground">
                Each table can either use a unique URL QR (auto-generated below) or be linked to a printed claim QR via <strong className="text-foreground">"Assign QR"</strong> (camera scan).
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: restaurant?.tables || 0 }).map((_, i) => {
                const tableNo = i + 1;
                const assigned = assignments[tableNo];
                return (
                  <Card key={tableNo} className="text-center card-hover">
                    <CardContent className="pt-6">
                      <div onClick={() => setShowQR(tableNo)} className="cursor-pointer">
                        <QRCodeSVG value={`${baseUrl}/order/${restaurantId}/${tableNo}`} size={100} className="mx-auto" />
                        <p className="mt-3 text-sm font-medium text-foreground">Table {tableNo}</p>
                      </div>
                      {assigned ? (
                        <Badge variant="secondary" className="mt-2 text-[10px] font-mono">
                          ✓ {assigned.id.slice(0, 6)}…
                        </Badge>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1">No claim QR linked</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full"
                        onClick={() => setAssignTable(tableNo)}
                      >
                        <QrCode className="h-3.5 w-3.5 mr-1" />
                        {assigned ? 'Reassign' : 'Assign QR'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Daily Sales</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={dailySales}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                      <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                      <YAxis fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="hsl(220,70%,50%)" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Top Items</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={topItems} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                      <XAxis type="number" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                      <YAxis type="category" dataKey="name" fontSize={11} width={110} tick={{ fill: 'hsl(220,10%,45%)' }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(168,60%,45%)" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* QR Enlarge Dialog */}
      <Dialog open={showQR !== null} onOpenChange={() => setShowQR(null)}>
        <DialogContent className="text-center max-w-sm">
          <DialogHeader>
            <DialogTitle>Table {showQR} QR Code</DialogTitle>
            <DialogDescription>{restaurantName}</DialogDescription>
          </DialogHeader>
          {showQR && (
            <div className="py-4">
              <QRCodeSVG value={`${baseUrl}/order/${restaurantId}/${showQR}`} size={220} className="mx-auto" />
              <p className="text-xs text-muted-foreground mt-4 break-all">{baseUrl}/order/{restaurantId}/{showQR}</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate(`/order/${restaurantId}/${showQR}`)}>
                Open Customer View
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Menu Item</DialogTitle>
            <DialogDescription>Add a new item to your menu</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddItem} className="space-y-4">
            <div><Label>Item Name</Label><Input value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} required /></div>
            <div>
              <Label>Category</Label>
              <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v as MenuCategory })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Starters">Starters</SelectItem>
                  <SelectItem value="Main Course">Main Course</SelectItem>
                  <SelectItem value="Beverages">Beverages</SelectItem>
                  <SelectItem value="Desserts">Desserts</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Price (₹)</Label><Input type="number" value={newItem.price} onChange={(e) => setNewItem({ ...newItem, price: e.target.value })} required /></div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isVeg">Vegetarian</Label>
              <Switch id="isVeg" checked={newItem.isVeg} onCheckedChange={(v) => setNewItem({ ...newItem, isVeg: v })} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Item</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Scan-to-assign modal */}
      <AssignmentModal
        open={assignTable !== null}
        tableNumber={assignTable}
        restaurantId={restaurantId}
        onClose={() => setAssignTable(null)}
        onAssign={async (rId, table, qrId) => { await assignQR(rId, table, qrId); refresh(); }}
      />
    </div>
  );
}
