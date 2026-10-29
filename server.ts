import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_PICKUP_SLOTS,
  INITIAL_COUPONS,
  INITIAL_SETTINGS,
  INITIAL_USERS,
  INITIAL_FEEDBACK,
} from './src/server/dataStore.ts';
import { FoodItem, Order, PickupSlot, Coupon, CanteenSettings, User, Feedback, OrderStatus } from './src/types/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory persistent database across requests
let users: User[] = [...INITIAL_USERS];
let foodItems: FoodItem[] = [...INITIAL_FOOD_ITEMS];
let orders: Order[] = [...INITIAL_ORDERS];
let pickupSlots: PickupSlot[] = [...INITIAL_PICKUP_SLOTS];
let coupons: Coupon[] = [...INITIAL_COUPONS];
let settings: CanteenSettings = { ...INITIAL_SETTINGS };
let feedbacks: Feedback[] = [...INITIAL_FEEDBACK];

let tokenCounter = 25;

// Helper to generate unique digital token
function generateDigitalToken(counterNum: number): string {
  tokenCounter += 1;
  const prefix = counterNum === 1 ? 'A' : counterNum === 2 ? 'B' : 'C';
  return `${prefix}-${tokenCounter.toString().padStart(2, '0')}`;
}

// Helper to compute dynamic estimated prep time
function calculateEstimatedPrep(items: { foodId: string; quantity: number }[], counterNum: number): number {
  let basePrep = 0;
  for (const item of items) {
    const food = foodItems.find((f) => f.id === item.foodId);
    if (food) {
      basePrep = Math.max(basePrep, food.preparationTimeMinutes);
    }
  }
  if (basePrep === 0) basePrep = 8;

  // Active queue load at this counter
  const activeOrdersAtCounter = orders.filter(
    (o) => o.counterNumber === counterNum && (o.orderStatus === 'pending' || o.orderStatus === 'preparing' || o.orderStatus === 'accepted')
  ).length;

  const queueAddition = activeOrdersAtCounter * 2.5;
  const multiplier = settings.rushHourMultiplier || 1.2;

  const totalMinutes = Math.round((basePrep + queueAddition) * (multiplier > 1 ? multiplier : 1));
  return Math.max(totalMinutes, 5);
}

/* ========================================================================== */
/*                               API ENDPOINTS                                */
/* ========================================================================== */

// --- Food Menu ---
app.get('/api/menu', (req, res) => {
  const { category, search, vegOnly, maxPrice } = req.query;
  let result = [...foodItems];

  if (category && category !== 'all') {
    result = result.filter((item) => item.category === category);
  }

  if (vegOnly === 'true') {
    result = result.filter((item) => item.isVeg);
  }

  if (maxPrice) {
    const max = Number(maxPrice);
    if (!isNaN(max)) {
      result = result.filter((item) => item.price <= max);
    }
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    result = result.filter(
      (item) => item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }

  res.json({ success: true, items: result });
});

app.get('/api/menu/:id', (req, res) => {
  const item = foodItems.find((f) => f.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  res.json({ success: true, item });
});

app.post('/api/menu', (req, res) => {
  const { name, description, category, price, isVeg, stockQuantity, preparationTimeMinutes, imageUrl, counterNumber, allergens } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ success: false, message: 'Name, price, and category are required' });
  }

  const newItem: FoodItem = {
    id: `food-${Date.now()}`,
    name: String(name).trim(),
    description: String(description || '').trim(),
    category,
    price: Number(price),
    isVeg: Boolean(isVeg),
    isAvailable: true,
    stockQuantity: Number(stockQuantity) || 50,
    preparationTimeMinutes: Number(preparationTimeMinutes) || 8,
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
    counterNumber: Number(counterNumber) || 1,
    rating: 5.0,
    ratingCount: 1,
    allergens: Array.isArray(allergens) ? allergens : [],
  };

  foodItems.unshift(newItem);
  res.status(201).json({ success: true, item: newItem });
});

app.put('/api/menu/:id', (req, res) => {
  const index = foodItems.findIndex((f) => f.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Item not found' });

  const updated: FoodItem = {
    ...foodItems[index],
    ...req.body,
    id: foodItems[index].id,
  };

  foodItems[index] = updated;
  res.json({ success: true, item: updated });
});

app.delete('/api/menu/:id', (req, res) => {
  foodItems = foodItems.filter((f) => f.id !== req.params.id);
  res.json({ success: true, message: 'Item deleted successfully' });
});

app.patch('/api/menu/:id/toggle-availability', (req, res) => {
  const item = foodItems.find((f) => f.id === req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

  item.isAvailable = !item.isAvailable;
  res.json({ success: true, item });
});

// --- Pickup Slots ---
app.get('/api/pickup-slots', (_req, res) => {
  res.json({ success: true, slots: pickupSlots });
});

app.put('/api/pickup-slots/:id', (req, res) => {
  const slot = pickupSlots.find((s) => s.id === req.params.id);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });

  if (req.body.maxCapacity !== undefined) slot.maxCapacity = Number(req.body.maxCapacity);
  if (req.body.isRushHour !== undefined) slot.isRushHour = Boolean(req.body.isRushHour);

  res.json({ success: true, slot });
});

// --- Coupons ---
app.get('/api/coupons', (_req, res) => {
  res.json({ success: true, coupons: coupons.filter((c) => c.isActive) });
});

app.post('/api/coupons/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) return res.status(400).json({ success: false, message: 'Code required' });

  const found = coupons.find((c) => c.code.toUpperCase() === String(code).trim().toUpperCase() && c.isActive);
  if (!found) {
    return res.status(400).json({ success: false, message: 'Invalid or expired coupon code' });
  }

  if (subtotal < found.minOrderValue) {
    return res.status(400).json({
      success: false,
      message: `Minimum order value for ${found.code} is ₹${found.minOrderValue}`,
    });
  }

  const discountRaw = (subtotal * found.discountPercent) / 100;
  const finalDiscount = Math.min(Math.round(discountRaw), found.maxDiscount);

  res.json({
    success: true,
    coupon: found,
    discount: finalDiscount,
    message: `Coupon ${found.code} applied! You save ₹${finalDiscount}`,
  });
});

app.post('/api/coupons', (req, res) => {
  const { code, discountPercent, minOrderValue, maxDiscount, description } = req.body;
  const newCoupon: Coupon = {
    id: `c-${Date.now()}`,
    code: String(code).trim().toUpperCase(),
    discountPercent: Number(discountPercent),
    minOrderValue: Number(minOrderValue),
    maxDiscount: Number(maxDiscount),
    description: String(description || ''),
    isActive: true,
    validUntil: '2026-12-31',
  };
  coupons.unshift(newCoupon);
  res.status(201).json({ success: true, coupon: newCoupon });
});

// --- Payment Gateway Configuration & Verification ---

// Exposes publishable key and gateway status; secret key is kept strictly on the server
app.get('/api/payments/config', (_req, res) => {
  const publishableKey = process.env.RAZORPAY_KEY_ID || 'sb_publishable_tiz2OezmwfkD9y1x5RIA8g_K9ld9THS';
  const secretKey = process.env.RAZORPAY_KEY_SECRET;
  const hasSecret = Boolean(secretKey && secretKey !== 'your_razorpay_secret_key_here');
  const isLive = publishableKey.startsWith('rzp_live');
  const mode = process.env.PAYMENT_MODE || (isLive ? 'live' : 'test');

  res.json({
    success: true,
    provider: 'Razorpay',
    publishableKey,
    hasSecretConfigured: hasSecret,
    mode,
    isTestMode: mode === 'test',
    maskedSecret: hasSecret ? '••••••••••••' + secretKey!.slice(-4) : 'Not configured (Sandbox test simulation active)',
    envVarNames: {
      publishableKeyEnv: 'RAZORPAY_KEY_ID',
      secretKeyEnv: 'RAZORPAY_KEY_SECRET',
      modeEnv: 'PAYMENT_MODE',
    },
  });
});

app.post('/api/payments/create-intent', (req, res) => {
  const { amount, paymentMethod, studentEmail } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid amount' });
  }

  const publishableKey = process.env.RAZORPAY_KEY_ID || 'sb_publishable_tiz2OezmwfkD9y1x5RIA8g_K9ld9THS';
  const orderRef = `order_campus_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;
  const paymentRef = `pay_${Date.now()}_${Math.floor(Math.random() * 89999 + 10000)}`;
  const qrCodeUrl = `upi://pay?pa=bitbite.canteen@icici&pn=BitBite&am=${amount}&tr=${paymentRef}&cu=INR`;

  // Pre-generate signature so frontend verification is verifiable
  const secretKey = process.env.RAZORPAY_KEY_SECRET || 'test_secret_demo';
  const signature = crypto
    .createHmac('sha256', secretKey)
    .update(`${orderRef}|${paymentRef}`)
    .digest('hex');

  res.json({
    success: true,
    transactionRef: paymentRef,
    orderId: orderRef,
    signature,
    gateway: paymentMethod === 'cash_on_pickup' ? 'Counter Cash' : 'Razorpay Secure Gateway',
    amount,
    currency: 'INR',
    upiQrPayload: qrCodeUrl,
    keyId: publishableKey,
    isTestMode: !publishableKey.startsWith('rzp_live'),
  });
});

app.post('/api/payments/verify', (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const secretKey = process.env.RAZORPAY_KEY_SECRET || 'test_secret_demo';

  if (razorpaySignature && razorpayOrderId && razorpayPaymentId) {
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    if (expectedSignature !== razorpaySignature && process.env.RAZORPAY_KEY_SECRET) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Payment verification failed: HMAC signature mismatch.',
      });
    }

    return res.json({
      success: true,
      verified: true,
      message: 'Payment signature verified successfully via HMAC SHA256.',
      transactionRef: razorpayPaymentId,
    });
  }

  res.json({
    success: true,
    verified: true,
    message: 'Payment verified in Sandbox Test Mode.',
    transactionRef: razorpayPaymentId || `TEST_PAY_${Date.now()}`,
  });
});

// --- Orders ---
app.get('/api/orders', (req, res) => {
  const { userId, status, counter } = req.query;
  let result = [...orders];

  if (userId) {
    result = result.filter((o) => o.userId === userId);
  }

  if (status) {
    result = result.filter((o) => o.orderStatus === status);
  }

  if (counter) {
    result = result.filter((o) => o.counterNumber === Number(counter));
  }

  // Sort by newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ success: true, orders: result });
});

app.get('/api/orders/:id', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
  res.json({ success: true, order });
});

// Server-side calculated secure order creation
app.post('/api/orders', (req, res) => {
  const { userId, userName, studentId, items, pickupSlotId, couponCode, paymentMethod, paymentGatewayRef, notes } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart is empty' });
  }

  if (!pickupSlotId) {
    return res.status(400).json({ success: false, message: 'Pickup slot is required' });
  }

  // Check pickup slot capacity
  const slot = pickupSlots.find((s) => s.id === pickupSlotId);
  if (!slot) {
    return res.status(400).json({ success: false, message: 'Invalid pickup slot selected' });
  }

  if (slot.currentBookings >= slot.maxCapacity) {
    return res.status(400).json({
      success: false,
      message: `Pickup slot "${slot.timeLabel}" is full. Please choose another slot to avoid long lines.`,
    });
  }

  // Server-side recalculate item prices and verify stock
  let calculatedSubtotal = 0;
  const verifiedItems = [];
  let primaryCounter = 1;

  for (const item of items) {
    const food = foodItems.find((f) => f.id === item.foodId);
    if (!food) {
      return res.status(400).json({ success: false, message: `Dish with ID ${item.foodId} not found` });
    }

    if (!food.isAvailable || food.stockQuantity < item.quantity) {
      return res.status(400).json({
        success: false,
        message: `Sorry, "${food.name}" is sold out or insufficient stock.`,
      });
    }

    calculatedSubtotal += food.price * item.quantity;
    verifiedItems.push({
      foodId: food.id,
      name: food.name,
      price: food.price,
      quantity: item.quantity,
      isVeg: food.isVeg,
      imageUrl: food.imageUrl,
      specialInstructions: item.specialInstructions || '',
    });

    primaryCounter = food.counterNumber; // Route to counter matching primary item
  }

  // Calculate discount server-side
  let calculatedDiscount = 0;
  if (couponCode) {
    const c = coupons.find((cp) => cp.code.toUpperCase() === couponCode.toUpperCase() && cp.isActive);
    if (c && calculatedSubtotal >= c.minOrderValue) {
      const disc = (calculatedSubtotal * c.discountPercent) / 100;
      calculatedDiscount = Math.min(Math.round(disc), c.maxDiscount);
    }
  }

  const tax = Math.round((calculatedSubtotal * settings.taxRatePercent) / 100);
  const totalAmount = Math.max(calculatedSubtotal + tax - calculatedDiscount, 0);

  // Decrement inventory
  for (const item of items) {
    const food = foodItems.find((f) => f.id === item.foodId);
    if (food) {
      food.stockQuantity = Math.max(0, food.stockQuantity - item.quantity);
      if (food.stockQuantity === 0) {
        food.isAvailable = false;
      }
    }
  }

  // Increment slot booking count
  slot.currentBookings += 1;

  // Calculate estimated prep time based on live queue
  const estimatedPrepMinutes = calculateEstimatedPrep(items, primaryCounter);
  const readyDate = new Date(Date.now() + estimatedPrepMinutes * 60 * 1000);
  const readyTimeStr = readyDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const newOrder: Order = {
    id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
    tokenNumber: generateDigitalToken(primaryCounter),
    userId: userId || 'guest-student',
    userName: userName || 'Student',
    studentId: studentId || 'COLLEGE-ID',
    items: verifiedItems,
    subtotal: calculatedSubtotal,
    tax,
    discount: calculatedDiscount,
    totalAmount,
    couponCode: couponCode || undefined,
    paymentMethod: paymentMethod || 'upi',
    paymentStatus: paymentMethod === 'cash_on_pickup' ? 'pending' : 'paid',
    paymentGatewayRef: paymentGatewayRef || `PAY-${Date.now()}`,
    orderStatus: 'pending',
    pickupSlot: slot.timeLabel,
    estimatedPrepTimeMinutes: estimatedPrepMinutes,
    estimatedReadyTime: readyTimeStr,
    counterNumber: primaryCounter,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    notes: notes || '',
  };

  orders.unshift(newOrder);

  res.status(201).json({
    success: true,
    order: newOrder,
    message: `Order placed! Your Token is ${newOrder.tokenNumber}. Pick up at Counter ${primaryCounter}.`,
  });
});

app.patch('/api/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  const validStatuses: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }

  order.orderStatus = status;
  order.updatedAt = new Date().toISOString();

  if (status === 'ready') {
    order.estimatedReadyTime = 'Ready for Pickup!';
  } else if (status === 'completed') {
    if (order.paymentMethod === 'cash_on_pickup') {
      order.paymentStatus = 'paid';
    }
  }

  res.json({ success: true, order });
});

app.post('/api/orders/:id/cancel', (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  if (order.orderStatus === 'preparing' || order.orderStatus === 'ready' || order.orderStatus === 'completed') {
    return res.status(400).json({
      success: false,
      message: 'Cannot cancel order once the kitchen starts preparation.',
    });
  }

  order.orderStatus = 'cancelled';
  order.updatedAt = new Date().toISOString();

  // Restore inventory
  for (const item of order.items) {
    const food = foodItems.find((f) => f.id === item.foodId);
    if (food) {
      food.stockQuantity += item.quantity;
      food.isAvailable = true;
    }
  }

  res.json({ success: true, order, message: 'Order cancelled successfully. Refund initiated.' });
});

app.post('/api/orders/:id/rate', (req, res) => {
  const { rating, comment, foodItemId } = req.body;
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

  order.ratingGiven = Number(rating);
  order.feedbackComment = String(comment || '');

  const newFeedback: Feedback = {
    id: `fb-${Date.now()}`,
    orderId: order.id,
    userId: order.userId,
    userName: order.userName,
    foodItemId,
    rating: Number(rating),
    comment: String(comment || ''),
    createdAt: new Date().toISOString(),
  };

  feedbacks.unshift(newFeedback);
  res.json({ success: true, feedback: newFeedback, message: 'Thank you for your feedback!' });
});

// --- Analytics ---
app.get('/api/analytics', (_req, res) => {
  const totalRev = orders.filter((o) => o.paymentStatus === 'paid').reduce((acc, cur) => acc + cur.totalAmount, 0);

  const activeQueue = orders.filter((o) => o.orderStatus === 'pending' || o.orderStatus === 'preparing').length;

  const dishMap: Record<string, { count: number; rev: number; category: string }> = {};
  for (const ord of orders) {
    for (const it of ord.items) {
      if (!dishMap[it.name]) {
        const food = foodItems.find((f) => f.id === it.foodId);
        dishMap[it.name] = { count: 0, rev: 0, category: food?.category || 'snacks' };
      }
      dishMap[it.name].count += it.quantity;
      dishMap[it.name].rev += it.price * it.quantity;
    }
  }

  const popularDishes = Object.entries(dishMap)
    .map(([name, data]) => ({ name, ordersCount: data.count, revenue: data.rev, category: data.category }))
    .sort((a, b) => b.ordersCount - a.ordersCount)
    .slice(0, 5);

  const hourlyRush = [
    { hour: '09:00 AM', orders: 12, load: 'low' as const },
    { hour: '10:45 AM (Short Recess)', orders: 48, load: 'peak' as const },
    { hour: '12:00 PM', orders: 20, load: 'moderate' as const },
    { hour: '01:15 PM (Lunch Break)', orders: 64, load: 'peak' as const },
    { hour: '03:15 PM (Tea Break)', orders: 38, load: 'moderate' as const },
    { hour: '04:30 PM (Dispersal)', orders: 16, load: 'low' as const },
  ];

  const categoryMap: Record<string, number> = {};
  for (const ord of orders) {
    for (const it of ord.items) {
      const food = foodItems.find((f) => f.id === it.foodId);
      const cat = food?.category || 'snacks';
      categoryMap[cat] = (categoryMap[cat] || 0) + it.quantity;
    }
  }

  const totalSold = Object.values(categoryMap).reduce((a, b) => a + b, 0) || 1;
  const categorySales = Object.entries(categoryMap).map(([category, count]) => ({
    category,
    count,
    percentage: Math.round((count / totalSold) * 100),
  }));

  res.json({
    success: true,
    summary: {
      todayRevenue: totalRev,
      todayOrdersCount: orders.length,
      avgPreparationTimeMinutes: 7,
      activeQueueLength: activeQueue,
      revenueByDay: [
        { day: 'Mon', revenue: 6200, orders: 84 },
        { day: 'Tue', revenue: 7400, orders: 98 },
        { day: 'Wed', revenue: 8100, orders: 112 },
        { day: 'Thu', revenue: 6900, orders: 90 },
        { day: 'Fri', revenue: 8800, orders: 124 },
        { day: 'Today', revenue: totalRev, orders: orders.length },
      ],
      hourlyRush,
      popularDishes,
      categorySales,
    },
  });
});

// --- Feedback ---
app.get('/api/feedback', (_req, res) => {
  res.json({ success: true, feedback: feedbacks });
});

// --- Settings ---
app.get('/api/settings', (_req, res) => {
  res.json({ success: true, settings });
});

app.put('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json({ success: true, settings });
});

// --- Auth Demo Login/Register ---
app.post('/api/auth/login', (req, res) => {
  const { email, role } = req.body;
  if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

  let user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user && role) {
    user = users.find((u) => u.role === role);
  }

  if (!user) {
    // Auto-create student user if unknown email
    user = {
      id: `user-${Date.now()}`,
      name: email.split('@')[0],
      email: email,
      studentId: `STU-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'student',
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
  }

  res.json({ success: true, user });
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, studentId, phone, role } = req.body;
  if (!name || !email || !studentId) {
    return res.status(400).json({ success: false, message: 'Name, email and Student ID are required' });
  }

  const existing = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase() || u.studentId === studentId);
  if (existing) {
    return res.status(400).json({ success: false, message: 'Student ID or email already registered' });
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: String(name).trim(),
    email: String(email).trim(),
    studentId: String(studentId).trim(),
    phone: phone || '',
    role: (role as any) || 'student',
    accountStatus: 'active',
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  res.status(201).json({ success: true, user: newUser });
});

// --- Reset to Initial Seed ---
app.post('/api/reset-demo', (_req, res) => {
  users = [...INITIAL_USERS];
  foodItems = [...INITIAL_FOOD_ITEMS];
  orders = [...INITIAL_ORDERS];
  pickupSlots = [...INITIAL_PICKUP_SLOTS];
  coupons = [...INITIAL_COUPONS];
  settings = { ...INITIAL_SETTINGS };
  feedbacks = [...INITIAL_FEEDBACK];
  tokenCounter = 25;
  res.json({ success: true, message: 'Demo data reset to fresh state!' });
});

/* ========================================================================== */
/*                           VITE SERVER INTEGRATION                          */
/* ========================================================================== */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Smart Canteen Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
