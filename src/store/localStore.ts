/**
 * Frontend-only in-memory store with localStorage persistence.
 *
 * This is a placeholder so the UI works without a backend. Replace each
 * function below with real API calls (fetch/axios) or Lovable Cloud queries
 * when wiring up your backend. The function signatures are stable.
 */

import type { Restaurant, MenuItem, Order, Lead, PlanType, QRCodeRecord } from '@/types';
import { PLANS } from '@/types';

const KEYS = {
  restaurants: 'qrserve.restaurants',
  menus: 'qrserve.menus',           // map: restaurantId -> MenuItem[]
  orders: 'qrserve.orders',
  leads: 'qrserve.leads',
  qrcodes: 'qrserve.qrcodes',
};

// ----- low-level persistence helpers -----
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

// ----- Restaurants -----
export function getRestaurants(): Restaurant[] {
  return read<Restaurant[]>(KEYS.restaurants, []);
}
export function setRestaurants(list: Restaurant[]) {
  write(KEYS.restaurants, list);
}
export function addRestaurant(r: Restaurant) {
  const list = getRestaurants();
  list.unshift(r);
  setRestaurants(list);
}
export function updateRestaurant(id: string, patch: Partial<Restaurant>) {
  const list = getRestaurants().map(r => r.id === id ? { ...r, ...patch } : r);
  setRestaurants(list);
  return list.find(r => r.id === id);
}
export function findRestaurantById(id: string): Restaurant | undefined {
  return getRestaurants().find(r => r.id === id);
}
export function findRestaurantByCredentials(username: string, password: string) {
  return getRestaurants().find(r => r.username === username && r.password === password);
}

// Helper to build a fully-formed Restaurant from registration form input.
export function buildRestaurant(input: {
  name: string;
  phone: string;
  gst?: string;
  city: Restaurant['city'];
  area?: string;
  address?: string;
  tables: number;
  username: string;
  password: string;
  plan: PlanType;
}): Restaurant {
  const now = new Date();
  const plan = PLANS[input.plan];
  const expires = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
  return {
    id: `rest_${Date.now()}`,
    name: input.name,
    phone: input.phone,
    gst: input.gst || undefined,
    city: input.city,
    area: input.area || (input.city === 'Bikaner' ? 'Station Road' : 'Sardarpura'),
    address: input.address || `${input.city}, Rajasthan`,
    tables: input.tables,
    username: input.username,
    password: input.password,
    createdAt: now.toISOString(),
    isActive: true,
    plan: input.plan,
    planStartedAt: now.toISOString(),
    planExpiresAt: expires.toISOString(),
  };
}

// ----- Menu items (per restaurant) -----
function readAllMenus(): Record<string, MenuItem[]> {
  return read<Record<string, MenuItem[]>>(KEYS.menus, {});
}
function writeAllMenus(map: Record<string, MenuItem[]>) {
  write(KEYS.menus, map);
}
export function getMenuForRestaurant(restaurantId: string): MenuItem[] {
  return readAllMenus()[restaurantId] ?? [];
}
export function setMenuForRestaurant(restaurantId: string, items: MenuItem[]) {
  const map = readAllMenus();
  map[restaurantId] = items;
  writeAllMenus(map);
}
export function addMenuItem(item: MenuItem) {
  const items = getMenuForRestaurant(item.restaurantId);
  setMenuForRestaurant(item.restaurantId, [...items, item]);
}
export function updateMenuItem(restaurantId: string, itemId: string, patch: Partial<MenuItem>) {
  const items = getMenuForRestaurant(restaurantId).map(m => m.id === itemId ? { ...m, ...patch } : m);
  setMenuForRestaurant(restaurantId, items);
}
export function deleteMenuItem(restaurantId: string, itemId: string) {
  const items = getMenuForRestaurant(restaurantId).filter(m => m.id !== itemId);
  setMenuForRestaurant(restaurantId, items);
}

// ----- Orders -----
export function getOrders(): Order[] {
  return read<Order[]>(KEYS.orders, []);
}
export function getOrdersForRestaurant(restaurantId: string): Order[] {
  return getOrders().filter(o => o.restaurantId === restaurantId);
}
export function addOrder(order: Order) {
  const list = getOrders();
  list.unshift(order);
  write(KEYS.orders, list);
}
export function updateOrderStatus(orderId: string, status: Order['status']) {
  const list = getOrders().map(o => o.id === orderId ? { ...o, status } : o);
  write(KEYS.orders, list);
}

// ----- Leads (from landing page) -----
export function getLeads(): Lead[] {
  return read<Lead[]>(KEYS.leads, []);
}
export function addLead(input: { restaurantName: string; contactName: string; mobile: string }): Lead {
  const lead: Lead = {
    id: `lead_${Date.now()}`,
    restaurantName: input.restaurantName,
    contactName: input.contactName,
    mobile: input.mobile,
    createdAt: new Date().toISOString(),
    status: 'New',
  };
  const list = getLeads();
  list.unshift(lead);
  write(KEYS.leads, list);
  return lead;
}
export function updateLeadStatus(id: string, status: Lead['status']) {
  const list = getLeads().map(l => l.id === id ? { ...l, status } : l);
  write(KEYS.leads, list);
}
