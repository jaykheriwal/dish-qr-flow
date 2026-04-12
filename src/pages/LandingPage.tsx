import { useState } from 'react';
import { Star, QrCode, BarChart3, Users, ChevronRight, Phone, MessageCircle, ArrowRight, Shield, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { generateReviews, addLead } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const reviews = generateReviews();

const features = [
  { icon: QrCode, title: 'QR Table Ordering', desc: 'Customers scan & order directly from their table. No app download needed.' },
  { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track sales, popular items, and customer patterns with beautiful dashboards.' },
  { icon: Users, title: 'Customer Management', desc: 'Build customer database with birthdays, preferences, and visit history.' },
  { icon: Zap, title: 'Instant Order Updates', desc: 'Kitchen gets orders instantly. Track status from received to completed.' },
  { icon: Shield, title: 'Multi-Restaurant Support', desc: 'Manage multiple outlets from a single admin panel.' },
  { icon: Clock, title: 'Menu Management', desc: 'Update menu items, prices, and availability in real-time.' },
];

const benefits = [
  { stat: '40%', label: 'Faster Table Turnover' },
  { stat: '60%', label: 'Less Order Errors' },
  { stat: '₹0', label: 'Setup Cost' },
  { stat: '24/7', label: 'Support Available' },
];

export default function LandingPage() {
  const [showDemo, setShowDemo] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ restaurantName: '', contactName: '', mobile: '' });
  const navigate = useNavigate();

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName || !form.contactName || !form.mobile) {
      toast.error('Please fill all fields');
      return;
    }
    addLead({ restaurantName: form.restaurantName, contactName: form.contactName, mobile: form.mobile });
    setShowDemo(false);
    setShowSuccess(true);
    setForm({ restaurantName: '', contactName: '', mobile: '' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 glass">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-7 w-7 text-primary" />
            <span className="text-lg font-bold text-foreground">QRServe</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#benefits" className="hover:text-foreground transition-colors">Benefits</a>
            <a href="#testimonials" className="hover:text-foreground transition-colors">Reviews</a>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin/login')}>Admin</Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/restaurant/login')}>Restaurant</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32 text-center relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star className="h-4 w-4 fill-primary" /> 4.5/5 Rating from 200+ Restaurants
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground max-w-3xl mx-auto leading-tight">
            Smart QR Ordering System for{' '}
            <span className="gradient-text">Restaurants</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mt-6 max-w-2xl mx-auto">
            Serving 200+ Restaurants in Bikaner & Jodhpur. Streamline your orders, delight your customers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-10">
            <Button size="lg" className="gradient-primary text-primary-foreground text-base px-8 h-12" onClick={() => setShowDemo(true)}>
              Book a Free Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="text-base px-8 h-12" onClick={() => navigate('/admin/login')}>
              Admin Login <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">Everything You Need</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Powerful features to transform your restaurant operations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title} className="card-hover border-border/50">
                <CardContent className="pt-6">
                  <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                    <f.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground text-lg">{f.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="benefits" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">Why Restaurants Love Us</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {benefits.map((b) => (
              <Card key={b.label} className="text-center card-hover border-border/50">
                <CardContent className="pt-8 pb-8">
                  <div className="text-4xl font-bold gradient-text">{b.stat}</div>
                  <p className="text-muted-foreground mt-2 text-sm font-medium">{b.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-foreground">What Our Clients Say</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((r) => (
              <Card key={r.id} className="card-hover border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm">
                      {r.initials}
                    </div>
                    <div>
                      <div className="font-medium text-foreground text-sm">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.city}</div>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">"{r.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="gradient-primary rounded-2xl p-12 md:p-16">
            <h2 className="text-3xl font-bold text-primary-foreground">Ready to Transform Your Restaurant?</h2>
            <p className="text-primary-foreground/80 mt-4 max-w-lg mx-auto">Join 200+ restaurants already using QRServe to increase efficiency and delight customers.</p>
            <Button size="lg" variant="secondary" className="mt-8 text-base px-8 h-12" onClick={() => setShowDemo(true)}>
              Book Free Demo <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">QRServe</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 QRServe. Bikaner & Jodhpur, Rajasthan.</p>
        </div>
      </footer>

      {/* Demo Dialog */}
      <Dialog open={showDemo} onOpenChange={setShowDemo}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book a Free Demo</DialogTitle>
            <DialogDescription>Fill in your details and we'll get in touch</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleDemoSubmit} className="space-y-4">
            <div>
              <Label htmlFor="restName">Restaurant Name</Label>
              <Input id="restName" value={form.restaurantName} onChange={(e) => setForm({ ...form, restaurantName: e.target.value })} placeholder="Enter restaurant name" />
            </div>
            <div>
              <Label htmlFor="contactName">Contact Name</Label>
              <Input id="contactName" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="mobile">Mobile Number</Label>
              <Input id="mobile" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="10-digit mobile" />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Submit</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="text-center">
          <DialogHeader>
            <DialogTitle>Demo Request Submitted! 🎉</DialogTitle>
            <DialogDescription>We'll contact you soon. You can also reach us on WhatsApp.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-center gap-2 text-foreground font-medium">
              <Phone className="h-4 w-4" /> 9352567216
            </div>
            <Button className="gradient-primary text-primary-foreground w-full" onClick={() => window.open('https://wa.me/919352567216', '_blank')}>
              <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
