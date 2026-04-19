// Frontend type definitions for the QR Restaurant Ordering System.
// Backend-agnostic: replace the local store later with API calls / Lovable Cloud.

export type City = 'Bikaner' | 'Jodhpur';

export type PlanType = 'trial' | 'basic' | 'pro';

export interface Plan {
  type: PlanType;
  label: string;
  price: number;       // INR, 0 for trial
  durationDays: number;
}

export const PLANS: Record<PlanType, Plan> = {
  trial: { type: 'trial', label: 'Free Trial (14 days)', price: 0, durationDays: 14 },
  basic: { type: 'basic', label: 'Basic — ₹999', price: 999, durationDays: 30 },
  pro:   { type: 'pro',   label: 'Pro — ₹1999',   price: 1999, durationDays: 30 },
};

export interface Restaurant {
  id: string;
  name: string;
  phone: string;
  gst?: string;
  city: City;
  area: string;
  address: string;
  tables: number;
  username: string;
  password: string;
  logo?: string;
  createdAt: string;
  isActive: boolean;
  plan: PlanType;
  planStartedAt: string;
  planExpiresAt: string;
}

export type MenuCategory = 'Starters' | 'Main Course' | 'Beverages' | 'Desserts';

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: MenuCategory;
  price: number;
  description: string;
  isAvailable: boolean;
  isVeg: boolean;
}

export interface Customer {
  id: string;
  name: string;
  mobile: string;
  birthDay?: number;
  birthMonth?: number;
  orderCount: number;
  totalSpent: number;
  tag: 'Frequent' | 'Regular' | 'New';
  lastVisit: string;
}

export type OrderStatus = 'Received' | 'Preparing' | 'Cooking' | 'Prepared' | 'Completed';

export interface OrderItem {
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}

export interface Lead {
  id: string;
  restaurantName: string;
  contactName: string;
  mobile: string;
  createdAt: string;
  status: 'New' | 'Contacted' | 'Converted';
}

// A printed QR with a unique claim id, optionally assigned to a restaurant table.
export interface QRCodeRecord {
  id: string;                 // unique claim id (uuid)
  batchId: string;            // grouping for a printed sheet/batch
  createdAt: string;
  assignedRestaurantId?: string;
  assignedTableNumber?: number;
  assignedAt?: string;
}

export interface Review {
  id: string;
  name: string;
  initials: string;
  city: City;
  text: string;
  rating: number;
}

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
