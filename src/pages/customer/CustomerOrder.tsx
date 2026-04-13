import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { QrCode, ShoppingCart, Plus, Minus, Trash2, ArrowLeft, CheckCircle, Clock, Flame, ChefHat } from 'lucide-react';
import { findRestaurantById, generateMenuForRestaurant } from '@/data/mockData';
import { toast } from 'sonner';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

const statusIcons: Record<string, any> = {
  'Received': Clock,
  'Preparing': ChefHat,
  'Cooking': Flame,
  'Prepared': CheckCircle,
  'Completed': CheckCircle,
};

export default function CustomerOrder() {
  const { restaurantId, tableNumber } = useParams();
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({ name: '', mobile: '', birthDay: '', birthMonth: '' });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderStatus, setOrderStatus] = useState<string>('Received');
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const restaurant = useMemo(() => restaurantId ? findRestaurantById(restaurantId) : undefined, [restaurantId]);
  const menuItems = useMemo(() => restaurantId ? generateMenuForRestaurant(restaurantId) : [], [restaurantId]);

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center p-8">
          <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-foreground">Restaurant not found</h2>
          <p className="text-muted-foreground mt-2">Please scan a valid QR code.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/')}>Go Home</Button>
        </Card>
      </div>
    );
  }

  const categories = ['All', ...Array.from(new Set(menuItems.map(m => m.category)))];
  const filteredMenu = activeCategory === 'All' ? menuItems : menuItems.filter(m => m.category === activeCategory);

  const addToCart = (item: typeof menuItems[0]) => {
    if (!item.isAvailable) return;
    setCart(prev => {
      const existing = prev.find(c => c.id === item.id);
      if (existing) return prev.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, category: item.category }];
    });
    toast.success(`${item.name} added`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(c => c.id === id ? { ...c, quantity: Math.max(0, c.quantity + delta) } : c).filter(c => c.quantity > 0));
  };

  const cartTotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const cartCount = cart.reduce((s, c) => s + c.quantity, 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerInfo.name || !customerInfo.mobile) {
      toast.error('Please fill name and mobile');
      return;
    }
    setShowCheckout(false);
    setOrderPlaced(true);
    toast.success('Order placed successfully!');
    // Simulate status updates
    setTimeout(() => setOrderStatus('Preparing'), 3000);
    setTimeout(() => setOrderStatus('Cooking'), 8000);
    setTimeout(() => setOrderStatus('Prepared'), 15000);
  };

  if (orderPlaced) {
    const StatusIcon = statusIcons[orderStatus] || Clock;
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-8">
            <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
              <StatusIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Order {orderStatus}!</h2>
            <p className="text-muted-foreground mt-2">Table {tableNumber} · {restaurant.name}</p>
          </div>

          {/* Status Timeline */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              {['Received', 'Preparing', 'Cooking', 'Prepared', 'Completed'].map((s, i, arr) => {
                const currentIdx = arr.indexOf(orderStatus);
                const isComplete = i <= currentIdx;
                const isCurrent = i === currentIdx;
                return (
                  <div key={s} className="flex items-center gap-3 mb-3 last:mb-0">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${isComplete ? 'gradient-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} ${isCurrent ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                      {i + 1}
                    </div>
                    <span className={`text-sm ${isComplete ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-foreground mb-3">Your Order</h3>
              {cart.map((c) => (
                <div key={c.id} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground">{c.name} × {c.quantity}</span>
                  <span className="text-muted-foreground">₹{c.price * c.quantity}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-foreground mt-3 pt-2 border-t border-border">
                <span>Total</span>
                <span>₹{cartTotal}</span>
              </div>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full mt-4" onClick={() => { setOrderPlaced(false); setCart([]); }}>
            Add More Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-primary text-primary-foreground p-4 pb-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg">{restaurant.name}</h1>
              <p className="text-sm opacity-80">Table {tableNumber} · {restaurant.city}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-3">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'gradient-primary text-primary-foreground' : 'bg-card text-muted-foreground border border-border'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu */}
        <div className="space-y-3">
          {filteredMenu.map((item) => {
            const inCart = cart.find(c => c.id === item.id);
            return (
              <Card key={item.id} className={`overflow-hidden ${!item.isAvailable ? 'opacity-50' : ''}`}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className={`h-4 w-4 border-2 ${item.isVeg ? 'border-success' : 'border-destructive'} flex items-center justify-center`}>
                        <div className={`h-2 w-2 rounded-full ${item.isVeg ? 'bg-success' : 'bg-destructive'}`} />
                      </div>
                      <span className="font-medium text-foreground text-sm truncate">{item.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{item.description}</p>
                    <p className="font-semibold text-foreground mt-1">₹{item.price}</p>
                    {!item.isAvailable && <Badge variant="secondary" className="text-xs mt-1">Unavailable</Badge>}
                  </div>
                  <div className="ml-3">
                    {inCart ? (
                      <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.id, -1)} className="h-7 w-7 flex items-center justify-center rounded text-primary"><Minus className="h-4 w-4" /></button>
                        <span className="text-sm font-medium text-foreground w-5 text-center">{inCart.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="h-7 w-7 flex items-center justify-center rounded text-primary"><Plus className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" disabled={!item.isAvailable} onClick={() => addToCart(item)} className="text-primary border-primary">
                        <Plus className="h-4 w-4 mr-1" /> Add
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 glass">
          <div className="max-w-md mx-auto">
            <Button className="w-full gradient-primary text-primary-foreground h-12 text-base" onClick={() => setShowCheckout(true)}>
              <ShoppingCart className="mr-2 h-5 w-5" />
              {cartCount} item{cartCount > 1 ? 's' : ''} · ₹{cartTotal}
              <span className="ml-auto">Place Order →</span>
            </Button>
          </div>
        </div>
      )}

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
            <DialogDescription>Table {tableNumber} · {restaurant.name}</DialogDescription>
          </DialogHeader>
          <div className="max-h-[200px] overflow-y-auto mb-4">
            {cart.map((c) => (
              <div key={c.id} className="flex justify-between items-center py-2 border-b border-border">
                <div>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">× {c.quantity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">₹{c.price * c.quantity}</span>
                  <button onClick={() => updateQuantity(c.id, -c.quantity)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
            <div className="flex justify-between font-semibold text-foreground mt-2 pt-2">
              <span>Total</span><span>₹{cartTotal}</span>
            </div>
          </div>
          <form onSubmit={handlePlaceOrder} className="space-y-3">
            <div><Label>Name *</Label><Input value={customerInfo.name} onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })} required placeholder="Your name" /></div>
            <div><Label>Mobile Number *</Label><Input value={customerInfo.mobile} onChange={(e) => setCustomerInfo({ ...customerInfo, mobile: e.target.value })} required placeholder="10-digit mobile" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Birth Day</Label><Input type="number" min={1} max={31} value={customerInfo.birthDay} onChange={(e) => setCustomerInfo({ ...customerInfo, birthDay: e.target.value })} placeholder="DD" /></div>
              <div><Label>Birth Month</Label><Input type="number" min={1} max={12} value={customerInfo.birthMonth} onChange={(e) => setCustomerInfo({ ...customerInfo, birthMonth: e.target.value })} placeholder="MM" /></div>
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground h-11">Place Order · ₹{cartTotal}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
