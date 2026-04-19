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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { QrCode, Store, ShoppingCart, TrendingUp, LogOut, Search, Plus, Eye, Power, Trash2, Users, Sparkles } from 'lucide-react';
import {
  getRestaurants,
  addRestaurant,
  updateRestaurant,
  buildRestaurant,
  getOrders,
  getOrdersForRestaurant,
  getMenuForRestaurant,
  deleteMenuItem,
  getLeads,
  updateLeadStatus,
  getQRCodes,
  generateQRBatch,
} from '@/store/localStore';
import { PLANS, type Restaurant, type PlanType, type City } from '@/types';
import { toast } from 'sonner';
import { QRCodeSVG } from 'qrcode.react';
import QRGrid from '@/components/QRGrid';

const CHART_COLORS = ['hsl(220,70%,50%)', 'hsl(200,80%,55%)', 'hsl(168,60%,45%)', 'hsl(45,90%,50%)', 'hsl(280,60%,55%)'];

interface RegisterForm {
  name: string;
  phone: string;
  gst: string;
  city: City;
  tables: string;
  username: string;
  password: string;
  plan: PlanType;
}

const EMPTY_FORM: RegisterForm = {
  name: '', phone: '', gst: '', city: 'Bikaner', tables: '6',
  username: '', password: '', plan: 'trial',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState<RegisterForm>(EMPTY_FORM);
  const [showQRDialog, setShowQRDialog] = useState<Restaurant | null>(null);
  const [selectedQRTable, setSelectedQRTable] = useState<number | null>(null);
  const [showOrdersDialog, setShowOrdersDialog] = useState<Restaurant | null>(null);
  const [showMenuDialog, setShowMenuDialog] = useState<Restaurant | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const refresh = () => setRefreshTick(t => t + 1);

  const adminUser = sessionStorage.getItem('adminUser');

  const restaurantList = useMemo(() => getRestaurants(), [refreshTick]);
  const orders = useMemo(() => getOrders(), [refreshTick]);
  const leads = useMemo(() => getLeads(), [refreshTick]);
  const qrCodes = useMemo(() => getQRCodes(), [refreshTick]);

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

  // Currently-shown menu (when admin opens a restaurant's menu dialog)
  const adminMenuItems = useMemo(
    () => showMenuDialog ? getMenuForRestaurant(showMenuDialog.id) : [],
    [showMenuDialog, refreshTick],
  );

  if (!adminUser) { navigate('/admin/login'); return null; }

  const filteredRestaurants = restaurantList.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.username || !regForm.password) {
      toast.error('Username and password are required');
      return;
    }
    const newRest = buildRestaurant({
      name: regForm.name,
      phone: regForm.phone,
      gst: regForm.gst,
      city: regForm.city,
      tables: parseInt(regForm.tables, 10) || 6,
      username: regForm.username,
      password: regForm.password,
      plan: regForm.plan,
    });
    addRestaurant(newRest);
    refresh();
    const planLabel = PLANS[regForm.plan].label;
    toast.success(`"${regForm.name}" registered on ${planLabel}. Login: ${newRest.username}`);
    setShowRegister(false);
    setRegForm(EMPTY_FORM);
  };

  const toggleRestaurantStatus = (r: Restaurant) => {
    const updated = updateRestaurant(r.id, { isActive: !r.isActive });
    refresh();
    toast.success(`${updated?.name} ${updated?.isActive ? 'activated' : 'deactivated'}`);
  };

  const addMoreTables = () => {
    if (!showQRDialog) return;
    const addCount = parseInt(prompt('How many tables to add?') || '0', 10);
    if (addCount <= 0) return;
    const updated = updateRestaurant(showQRDialog.id, { tables: showQRDialog.tables + addCount });
    refresh();
    if (updated) setShowQRDialog(updated);
    toast.success(`Added ${addCount} tables. Total: ${updated?.tables}`);
  };

  const handleDeleteMenuItem = (restaurantId: string, itemId: string) => {
    deleteMenuItem(restaurantId, itemId);
    refresh();
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
            <Badge variant="outline" className="text-xs">{adminUser}</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => { sessionStorage.removeItem('adminUser'); navigate('/'); }}>
            <LogOut className="h-4 w-4 mr-1" /> Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="leads">
              Leads {leads.filter(l => l.status === 'New').length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">{leads.filter(l => l.status === 'New').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="qrsheet">QR Sheet</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
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

            {restaurantList.length === 0 ? (
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
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-base">Daily Sales (Last 14 Days)</CardTitle></CardHeader>
                  <CardContent>
                    {dailySales.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-12">No sales yet.</p>
                    ) : (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={dailySales}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                          <XAxis dataKey="date" fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                          <YAxis fontSize={11} tick={{ fill: 'hsl(220,10%,45%)' }} />
                          <Tooltip />
                          <Bar dataKey="amount" fill="hsl(220,70%,50%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
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
                  <p className="text-muted-foreground">No restaurants registered yet. Click "Register" to add one.</p>
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
                          <TableHead>Plan</TableHead>
                          <TableHead>Tables</TableHead>
                          <TableHead>Login</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRestaurants.slice(0, 50).map((r) => (
                          <TableRow key={r.id} className={!r.isActive ? 'opacity-60' : ''}>
                            <TableCell className="font-medium">{r.name}</TableCell>
                            <TableCell>{r.city}</TableCell>
                            <TableCell className="text-sm">{r.phone}</TableCell>
                            <TableCell>
                              <Badge variant={r.plan === 'pro' ? 'default' : 'secondary'} className="text-xs">
                                {r.plan === 'trial' ? 'Trial' : r.plan === 'basic' ? '₹999' : '₹1999'}
                              </Badge>
                            </TableCell>
                            <TableCell>{r.tables}</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{r.username}</TableCell>
                            <TableCell>
                              <Switch checked={r.isActive} onCheckedChange={() => toggleRestaurantStatus(r)} />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" onClick={() => setShowQRDialog(r)} title="QR Codes">
                                  <QrCode className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowOrdersDialog(r)} title="View Orders">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => setShowMenuDialog(r)} title="View Menu">
                                  <Store className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-xs text-muted-foreground p-4">Showing {Math.min(50, filteredRestaurants.length)} of {filteredRestaurants.length} restaurants</p>
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
                        {orders.slice(0, 50).map((o) => {
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

          {/* Leads */}
          <TabsContent value="leads">
            {leads.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No leads yet. Demo requests from the landing page will show up here.</p>
                </CardContent>
              </Card>
            ) : (
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
                          <TableHead>Action</TableHead>
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
                            <TableCell>
                              <Select value={l.status} onValueChange={(v) => { updateLeadStatus(l.id, v as 'New' | 'Contacted' | 'Converted'); refresh(); }}>
                                <SelectTrigger className="w-[130px] h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="New">New</SelectItem>
                                  <SelectItem value="Contacted">Contacted</SelectItem>
                                  <SelectItem value="Converted">Converted</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Bulk QR Sheet — print claim QRs in batches */}
          <TabsContent value="qrsheet">
            <Card className="mb-4 no-print">
              <CardContent className="pt-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> Bulk QR Generator
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Generate a batch of unique claim QRs to print and stick on tables.
                    Restaurants link each printed QR to a table from their dashboard.
                  </p>
                </div>
                <div className="flex gap-2">
                  {[20, 40, 100].map(n => (
                    <Button
                      key={n}
                      variant="outline"
                      onClick={() => { generateQRBatch(n); refresh(); toast.success(`Generated ${n} new QR codes`); }}
                    >
                      +{n}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
            <QRGrid codes={qrCodes} title={`All QR Codes (${qrCodes.length})`} />
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            {orders.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <p className="text-muted-foreground">Analytics will appear once you have order data.</p>
                </CardContent>
              </Card>
            ) : (
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
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Register Restaurant Dialog */}
      <Dialog open={showRegister} onOpenChange={setShowRegister}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register Restaurant</DialogTitle>
            <DialogDescription>Add a new restaurant and choose a plan</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegister} className="space-y-4">
            <div><Label>Restaurant Name</Label><Input value={regForm.name} onChange={(e) => setRegForm({ ...regForm, name: e.target.value })} required /></div>
            <div><Label>Phone</Label><Input value={regForm.phone} onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })} required /></div>
            <div><Label>GST (Optional)</Label><Input value={regForm.gst} onChange={(e) => setRegForm({ ...regForm, gst: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>City</Label>
                <Select value={regForm.city} onValueChange={(v) => setRegForm({ ...regForm, city: v as City })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bikaner">Bikaner</SelectItem>
                    <SelectItem value="Jodhpur">Jodhpur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Number of Tables</Label><Input type="number" value={regForm.tables} onChange={(e) => setRegForm({ ...regForm, tables: e.target.value })} required min="1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Login Username</Label><Input value={regForm.username} onChange={(e) => setRegForm({ ...regForm, username: e.target.value })} required placeholder="rest_xyz" /></div>
              <div><Label>Login Password</Label><Input value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required /></div>
            </div>

            <div>
              <Label className="mb-2 block">Subscription Plan</Label>
              <RadioGroup
                value={regForm.plan}
                onValueChange={(v) => setRegForm({ ...regForm, plan: v as PlanType })}
                className="grid gap-2"
              >
                {(['trial', 'basic', 'pro'] as PlanType[]).map(p => {
                  const plan = PLANS[p];
                  return (
                    <label key={p} htmlFor={`plan-${p}`} className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${regForm.plan === p ? 'border-primary bg-primary/5' : 'border-border'}`}>
                      <RadioGroupItem value={p} id={`plan-${p}`} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground text-sm">{plan.label}</span>
                          <span className="text-xs text-muted-foreground">{plan.durationDays} days</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {p === 'trial' && 'Full access, no payment required'}
                          {p === 'basic' && 'Standard features for single outlet'}
                          {p === 'pro' && 'All features + priority support'}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Register on {PLANS[regForm.plan].label}</Button>
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
            <>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[350px] overflow-y-auto">
                {showQRDialog && Array.from({ length: showQRDialog.tables }).map((_, i) => (
                  <Card key={i} className="text-center card-hover cursor-pointer" onClick={() => setSelectedQRTable(i + 1)}>
                    <CardContent className="p-3">
                      <QRCodeSVG value={`${baseUrl}/order/${showQRDialog.id}/${i + 1}`} size={60} className="mx-auto" />
                      <p className="text-xs font-medium text-foreground mt-2">Table {i + 1}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={addMoreTables}>
                <Plus className="h-4 w-4 mr-2" /> Add More Tables
              </Button>
            </>
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
          {showOrdersDialog && (() => {
            const restOrders = getOrdersForRestaurant(showOrdersDialog.id);
            if (restOrders.length === 0) {
              return <p className="text-sm text-muted-foreground py-4 text-center">No orders found for this restaurant.</p>;
            }
            return (
              <div className="max-h-[400px] overflow-y-auto">
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
                    {restOrders.slice(0, 30).map(o => (
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
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Restaurant Menu Dialog */}
      <Dialog open={showMenuDialog !== null} onOpenChange={() => setShowMenuDialog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Menu — {showMenuDialog?.name}</DialogTitle>
            <DialogDescription>View and remove menu items</DialogDescription>
          </DialogHeader>
          {showMenuDialog && adminMenuItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No menu items yet.</p>
          ) : (
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
                  {adminMenuItems.map(m => (
                    <TableRow key={m.id} className={!m.isAvailable ? 'opacity-50' : ''}>
                      <TableCell className="font-medium">{m.name}</TableCell>
                      <TableCell><Badge variant="secondary">{m.category}</Badge></TableCell>
                      <TableCell>₹{m.price}</TableCell>
                      <TableCell>{m.isAvailable ? 'Available' : 'Unavailable'}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => showMenuDialog && handleDeleteMenuItem(showMenuDialog.id, m.id)} className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
