import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { QrCode, Store, ShoppingCart, Users, TrendingUp, LogOut, Search, MessageCircle, Plus, Eye, Power, Trash2 } from 'lucide-react';
import {
  getRestaurants, setRestaurants, getOrders, getCustomers, getLeads, addLead,
  getRegisteredRestaurants, addRegisteredRestaurant, setRegisteredRestaurants,
  getRegisteredOrders, generateMenuForRestaurant,
  type Restaurant, type Lead
} from '@/data/mockData';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';

const CHART_COLORS = ['hsl(220,70%,50%)', 'hsl(200,80%,55%)', 'hsl(168,60%,45%)', 'hsl(45,90%,50%)', 'hsl(280,60%,55%)'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', gst: '', city: 'Bikaner' as 'Bikaner' | 'Jodhpur', tables: '6' });
  const [showQRDialog, setShowQRDialog] = useState<Restaurant | null>(null);
  const [selectedQRTable, setSelectedQRTable] = useState<number | null>(null);
  const [showOrdersDialog, setShowOrdersDialog] = useState<Restaurant | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState<Restaurant | null>(null);

  const adminUser = sessionStorage.getItem('adminUser');
  const isDemoAdmin = adminUser === 'admin1';

  // Demo admin sees mock data, live admin sees only registered restaurants
  const [mockRestaurantList, setMockRestaurantList] = useState(() => isDemoAdmin ? getRestaurants() : []);
  const [registeredList, setRegisteredList] = useState(() => getRegisteredRestaurants());

  const restaurantList = isDemoAdmin ? mockRestaurantList : registeredList;

  const orders = useMemo(() => isDemoAdmin ? getOrders() : getRegisteredOrders(), [isDemoAdmin]);
  const customers = useMemo(() => isDemoAdmin ? getCustomers() : [], [isDemoAdmin]);
  const leads = useMemo(() => isDemoAdmin ? getLeads() : [], [isDemoAdmin]);

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);

  const dailySales = useMemo(() => {
    const map = new Map<string, number>();
    orders.slice(0, 500).forEach(o => {
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

  const cityDistribution = useMemo(() => {
    const bik = restaurantList.filter(r => r.city === 'Bikaner').length;
    const jod = restaurantList.filter(r => r.city === 'Jodhpur').length;
    return [{ name: 'Bikaner', value: bik }, { name: 'Jodhpur', value: jod }];
  }, [restaurantList]);

  // Menu state for admin menu viewing/deleting
  const [menuItems, setMenuItems] = useState<ReturnType<typeof generateMenuForRestaurant>>([]);

  if (!adminUser) { navigate('/admin/login'); return null; }

  const filteredRestaurants = restaurantList.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newRest: Restaurant = {
      id: `rest_reg_${Date.now()}`,
      name: regForm.name,
      phone: regForm.phone,
      gst: regForm.gst || undefined,
      city: regForm.city,
      area: regForm.city === 'Bikaner' ? 'Station Road' : 'Sardarpura',
      address: `${regForm.city}, Rajasthan`,
      tables: parseInt(regForm.tables) || 6,
      username: `rest_${Date.now()}`,
      password: 'password123',
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    if (isDemoAdmin) {
      const updated = [newRest, ...mockRestaurantList];
      setMockRestaurantList(updated);
      setRestaurants(updated);
    } else {
      addRegisteredRestaurant(newRest);
      setRegisteredList([...getRegisteredRestaurants()]);
    }

    toast.success(`Restaurant "${regForm.name}" registered! Login: ${newRest.username} / password123`);
    setShowRegister(false);
    setRegForm({ name: '', phone: '', gst: '', city: 'Bikaner', tables: '6' });
  };

  const toggleRestaurantStatus = (restId: string) => {
    if (isDemoAdmin) {
      const updated = mockRestaurantList.map(r => r.id === restId ? { ...r, isActive: !r.isActive } : r);
      setMockRestaurantList(updated);
      setRestaurants(updated);
      const r = updated.find(r => r.id === restId);
      toast.success(`${r?.name} ${r?.isActive ? 'activated' : 'deactivated'}`);
    } else {
      const updated = registeredList.map(r => r.id === restId ? { ...r, isActive: !r.isActive } : r);
      setRegisteredList(updated);
      setRegisteredRestaurants(updated);
      const r = updated.find(r => r.id === restId);
      toast.success(`${r?.name} ${r?.isActive ? 'activated' : 'deactivated'}`);
    }
  };

  const getRestaurantOrders = (restId: string) => {
    return orders.filter(o => o.restaurantId === restId);
  };

  const openMenuDialog = (r: Restaurant) => {
    setShowMenuDialog(r);
    setMenuItems(generateMenuForRestaurant(r.id));
  };

  const deleteMenuItem = (itemId: string) => {
    setMenuItems(prev => prev.filter(m => m.id !== itemId));
    toast.success('Menu item deleted');
  };

  const baseUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">QRServe Admin</span>
            {isDemoAdmin && <Badge variant="secondary" className="text-xs">Demo</Badge>}
            {!isDemoAdmin && <Badge variant="outline" className="text-xs">Live</Badge>}
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem('adminUser'); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {!isDemoAdmin && (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <p className="text-sm text-foreground">You're logged in as <strong>admin</strong> (live mode). Register restaurants, generate QR codes, and manage the platform. Only real registered data will appear here. Login as <strong>admin1</strong> to see demo data.</p>
            </CardContent>
          </Card>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            {isDemoAdmin && <TabsTrigger value="customers">Customers</TabsTrigger>}
            {isDemoAdmin && <TabsTrigger value="leads">Leads</TabsTrigger>}
            {isDemoAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Restaurants', value: restaurantList.length, icon: Store, color: 'text-primary' },
                { label: 'Active', value: restaurantList.filter(r => r.isActive).length, icon: Power, color: 'text-accent' },
                { label: 'Total Orders', value: orders.length.toLocaleString(), icon: ShoppingCart, color: 'text-info' },
                { label: 'Revenue', value: totalRevenue > 0 ? `₹${(totalRevenue / 100000).toFixed(1)}L` : '₹0', icon: TrendingUp, color: 'text-success' },
              ].map((s) => (
                <Card key={s.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
                      </div>
                      <s.icon className={`h-8 w-8 ${s.color} opacity-70`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {isDemoAdmin && dailySales.length > 0 && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Daily Sales (Last 14 Days)</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                        <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <YAxis fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <Tooltip />
                        <Bar dataKey="amount" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">City Distribution</CardTitle></CardHeader>
                  <CardContent className="flex justify-center">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={cityDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                          {cityDistribution.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i]} />))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {!isDemoAdmin && restaurantList.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">No restaurants yet</h3>
                  <p className="text-muted-foreground mt-1">Register your first restaurant to get started.</p>
                  <Button className="mt-4 gradient-primary text-primary-foreground" onClick={() => { setTab('restaurants'); setShowRegister(true); }}>
                    <Plus className="h-4 w-4 mr-1" /> Register Restaurant
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Restaurants */}
          <TabsContent value="restaurants">
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input className="pl-9" placeholder="Search restaurants..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Button className="gradient-primary text-primary-foreground" onClick={() => setShowRegister(true)}>
                <Plus className="h-4 w-4 mr-1" /> Register
              </Button>
            </div>
            {filteredRestaurants.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">{!isDemoAdmin ? 'No restaurants registered yet. Click "Register" to add one.' : 'No restaurants match your search.'}</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>City</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Tables</TableHead>
                          <TableHead>Login</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRestaurants.slice(0, 25).map((r) => (
                          <TableRow key={r.id} className={!r.isActive ? 'opacity-60' : ''}>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell>{r.city}</TableCell>
                            <TableCell className="text-sm">{r.phone}</TableCell>
                            <TableCell>{r.tables}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.username}</TableCell>
                            <TableCell>
                              <Switch checked={r.isActive} onCheckedChange={() => toggleRestaurantStatus(r.id)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setShowQRDialog(r)} title="QR Codes">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowOrdersDialog(r)} title="View Orders">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => openMenuDialog(r)} title="View Menu">
                                  <Store className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground p-4">Showing {Math.min(25, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            {orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No orders yet. Orders will appear here when customers place them.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Items</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.slice(0, 30).map((o) => {
                          const rest = restaurantList.find(r => r.id === o.restaurantId);
                          return (
                            <TableRow key={o.id}>
                              <TableCell className="font-mono text-xs">{o.id}</TableCell>
                              <TableCell className="text-sm">{rest?.name || o.restaurantId}</TableCell>
                              <TableCell>{o.customerName}</TableCell>
                              <TableCell className="text-sm">{o.items.length} items</TableCell>
                              <TableCell className="font-medium">₹{o.total}</TableCell>
                              <TableCell>
                                <Badge variant={o.status === 'Completed' ? 'default' : 'secondary'}>{o.status}</Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Customers (demo only) */}
          {isDemoAdmin && (
            <TabsContent value="customers">
              <div className="flex gap-3 mb-4">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => toast.success('WhatsApp broadcast sent to all customers!')}>
                  <MessageCircle className="h-4 w-4" /> Broadcast to All
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Orders</TableHead>
                          <TableHead>Spent</TableHead>
                          <TableHead>Birthday</TableHead>
                          <TableHead>Tag</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customers.slice(0, 30).map((c) => (
                          <TableRow key={c.id}>
                            <TableCell className="font-medium">{c.name}</TableCell>
                            <TableCell className="text-sm">{c.mobile}</TableCell>
                            <TableCell>{c.orderCount}</TableCell>
                            <TableCell>₹{c.totalSpent.toLocaleString()}</TableCell>
                            <TableCell className="text-sm">{c.birthDay && c.birthMonth ? `${c.birthDay}/${c.birthMonth}` : '-'}</TableCell>
                            <TableCell>
                              <Badge variant={c.tag === 'Frequent' ? 'default' : 'secondary'}>{c.tag}</Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Leads (demo only) */}
          {isDemoAdmin && (
            <TabsContent value="leads">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Restaurant</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Mobile</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {leads.map((l) => (
                          <TableRow key={l.id}>
                            <TableCell className="font-medium">{l.restaurantName}</TableCell>
                            <TableCell>{l.contactName}</TableCell>
                            <TableCell>{l.mobile}</TableCell>
                            <TableCell><Badge variant={l.status === 'New' ? 'default' : 'secondary'}>{l.status}</Badge></TableCell>
                            <TableCell className="text-sm text-muted-foreground">{new Date(l.createdAt).toLocaleDateString('en-IN')}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Analytics (demo only) */}
          {isDemoAdmin && (
            <TabsContent value="analytics">
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Most Ordered Items</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topItems} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                        <XAxis type="number" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <YAxis type="category" dataKey="name" fontSize={11} width={120} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(168,60%,45%)" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-base">Order Trend</CardTitle></CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={dailySales}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                        <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <YAxis fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="amount" stroke="hsl(220,70%,50%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </div>

      {/* Register Restaurant Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Register Restaurant</DialogTitle>
            <DialogDescription>Add a new restaurant to the platform</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Restaurant Name</Label><Input value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} required /></div>
            <div><Label>Phone</Label><Input value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required /></div>
            <div><Label>GST (Optional)</Label><Input value={regForm.gst} onChange={(e) => setRegForm({ ...regForm, gst: e.target.value })} /></div>
            <div><Label>Number of Tables</Label><Input type="number" value={regForm.tables} onChange={(e) => setRegForm({ ...regForm, tables: e.target.value })} required min="1" /></div>
            <div>
              <Label>City</Label>
              <Select value={regForm.city} onValueChange={(v) => setRegForm({ ...regForm, city: v as 'Bikaner' | 'Jodhpur' })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bikaner">Bikaner</SelectItem>
                  <SelectItem value="Jodhpur">Jodhpur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Register</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Codes Dialog */}
      <Dialog open={showQRDialog !== null} onOpenChange={() => { setShowQRDialog(null); setSelectedQRTable(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>QR Codes — {showQRDialog?.name}</DialogTitle>
            <DialogDescription>{showQRDialog?.tables} tables · {showQRDialog?.city}</DialogDescription>
          </DialogHeader>
          {selectedQRTable !== null && showQRDialog ? (
            <div className="text-center py-4">
              <QRCodeSVG value={`${baseUrl}/order/${showQRDialog.id}/${selectedQRTable}`} size={200} className="mx-auto" />
              <p className="text-sm font-medium text-foreground mt-3">Table {selectedQRTable}</p>
              <p className="text-xs text-muted-foreground mt-1 break-all">{baseUrl}/order/{showQRDialog.id}/{selectedQRTable}</p>
              <div className="flex gap-2 justify-center mt-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedQRTable(null)}>Back</Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/order/${showQRDialog.id}/${selectedQRTable}`)}>Open Customer View</Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
              {showQRDialog && Array.from({ length: showQRDialog.tables }).map((_, i) => (
                <Card key={i} className="text-center card-hover cursor-pointer" onClick={() => setSelectedQRTable(i + 1)}>
                  <CardContent className="p-3">
                    <QRCodeSVG value={`${baseUrl}/order/${showQRDialog.id}/${i + 1}`} size={60} className="mx-auto" />
                    <p className="text-xs font-medium text-foreground mt-2">Table {i + 1}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restaurant Orders Dialog */}
      <Dialog open={showOrdersDialog !== null} onOpenChange={() => setShowOrdersDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Orders — {showOrdersDialog?.name}</DialogTitle>
            <DialogDescription>{showOrdersDialog?.city}</DialogDescription>
          </DialogHeader>
          {showOrdersDialog && (
            <div className="max-h-[400px] overflow-y-auto">
              {(() => {
                const restOrders = getRestaurantOrders(showOrdersDialog.id);
                if (restOrders.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No orders found for this restaurant.</p>;
                return (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Table</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {restOrders.slice(0, 20).map(o => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.id}</TableCell>
                          <TableCell>T-{o.tableNumber}</TableCell>
                          <TableCell>{o.customerName}</TableCell>
                          <TableCell className="font-medium">₹{o.total}</TableCell>
                          <TableCell><Badge variant={o.status === 'Completed' ? 'default' : 'secondary'}>{o.status}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Restaurant Menu Dialog */}
      <Dialog open={showMenuDialog !== null} onOpenChange={() => setShowMenuDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Menu — {showMenuDialog?.name}</DialogTitle>
            <DialogDescription>View and manage menu items</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Delete</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {menuItems.map(m => (
                  <TableRow key={m.id} className={!m.isAvailable ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{m.name}</TableCell>
                    <TableCell><Badge variant="secondary">{m.category}</Badge></TableCell>
                    <TableCell>₹{m.price}</TableCell>
                    <TableCell>{m.isAvailable ? 'Available' : 'Unavailable'}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => deleteMenuItem(m.id)} className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
