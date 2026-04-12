import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { QrCode } from 'lucide-react';
import { toast } from 'sonner';
import { getRestaurants } from '@/data/mockData';

export default function RestaurantLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const restaurants = getRestaurants();
    const rest = restaurants.find(r => r.username === username && r.password === password);
    if (rest) {
      sessionStorage.setItem('restaurantId', rest.id);
      sessionStorage.setItem('restaurantName', rest.name);
      navigate('/restaurant/dashboard');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto h-12 w-12 rounded-xl gradient-primary flex items-center justify-center mb-2">
            <QrCode className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Restaurant Login</CardTitle>
          <CardDescription>Sign in to manage your restaurant</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="rest1" />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button type="submit" className="w-full gradient-primary text-primary-foreground">Sign In</Button>
          </form>
          <p className="text-xs text-muted-foreground mt-4 text-center">Demo: rest1 / password123</p>
        </CardContent>
      </Card>
    </div>
  );
}
