export type UserRole = 'student' | 'admin' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  role: UserRole;
  phone?: string;
  accountStatus: 'active' | 'suspended';
  createdAt: string;
}

export type FoodCategory = 'breakfast' | 'lunch' | 'snacks' | 'beverages' | 'fast_food';

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  category: FoodCategory;
  price: number; // in INR (₹)
  originalPrice?: number;
  isVeg: boolean;
  isAvailable: boolean;
  stockQuantity: number;
  preparationTimeMinutes: number;
  imageUrl: string;
  calories?: number;
  counterNumber: number; // 1: Snacks/Breakfast, 2: Meals/Lunch, 3: Beverages/FastFood
  tags?: string[];
  rating: number;
  ratingCount: number;
  ingredients?: string[];
  allergens?: string[];
  isPopular?: boolean;
  isSpecial?: boolean;
}

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus = 'pending' | 'accepted' | 'preparing' | 'ready' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type PaymentMethod = 'upi' | 'card' | 'netbanking' | 'cash_on_pickup';

export interface OrderItemSummary {
  foodId: string;
  name: string;
  price: number;
  quantity: number;
  isVeg: boolean;
  imageUrl: string;
  specialInstructions?: string;
}

export interface Order {
  id: string;
  tokenNumber: string; // e.g. "T-104"
  userId: string;
  userName: string;
  studentId: string;
  items: OrderItemSummary[];
  subtotal: number;
  tax: number;
  discount: number;
  totalAmount: number;
  couponCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentGatewayRef?: string;
  orderStatus: OrderStatus;
  pickupSlot: string; // e.g. "11:15 AM - 11:30 AM"
  estimatedPrepTimeMinutes: number;
  estimatedReadyTime: string; // formatted time or ISO
  counterNumber: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  ratingGiven?: number;
  feedbackComment?: string;
  isUrgent?: boolean;
}

export interface PickupSlot {
  id: string;
  timeLabel: string;
  slotName: string;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  currentBookings: number;
  isRushHour: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discountPercent: number;
  minOrderValue: number;
  maxDiscount: number;
  description: string;
  isActive: boolean;
  validUntil: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  foodItemId?: string;
  foodItemName?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CanteenSettings {
  isCanteenOpen: boolean;
  allowCashOnPickup: boolean;
  taxRatePercent: number;
  rushHourMultiplier: number;
  activeNotice: string;
  canteenName: string;
  collegeName: string;
  openingHours: string;
  pickupCounters: { id: number; name: string; description: string }[];
}

export interface AnalyticsSummary {
  todayRevenue: number;
  todayOrdersCount: number;
  avgPreparationTimeMinutes: number;
  activeQueueLength: number;
  revenueByDay: { day: string; revenue: number; orders: number }[];
  hourlyRush: { hour: string; orders: number; load: 'low' | 'moderate' | 'peak' }[];
  popularDishes: { name: string; ordersCount: number; revenue: number; category: string }[];
  categorySales: { category: string; count: number; percentage: number }[];
}
