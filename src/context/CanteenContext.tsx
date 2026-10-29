import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FoodItem, Order, PickupSlot, Coupon, CanteenSettings, User, UserRole, CartItem, OrderStatus, PaymentMethod } from '../types/index.ts';
import {
  INITIAL_USERS,
  INITIAL_SETTINGS,
  INITIAL_FOOD_ITEMS,
  INITIAL_PICKUP_SLOTS,
  INITIAL_COUPONS,
  INITIAL_ORDERS,
} from '../server/dataStore.ts';
import {
  supabase,
  fetchProductsFromSupabase,
  fetchOrdersFromSupabase,
  insertOrderToSupabase,
  updateOrderStatusInSupabase,
  isSupabaseConfigured,
} from '../lib/supabase.ts';
import { sounds } from '../utils/audio.ts';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface CanteenContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  switchDemoRole: (role: UserRole) => void;
  
  menuItems: FoodItem[];
  loadingMenu: boolean;
  refreshMenu: () => Promise<void>;
  
  cart: CartItem[];
  addToCart: (item: FoodItem, quantity?: number, instructions?: string) => void;
  updateQuantity: (foodId: string, quantity: number) => void;
  removeFromCart: (foodId: string) => void;
  clearCart: () => void;
  
  appliedCoupon: Coupon | null;
  discountAmount: number;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  
  cartSubtotal: number;
  taxAmount: number;
  cartTotal: number;
  
  pickupSlots: PickupSlot[];
  refreshSlots: () => Promise<void>;
  selectedSlotId: string;
  setSelectedSlotId: (id: string) => void;
  
  orders: Order[];
  refreshOrders: () => Promise<void>;
  createOrder: (paymentMethod: PaymentMethod, gatewayRef?: string, notes?: string) => Promise<{ success: boolean; order?: Order; message: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<boolean>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
  rateOrder: (orderId: string, rating: number, comment: string) => Promise<boolean>;
  
  trackedOrder: Order | null;
  setTrackedOrder: (order: Order | null) => void;
  
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  
  activeTab: 'home' | 'menu' | 'orders' | 'profile' | 'staff' | 'admin';
  setActiveTab: (tab: 'home' | 'menu' | 'orders' | 'profile' | 'staff' | 'admin') => void;
  
  settings: CanteenSettings;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<CanteenSettings>) => Promise<boolean>;
  
  resetDemoData: () => Promise<void>;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  foodDetailModalItem: FoodItem | null;
  setFoodDetailModalItem: (item: FoodItem | null) => void;

  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSupabaseActive: boolean;
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

// Safe helper for optional local endpoints
async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return null;
    }
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const CanteenProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default to student Rahul
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<'home' | 'menu' | 'orders' | 'profile' | 'staff' | 'admin'>('home');
  
  // Initialize with seed data to prevent any empty flash or network latency
  const [menuItems, setMenuItems] = useState<FoodItem[]>(INITIAL_FOOD_ITEMS);
  const [loadingMenu, setLoadingMenu] = useState<boolean>(false);
  
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('smart_canteen_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>(INITIAL_PICKUP_SLOTS);
  const [selectedSlotId, setSelectedSlotId] = useState<string>(INITIAL_PICKUP_SLOTS[0]?.id || 'slot-1');

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [foodDetailModalItem, setFoodDetailModalItem] = useState<FoodItem | null>(null);
  const [settings, setSettings] = useState<CanteenSettings>(INITIAL_SETTINGS);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('smart_canteen_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  // Direct Supabase query for Food Products
  const refreshMenu = useCallback(async () => {
    try {
      setLoadingMenu(true);
      const items = await fetchProductsFromSupabase();
      if (items && items.length > 0) {
        setMenuItems(items);
      }
    } catch (err) {
      console.warn('Error fetching Supabase products:', err);
    } finally {
      setLoadingMenu(false);
    }
  }, []);

  // Direct Supabase query for Orders
  const refreshOrders = useCallback(async () => {
    try {
      const dbOrders = await fetchOrdersFromSupabase();
      if (dbOrders && dbOrders.length > 0) {
        setOrders(dbOrders);

        if (trackedOrder) {
          const updatedTracked = dbOrders.find((o) => o.id === trackedOrder.id);
          if (updatedTracked) {
            if (trackedOrder.orderStatus !== 'ready' && updatedTracked.orderStatus === 'ready') {
              sounds.playOrderReady();
              addToast(`🎉 Order ${updatedTracked.tokenNumber} is READY at Counter ${updatedTracked.counterNumber}!`, 'success');
            }
            setTrackedOrder(updatedTracked);
          }
        }
      }
    } catch (err) {
      console.warn('Error fetching orders from Supabase:', err);
    }
  }, [trackedOrder, addToast]);

  // Direct Supabase Authentication session listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          email: session.user.email || 'student@college.edu',
          studentId: session.user.user_metadata?.student_id || 'STU-2026',
          role: (session.user.user_metadata?.role as any) || 'student',
          accountStatus: 'active',
          createdAt: session.user.created_at,
        });
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser({
          id: session.user.id,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'Student',
          email: session.user.email || 'student@college.edu',
          studentId: session.user.user_metadata?.student_id || 'STU-2026',
          role: (session.user.user_metadata?.role as any) || 'student',
          accountStatus: 'active',
          createdAt: session.user.created_at,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Slots safely
  const refreshSlots = useCallback(async () => {
    const data = await safeFetchJson<{ success: boolean; slots: PickupSlot[] }>('/api/pickup-slots');
    if (data?.success && Array.isArray(data.slots)) {
      setPickupSlots(data.slots);
      if (data.slots.length > 0 && !selectedSlotId) {
        const firstAvailable = data.slots.find((s) => s.currentBookings < s.maxCapacity) || data.slots[0];
        setSelectedSlotId(firstAvailable.id);
      }
    }
  }, [selectedSlotId]);

  // Fetch Settings safely
  const refreshSettings = useCallback(async () => {
    const data = await safeFetchJson<{ success: boolean; settings: CanteenSettings }>('/api/settings');
    if (data?.success && data.settings) {
      setSettings(data.settings);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshMenu();
    refreshSlots();
    refreshOrders();
    refreshSettings();
  }, [refreshMenu, refreshSlots, refreshOrders, refreshSettings]);

  // Periodic polling for live updates every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      refreshOrders();
      refreshSlots();
    }, 5000);
    return () => clearInterval(timer);
  }, [refreshOrders, refreshSlots]);

  // Cart Calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.foodItem.price * item.quantity, 0);
  const taxAmount = Math.round((cartSubtotal * (settings.taxRatePercent || 5)) / 100);
  const cartTotal = Math.max(0, cartSubtotal + taxAmount - discountAmount);

  // Cart Actions
  const addToCart = (item: FoodItem, quantity = 1, instructions = '') => {
    sounds.playCartAdd();
    setCart((prev) => {
      const existing = prev.find((ci) => ci.foodItem.id === item.id);
      if (existing) {
        return prev.map((ci) =>
          ci.foodItem.id === item.id
            ? { ...ci, quantity: ci.quantity + quantity, specialInstructions: instructions || ci.specialInstructions }
            : ci
        );
      }
      return [...prev, { foodItem: item, quantity, specialInstructions: instructions }];
    });
    addToast(`Added "${item.name}" to tray!`, 'success');
  };

  const updateQuantity = (foodId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodId);
      return;
    }
    setCart((prev) => prev.map((ci) => (ci.foodItem.id === foodId ? { ...ci, quantity } : ci)));
  };

  const removeFromCart = (foodId: string) => {
    setCart((prev) => prev.filter((ci) => ci.foodItem.id !== foodId));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  // Coupons
  const applyCoupon = async (code: string) => {
    const data = await safeFetchJson<{ success: boolean; coupon?: Coupon; discount?: number; message: string }>(
      '/api/coupons/validate',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal }),
      }
    );

    if (data?.success && data.coupon && data.discount !== undefined) {
      setAppliedCoupon(data.coupon);
      setDiscountAmount(data.discount);
      addToast(data.message, 'success');
      return { success: true, message: data.message };
    }

    const localCoupon = INITIAL_COUPONS.find(
      (c) => c.code.toUpperCase() === code.trim().toUpperCase() && c.isActive
    );
    if (localCoupon) {
      if (cartSubtotal >= localCoupon.minOrderValue) {
        const disc = Math.min(
          Math.round((cartSubtotal * localCoupon.discountPercent) / 100),
          localCoupon.maxDiscount
        );
        setAppliedCoupon(localCoupon);
        setDiscountAmount(disc);
        const msg = `Coupon ${localCoupon.code} applied! You save ₹${disc}`;
        addToast(msg, 'success');
        return { success: true, message: msg };
      } else {
        const msg = `Minimum order value for ${localCoupon.code} is ₹${localCoupon.minOrderValue}`;
        addToast(msg, 'error');
        return { success: false, message: msg };
      }
    }

    setAppliedCoupon(null);
    setDiscountAmount(0);
    const msg = data?.message || 'Invalid or expired coupon code';
    addToast(msg, 'error');
    return { success: false, message: msg };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    addToast('Coupon removed', 'info');
  };

  // Create Order with Supabase persistence
  const createOrder = async (paymentMethod: PaymentMethod, gatewayRef?: string, notes?: string) => {
    if (cart.length === 0) {
      return { success: false, message: 'Cart is empty' };
    }
    if (!selectedSlotId) {
      return { success: false, message: 'Please select a pickup time slot' };
    }

    const slot = pickupSlots.find((s) => s.id === selectedSlotId) || pickupSlots[0];
    const primaryCounter = cart[0]?.foodItem.counterNumber || 1;
    const prefix = primaryCounter === 1 ? 'A' : primaryCounter === 2 ? 'B' : 'C';
    const uniqueToken = `${prefix}-${Math.floor(10 + Math.random() * 89)}`;

    const newOrder: Order = {
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      tokenNumber: uniqueToken,
      userId: currentUser.id,
      userName: currentUser.name,
      studentId: currentUser.studentId,
      items: cart.map((ci) => ({
        foodId: ci.foodItem.id,
        name: ci.foodItem.name,
        price: ci.foodItem.price,
        quantity: ci.quantity,
        isVeg: ci.foodItem.isVeg,
        imageUrl: ci.foodItem.imageUrl,
        specialInstructions: ci.specialInstructions,
      })),
      subtotal: cartSubtotal,
      tax: taxAmount,
      discount: discountAmount,
      totalAmount: cartTotal,
      couponCode: appliedCoupon?.code,
      paymentMethod,
      paymentStatus: paymentMethod === 'cash_on_pickup' ? 'pending' : 'paid',
      paymentGatewayRef: gatewayRef || `PAY_${Date.now()}`,
      orderStatus: 'pending',
      pickupSlot: slot.timeLabel,
      estimatedPrepTimeMinutes: 8,
      estimatedReadyTime: 'In approx 8 mins',
      counterNumber: primaryCounter,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: notes || '',
    };

    // Insert directly into Supabase database
    await insertOrderToSupabase(newOrder);

    // Also notify local server if running
    safeFetchJson('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrder),
    }).catch(() => {});

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);
    sounds.playOrderPlaced();
    setTrackedOrder(newOrder);
    addToast(`🎉 Order Placed via Supabase! Token: ${newOrder.tokenNumber}`, 'success');

    return {
      success: true,
      order: newOrder,
      message: `Order placed! Your Token is ${newOrder.tokenNumber}. Pick up at Counter ${primaryCounter}.`,
    };
  };

  // Update status (staff / admin) with Supabase persistence
  const updateOrderStatus = async (orderId: string, status: OrderStatus) => {
    await updateOrderStatusInSupabase(orderId, status);

    // Also sync local server endpoint
    safeFetchJson(`/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              orderStatus: status,
              estimatedReadyTime: status === 'ready' ? 'Ready for Pickup!' : o.estimatedReadyTime,
            }
          : o
      )
    );

    addToast(`Order marked as ${status.toUpperCase()} in Supabase`, 'info');
    return true;
  };

  // Cancel order (student)
  const cancelOrder = async (orderId: string) => {
    await updateOrderStatusInSupabase(orderId, 'cancelled');

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, orderStatus: 'cancelled' } : o))
    );
    addToast('Order cancelled successfully', 'success');
    return { success: true, message: 'Order cancelled successfully.' };
  };

  // Rate order
  const rateOrder = async (orderId: string, rating: number, comment: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ratingGiven: rating, feedbackComment: comment } : o))
    );
    addToast('Thank you for your rating!', 'success');
    return true;
  };

  // Update Settings
  const updateSettings = async (newSettings: Partial<CanteenSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Settings updated', 'success');
    return true;
  };

  // Reset Demo
  const resetDemoData = async () => {
    clearCart();
    setTrackedOrder(null);
    setMenuItems(INITIAL_FOOD_ITEMS);
    setPickupSlots(INITIAL_PICKUP_SLOTS);
    setOrders(INITIAL_ORDERS);
    setSettings(INITIAL_SETTINGS);
    addToast('Demo data reset to fresh state!', 'info');
  };

  // Switch demo user
  const switchDemoRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'student') {
      setCurrentUser(INITIAL_USERS[0]); // Rahul
      setActiveTab('home');
    } else if (role === 'staff') {
      setCurrentUser(INITIAL_USERS[2]); // Suresh
      setActiveTab('staff');
    } else if (role === 'admin') {
      setCurrentUser(INITIAL_USERS[3]); // Prof. Mehta
      setActiveTab('admin');
    }
    addToast(`Switched view to ${role.toUpperCase()}: ${currentUser.name}`, 'info');
  };

  return (
    <CanteenContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        activeRole,
        setActiveRole,
        switchDemoRole,
        menuItems,
        loadingMenu,
        refreshMenu,
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        cartSubtotal,
        taxAmount,
        cartTotal,
        pickupSlots,
        refreshSlots,
        selectedSlotId,
        setSelectedSlotId,
        orders,
        refreshOrders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        rateOrder,
        trackedOrder,
        setTrackedOrder,
        isCartOpen,
        setIsCartOpen,
        activeTab,
        setActiveTab,
        settings,
        refreshSettings,
        updateSettings,
        resetDemoData,
        toasts,
        addToast,
        removeToast,
        foodDetailModalItem,
        setFoodDetailModalItem,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isSupabaseActive: isSupabaseConfigured,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
