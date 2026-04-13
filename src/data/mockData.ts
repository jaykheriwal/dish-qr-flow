// Mock data for the QR Restaurant Ordering System

const bikaner_areas = ['Station Road', 'Rani Bazar', 'Kote Gate', 'Jassusar Gate', 'Ganga Shahar Road', 'Pawan Puri', 'Bikaner City', 'Lalgarh', 'Sadul Colony', 'Ambedkar Circle'];
const jodhpur_areas = ['Sardarpura', 'Ratanada', 'Paota', 'Shastri Nagar', 'Mandore Road', 'Pal Road', 'Residency Road', 'High Court Colony', 'Basni', 'Chopasni Road'];

const firstNames = ['Rajesh', 'Suresh', 'Mahesh', 'Dinesh', 'Ramesh', 'Vikram', 'Ajay', 'Vijay', 'Sanjay', 'Deepak', 'Anil', 'Mohan', 'Gopal', 'Kishan', 'Ratan', 'Bharat', 'Neeraj', 'Pawan', 'Kailash', 'Lakshman', 'Pramod', 'Sunil', 'Mukesh', 'Yogesh', 'Harish', 'Ganesh', 'Naresh', 'Pradeep', 'Rakesh', 'Manish', 'Arvind', 'Ashok', 'Brij', 'Chandra', 'Dev', 'Firoz', 'Girish', 'Hemant', 'Indra', 'Jagdish'];
const lastNames = ['Sharma', 'Agarwal', 'Joshi', 'Rathore', 'Vyas', 'Purohit', 'Soni', 'Gupta', 'Mathur', 'Pareek', 'Bissa', 'Kothari', 'Singhvi', 'Khandelwal', 'Bohra', 'Dadheech', 'Chouhan', 'Shekhawat', 'Ranawat', 'Paliwal'];

// More realistic restaurant names based on actual Rajasthan restaurant naming patterns
const realRestaurantNames = [
  'Sharma Bhojnalaya', 'Shree Laxmi Restaurant', 'Royal Rajputana Dining', 'Bikaner Sweets & Restaurant',
  'Marwar Kitchen', 'Thar Desert Cafe', 'Jodhana Thali House', 'Palace View Restaurant',
  'Shree Krishna Bhojnalaya', 'New Agra Sweet House', 'Sagar Ratna', 'Chotiwala Restaurant',
  'Natraj Dining Hall', 'Ganesh Restaurant', 'Joshi Bhojnalaya', 'Gupta Vaishno Dhaba',
  'Kailash Parbat', 'Surya Mahal Restaurant', 'Shahi Bhoj', 'Rajasthani Rasoi',
  'Agarwal Bhojnalaya', 'Shiv Shakti Restaurant', 'Mahadev Dining', 'Bikaner Namkeen House',
  'Heritage Haveli Restaurant', 'Papad Wala Dhaba', 'Bhairav Restaurant', 'Lalgarh Palace Cafe',
  'Rathore Kitchen', 'Pareek Bhojnalaya', 'Om Restaurant', 'Mewar Dining',
  'Chokhi Dhani Express', 'Rajwada Thali', 'Banna Restaurant', 'Mehrangarh View Cafe',
  'Desert Pearl Restaurant', 'Singhvi Bhojnalaya', 'Kothari Dining Hall', 'Paliwal Restaurant',
  'Golden Fork', 'Spice Junction', 'Dal Bati House', 'Gatte Ka Sabzi Corner',
  'Ker Sangri Restaurant', 'Laal Maas Kitchen', 'Bajre Ki Roti House', 'Pyaaz Ki Kachori Shop',
  'Mirchi Bada Corner', 'Raab Restaurant', 'Churma House', 'Ghevar Sweet House',
  'Mawa Kachori Wala', 'Bikaneri Namkeen Corner', 'Jodhpuri Mirchi Wala', 'Makhaniya Lassi Shop',
  'Shahi Samosa House', 'Rajasthani Thali Junction', 'Desi Ghee Restaurant', 'Tandoor Express',
  'Roti Ghar', 'Sabji Mandi Restaurant', 'Paneer Palace', 'Dal Fry House',
  'Chawal Ghar', 'Naan Stop', 'Biryani Blues Bikaner', 'Curry Point Jodhpur',
  'Tadka Express', 'Masala Box', 'Thali Unlimited', 'Rasoi Ghar',
  'Bhojan Griha', 'Anna Purna Restaurant', 'Maa Ka Dhaba', 'Ghar Ka Khana',
  'Pakwan Palace', 'Zaika Restaurant', 'Swad Restaurant', 'Bhookh Mitao',
  'Swaad Bhojnalaya', 'Khushboo Restaurant', 'Hungama Dhaba', 'Panchhi Cafe',
  'Rang De Rajasthan', 'Haveli Restaurant', 'Bawarchi Restaurant', 'Dawat-E-Khas',
  'Apna Dhaba', 'Sher-E-Punjab Jodhpur', 'South Point Dosa', 'Chinese Dragon Bikaner',
  'Pizza Paradise Jodhpur', 'Burger Point Bikaner', 'Cafe Mehfil', 'Cafe Kulhad',
  'Chai Sutta Bar', 'The Organic Kitchen', 'Green Leaf Veg', 'Fresh & Pure Restaurant',
  'Uday Restaurant', 'Prakash Bhojnalaya', 'Basant Restaurant', 'Pushkar Restaurant',
  'Ajmer Restaurant Bikaner', 'Mount Abu Dining', 'Jaisalmer Kitchen', 'Udaipur Express',
  'Alwar Bhojnalaya', 'Kota Kitchen', 'Pali Restaurant', 'Barmer Dining Hall',
  'Nagaur Kitchen', 'Churu Bhojnalaya', 'Sri Ganganagar Express', 'Hanumangarh Restaurant',
  'Dungarpur Thali', 'Banswara Kitchen', 'Rajsamand Dining', 'Jhunjhunu Restaurant',
  'Sikar Bhojnalaya', 'Tonk Kitchen', 'Bundi Restaurant', 'Bharatpur Dining',
  'Sawai Madhopur Kitchen', 'Dholpur Restaurant', 'Karauli Bhojnalaya', 'Dausa Kitchen',
  'Jhalawar Restaurant', 'Baran Dining', 'Sirohi Kitchen', 'Jalore Bhojnalaya',
  'Bhilwara Restaurant', 'Chittorgarh Dining', 'Pratapgarh Kitchen', 'Neemuch Bhojnalaya',
  'Mandsaur Restaurant', 'Ratlam Kitchen', 'Ujjain Express Jodhpur', 'Indore Bites Bikaner',
  'Mathura Dining', 'Vrindavan Kitchen', 'Agra Express', 'Lucknow Biryani Point',
  'Varanasi Thali', 'Patna Kitchen Bikaner', 'Ranchi Express Jodhpur', 'Bhopal Dining',
  'Gwalior Restaurant', 'Jabalpur Kitchen', 'Sagar Express', 'Rewa Bhojnalaya',
  'Satna Restaurant', 'Chhindwara Dining', 'Betul Kitchen', 'Hoshangabad Express',
  'Vidisha Bhojnalaya', 'Rajgarh Kitchen', 'Shajapur Restaurant', 'Dewas Dining Hall',
  'Dhar Kitchen', 'Jhabua Bhojnalaya', 'Alirajpur Express', 'Barwani Restaurant',
  'Burhanpur Dining', 'Khandwa Kitchen', 'Khargone Bhojnalaya', 'Sendhwa Express',
  'Mhow Restaurant', 'Pithampur Dining', 'Maheshwar Kitchen', 'Omkareshwar Cafe',
  'Sanchi Express', 'Bhimbetka Restaurant', 'Orchha Kitchen', 'Khajuraho Dining',
  'Mandla Bhojnalaya', 'Dindori Express', 'Shahdol Restaurant', 'Anuppur Kitchen',
  'Katni Dining Hall', 'Panna Express', 'Tikamgarh Kitchen', 'Chhatarpur Bhojnalaya',
  'Damoh Restaurant', 'Narsinghpur Dining', 'Seoni Kitchen', 'Balaghat Express',
  'Gondia Restaurant', 'Bhandara Kitchen', 'Chandrapur Dining', 'Wardha Bhojnalaya',
  'Amravati Express', 'Akola Restaurant', 'Washim Kitchen', 'Hingoli Dining',
];

export interface Restaurant {
  id: string;
  name: string;
  phone: string;
  gst?: string;
  city: 'Bikaner' | 'Jodhpur';
  area: string;
  address: string;
  tables: number;
  username: string;
  password: string;
  logo?: string;
  createdAt: string;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  category: 'Starters' | 'Main Course' | 'Beverages' | 'Desserts';
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

export interface Order {
  id: string;
  restaurantId: string;
  tableNumber: number;
  customerId: string;
  customerName: string;
  customerMobile: string;
  items: { menuItemId: string; name: string; quantity: number; price: number }[];
  total: number;
  status: 'Received' | 'Preparing' | 'Cooking' | 'Prepared' | 'Completed';
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

export interface Review {
  id: string;
  name: string;
  initials: string;
  city: 'Bikaner' | 'Jodhpur';
  text: string;
  rating: number;
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function generatePhone(): string {
  const prefixes = ['70', '72', '73', '74', '75', '76', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99'];
  return prefixes[randInt(0, prefixes.length - 1)] + String(randInt(10000000, 99999999));
}

function generateDate(daysBack: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randInt(0, daysBack));
  d.setHours(randInt(8, 22), randInt(0, 59));
  return d.toISOString();
}

export function generateRestaurants(): Restaurant[] {
  const restaurants: Restaurant[] = [];
  for (let i = 0; i < 210; i++) {
    const name = i < realRestaurantNames.length
      ? realRestaurantNames[i]
      : `${rand(firstNames)}'s ${['Restaurant', 'Kitchen', 'Cafe', 'Dhaba', 'Dining'][randInt(0, 4)]}`;

    const city: 'Bikaner' | 'Jodhpur' = i % 2 === 0 ? 'Bikaner' : 'Jodhpur';
    const areas = city === 'Bikaner' ? bikaner_areas : jodhpur_areas;
    const area = rand(areas);

    restaurants.push({
      id: `rest_${String(i + 1).padStart(3, '0')}`,
      name,
      phone: generatePhone(),
      gst: i % 3 === 0 ? `08AABCU${randInt(1000, 9999)}F1Z${randInt(1, 9)}` : undefined,
      city,
      area,
      address: `${randInt(1, 500)}, ${area}, ${city}, Rajasthan`,
      tables: randInt(4, 20),
      username: `rest${i + 1}`,
      password: 'password123',
      createdAt: generateDate(365),
      isActive: Math.random() > 0.05,
    });
  }
  return restaurants;
}

const menuItems: { name: string; category: MenuItem['category']; price: number; desc: string; isVeg: boolean }[] = [
  { name: 'Paneer Tikka', category: 'Starters', price: 220, desc: 'Marinated paneer grilled to perfection', isVeg: true },
  { name: 'Veg Manchurian', category: 'Starters', price: 180, desc: 'Crispy vegetable balls in tangy sauce', isVeg: true },
  { name: 'Samosa (2 pcs)', category: 'Starters', price: 60, desc: 'Crispy pastry filled with spiced potatoes', isVeg: true },
  { name: 'Aloo Tikki', category: 'Starters', price: 80, desc: 'Spiced potato patties served with chutney', isVeg: true },
  { name: 'Hara Bhara Kebab', category: 'Starters', price: 160, desc: 'Spinach and green pea kebabs', isVeg: true },
  { name: 'Spring Roll', category: 'Starters', price: 150, desc: 'Crispy rolls filled with vegetables', isVeg: true },
  { name: 'Papad (Roasted)', category: 'Starters', price: 40, desc: 'Crispy roasted papad with sides', isVeg: true },
  { name: 'Dahi Bhalla', category: 'Starters', price: 100, desc: 'Soft lentil dumplings in yogurt', isVeg: true },
  { name: 'Dal Makhani', category: 'Main Course', price: 250, desc: 'Slow-cooked black lentils in cream', isVeg: true },
  { name: 'Paneer Butter Masala', category: 'Main Course', price: 280, desc: 'Cottage cheese in rich tomato gravy', isVeg: true },
  { name: 'Rajma Chawal', category: 'Main Course', price: 180, desc: 'Kidney beans curry with steamed rice', isVeg: true },
  { name: 'Chole Bhature', category: 'Main Course', price: 160, desc: 'Chickpea curry with fried bread', isVeg: true },
  { name: 'Kadai Paneer', category: 'Main Course', price: 260, desc: 'Paneer cooked in spiced bell pepper gravy', isVeg: true },
  { name: 'Veg Biryani', category: 'Main Course', price: 220, desc: 'Fragrant rice with mixed vegetables', isVeg: true },
  { name: 'Malai Kofta', category: 'Main Course', price: 280, desc: 'Paneer-potato balls in creamy gravy', isVeg: true },
  { name: 'Butter Naan', category: 'Main Course', price: 50, desc: 'Soft bread with butter', isVeg: true },
  { name: 'Garlic Naan', category: 'Main Course', price: 60, desc: 'Naan topped with garlic', isVeg: true },
  { name: 'Tandoori Roti', category: 'Main Course', price: 30, desc: 'Whole wheat bread from tandoor', isVeg: true },
  { name: 'Jeera Rice', category: 'Main Course', price: 120, desc: 'Basmati rice tempered with cumin', isVeg: true },
  { name: 'Dal Tadka', category: 'Main Course', price: 180, desc: 'Yellow lentils with aromatic tempering', isVeg: true },
  { name: 'Dal Bati Churma', category: 'Main Course', price: 320, desc: 'Rajasthani classic with baked wheat balls', isVeg: true },
  { name: 'Gatte Ka Sabzi', category: 'Main Course', price: 200, desc: 'Gram flour dumplings in spiced yogurt gravy', isVeg: true },
  { name: 'Ker Sangri', category: 'Main Course', price: 240, desc: 'Traditional Rajasthani desert bean dish', isVeg: true },
  { name: 'Laal Maas', category: 'Main Course', price: 380, desc: 'Fiery Rajasthani mutton curry', isVeg: false },
  { name: 'Bajre Ki Roti', category: 'Main Course', price: 40, desc: 'Pearl millet flatbread', isVeg: true },
  { name: 'Masala Chai', category: 'Beverages', price: 30, desc: 'Traditional Indian spiced tea', isVeg: true },
  { name: 'Lassi (Sweet)', category: 'Beverages', price: 80, desc: 'Creamy yogurt-based sweet drink', isVeg: true },
  { name: 'Lassi (Salt)', category: 'Beverages', price: 70, desc: 'Refreshing salty yogurt drink', isVeg: true },
  { name: 'Fresh Lime Soda', category: 'Beverages', price: 60, desc: 'Fizzy lemon drink', isVeg: true },
  { name: 'Mango Shake', category: 'Beverages', price: 120, desc: 'Thick mango milkshake', isVeg: true },
  { name: 'Buttermilk', category: 'Beverages', price: 50, desc: 'Spiced chilled buttermilk', isVeg: true },
  { name: 'Cold Coffee', category: 'Beverages', price: 100, desc: 'Chilled coffee with ice cream', isVeg: true },
  { name: 'Makhaniya Lassi', category: 'Beverages', price: 90, desc: 'Rich creamy Jodhpuri special lassi', isVeg: true },
  { name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 80, desc: 'Deep-fried milk solids in sugar syrup', isVeg: true },
  { name: 'Rasgulla (2 pcs)', category: 'Desserts', price: 80, desc: 'Soft cheese balls in sugar syrup', isVeg: true },
  { name: 'Ice Cream', category: 'Desserts', price: 100, desc: 'Creamy vanilla ice cream', isVeg: true },
  { name: 'Kulfi', category: 'Desserts', price: 80, desc: 'Traditional Indian frozen dessert', isVeg: true },
  { name: 'Jalebi', category: 'Desserts', price: 60, desc: 'Crispy sweet spirals soaked in syrup', isVeg: true },
  { name: 'Rasmalai (2 pcs)', category: 'Desserts', price: 100, desc: 'Soft paneer in sweetened milk', isVeg: true },
  { name: 'Ghevar', category: 'Desserts', price: 120, desc: 'Rajasthani disc-shaped sweet cake', isVeg: true },
  { name: 'Mawa Kachori', category: 'Desserts', price: 60, desc: 'Sweet stuffed pastry from Jodhpur', isVeg: true },
  { name: 'Churma Ladoo', category: 'Desserts', price: 50, desc: 'Traditional Rajasthani wheat sweet', isVeg: true },
];

export function generateMenuForRestaurant(restaurantId: string): MenuItem[] {
  const count = randInt(15, menuItems.length);
  const shuffled = [...menuItems].sort(() => Math.random() - 0.5).slice(0, count);
  return shuffled.map((item, i) => ({
    id: `${restaurantId}_menu_${i}`,
    restaurantId,
    name: item.name,
    category: item.category,
    price: item.price + randInt(-20, 30),
    description: item.desc,
    isAvailable: Math.random() > 0.1,
    isVeg: item.isVeg,
  }));
}

export function generateCustomers(): Customer[] {
  const customers: Customer[] = [];
  for (let i = 0; i < 500; i++) {
    const orderCount = randInt(1, 50);
    customers.push({
      id: `cust_${String(i + 1).padStart(4, '0')}`,
      name: `${rand(firstNames)} ${rand(lastNames)}`,
      mobile: generatePhone(),
      birthDay: Math.random() > 0.3 ? randInt(1, 28) : undefined,
      birthMonth: Math.random() > 0.3 ? randInt(1, 12) : undefined,
      orderCount,
      totalSpent: orderCount * randInt(200, 800),
      tag: orderCount > 20 ? 'Frequent' : orderCount > 5 ? 'Regular' : 'New',
      lastVisit: generateDate(60),
    });
  }
  return customers;
}

export function generateOrders(restaurants: Restaurant[], customers: Customer[]): Order[] {
  const orders: Order[] = [];
  const statuses: Order['status'][] = ['Received', 'Preparing', 'Cooking', 'Prepared', 'Completed'];

  for (let i = 0; i < 1500; i++) {
    const rest = rand(restaurants);
    const cust = rand(customers);
    const itemCount = randInt(1, 5);
    const menu = generateMenuForRestaurant(rest.id);
    const orderItems = [];
    let total = 0;

    for (let j = 0; j < itemCount; j++) {
      const mi = rand(menu);
      const qty = randInt(1, 3);
      total += mi.price * qty;
      orderItems.push({ menuItemId: mi.id, name: mi.name, quantity: qty, price: mi.price });
    }

    orders.push({
      id: `ord_${String(i + 1).padStart(5, '0')}`,
      restaurantId: rest.id,
      tableNumber: randInt(1, rest.tables),
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      items: orderItems,
      total,
      status: rand(statuses),
      createdAt: generateDate(90),
    });
  }
  return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateLeads(): Lead[] {
  const leads: Lead[] = [];
  for (let i = 0; i < 30; i++) {
    leads.push({
      id: `lead_${i + 1}`,
      restaurantName: realRestaurantNames[randInt(0, 50)],
      contactName: `${rand(firstNames)} ${rand(lastNames)}`,
      mobile: generatePhone(),
      createdAt: generateDate(30),
      status: rand(['New', 'Contacted', 'Converted']),
    });
  }
  return leads;
}

export function generateReviews(): Review[] {
  return [
    { id: 'r1', name: 'R.K.', initials: 'RK', city: 'Bikaner', text: 'Increased our table turnover by 40%! Amazing system.', rating: 5 },
    { id: 'r2', name: 'S.S.', initials: 'SS', city: 'Jodhpur', text: 'Customers love the QR ordering! So convenient.', rating: 5 },
    { id: 'r3', name: 'M.A.', initials: 'MA', city: 'Bikaner', text: 'Very easy to manage menu and orders. Highly recommended.', rating: 4 },
    { id: 'r4', name: 'V.R.', initials: 'VR', city: 'Jodhpur', text: 'Our staff efficiency improved dramatically since using this.', rating: 5 },
    { id: 'r5', name: 'D.P.', initials: 'DP', city: 'Bikaner', text: 'Great analytics dashboard. Helps us understand our business better.', rating: 4 },
    { id: 'r6', name: 'K.S.', initials: 'KS', city: 'Jodhpur', text: 'The QR system is so smooth. No more waiting for waiters!', rating: 5 },
    { id: 'r7', name: 'P.J.', initials: 'PJ', city: 'Bikaner', text: 'Reduced order errors significantly. Very happy with the system.', rating: 5 },
    { id: 'r8', name: 'A.G.', initials: 'AG', city: 'Jodhpur', text: 'Professional system, great support team. 5 stars!', rating: 5 },
  ];
}

// Singleton data store
let _restaurants: Restaurant[] | null = null;
let _customers: Customer[] | null = null;
let _orders: Order[] | null = null;
let _leads: Lead[] | null = null;

export function getRestaurants(): Restaurant[] {
  if (!_restaurants) _restaurants = generateRestaurants();
  return _restaurants;
}
export function setRestaurants(r: Restaurant[]) { _restaurants = r; }
export function getCustomers(): Customer[] {
  if (!_customers) _customers = generateCustomers();
  return _customers;
}
export function getOrders(): Order[] {
  if (!_orders) _orders = generateOrders(getRestaurants(), getCustomers());
  return _orders;
}
export function getLeads(): Lead[] {
  if (!_leads) _leads = generateLeads();
  return _leads;
}
export function addLead(lead: Omit<Lead, 'id' | 'createdAt' | 'status'>): Lead {
  const newLead: Lead = {
    ...lead,
    id: `lead_${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'New',
  };
  getLeads().unshift(newLead);
  return newLead;
}

export const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
