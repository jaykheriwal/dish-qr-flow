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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { QrCode, Store, ShoppingCart, Users, TrendingUp, LogOut, Search, Phone, MessageCircle, Plus } from 'lucide-react';
import { getRestaurants, getOrders, getCustomers, getLeads, addLead, type Restaurant, type Lead } from '@/data/mockData';
import { toast } from 'sonner';

const CHART_COLORS = ['hsl(220,70%,50%)', 'hsl(200,80%,55%)', 'hsl(168,60%,45%)', 'hsl(45,90%,50%)', 'hsl(280,60%,55%)'];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [regForm, setRegForm] = useState({ name: '', phone: '', gst: '', city: 'Bikaner' as 'Bikaner' | 'Jodhpur' });

  const restaurants = useMemo(() => getRestaurants(), []);
  const orders = useMemo(() => getOrders(), []);
  const customers = useMemo(() => getCustomers(), []);
  const leads = useMemo(() => getLeads(), []);

  const adminUser = sessionStorage.getItem('adminUser');
  if (!adminUser) { navigate('/admin/login'); return null; }

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const todayOrders = orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString());

  // Analytics data
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
    const bik = restaurants.filter(r => r.city === 'Bikaner').length;
    const jod = restaurants.filter(r => r.city === 'Jodhpur').length;
    return [{ name: 'Bikaner', value: bik }, { name: 'Jodhpur', value: jod }];
  }, [restaurants]);

  const filteredRestaurants = restaurants.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase())
  );

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(`Restaurant "${regForm.name}" registered!`);
    setShowRegister(false);
    setRegForm({ name: '', phone: '', gst: '', city: 'Bikaner' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-6 w-6 text-primary" />
            <span className="font-bold text-foreground">QRServe Admin</span>
            {adminUser === 'admin1' && <Badge variant="secondary" className="text-xs">Demo</Badge>}
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
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="leads">Leads</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Restaurants', value: restaurants.length, icon: Store, color: 'text-primary' },
                { label: 'Total Orders', value: orders.length.toLocaleString(), icon: ShoppingCart, color: 'text-accent' },
                { label: 'Customers', value: customers.length, icon: Users, color: 'text-info' },
                { label: 'Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-success' },
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRestaurants.slice(0, 25).map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.name}</TableCell>
                          <TableCell>{r.city}</TableCell>
                          <TableCell className="text-sm">{r.phone}</TableCell>
                          <TableCell>{r.tables}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.username}</TableCell>
                          <TableCell><Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground p-4">Showing 25 of {filteredRestaurants.length} restaurants</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders */}
          <TabsContent value="orders">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 30).map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="font-mono text-xs">{o.id}</TableCell>
                          <TableCell>{o.customerName}</TableCell>
                          <TableCell className="text-sm">{o.items.length} items</TableCell>
                          <TableCell className="font-medium">₹{o.total}</TableCell>
                          <TableCell>
                            <Badge variant={o.status === 'Completed' ? 'default' : 'secondary'}>{o.status}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">{new Date(o.createdAt).toLocaleDateString('en-IN')}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers */}
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

          {/* Leads */}
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

          {/* Analytics */}
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
    </div>
  );
}
