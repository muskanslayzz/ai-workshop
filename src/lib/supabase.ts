import { createClient } from '@supabase/supabase-js';
import { FoodItem, Order, User } from '../types/index.ts';
import { INITIAL_FOOD_ITEMS, INITIAL_ORDERS, INITIAL_USERS } from '../server/dataStore.ts';

// Extract environment variables with fallback to user's provided publishable key and derived project URL
const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
  'https://tiz2oezmwfkd9y1x5ria.supabase.co';

const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
  'sb_publishable_tiz2OezmwfkD9y1x5RIA8g_K9ld9THS';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    supabaseAnonKey !== 'your-anon-key'
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/* ========================================================================== */
/*                       SUPABASE DATABASE SERVICE METHODS                    */
/* ========================================================================== */

/**
 * Fetch all food products directly from Supabase 'products' table.
 * Falls back gracefully to default campus catalog if table is not yet seeded.
 */
export async function fetchProductsFromSupabase(): Promise<FoodItem[]> {
  try {
    if (!isSupabaseConfigured) {
      return INITIAL_FOOD_ITEMS;
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('Supabase query error (falling back to initial items):', error.message);
      return INITIAL_FOOD_ITEMS;
    }

    if (!data || data.length === 0) {
      return INITIAL_FOOD_ITEMS;
    }

    // Map database snake_case or standard fields to FoodItem interface
    return data.map((item: any) => ({
      id: String(item.id || item.food_id),
      name: item.name || item.title,
      description: item.description || '',
      category: item.category || 'snacks',
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      isVeg: item.is_veg !== undefined ? Boolean(item.is_veg) : true,
      isAvailable: item.is_available !== undefined ? Boolean(item.is_available) : true,
      stockQuantity: Number(item.stock_quantity ?? item.stock ?? 50),
      preparationTimeMinutes: Number(item.prep_time ?? item.preparation_time_minutes ?? 7),
      imageUrl: item.image_url || item.imageUrl || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=700&q=80',
      calories: item.calories ? Number(item.calories) : undefined,
      counterNumber: Number(item.counter_number ?? item.counter ?? 1),
      tags: Array.isArray(item.tags) ? item.tags : ['Campus Special'],
      rating: Number(item.rating ?? 4.8),
      ratingCount: Number(item.rating_count ?? 120),
      ingredients: Array.isArray(item.ingredients) ? item.ingredients : [],
      allergens: Array.isArray(item.allergens) ? item.allergens : [],
      isPopular: Boolean(item.is_popular),
      isSpecial: Boolean(item.is_special),
    }));
  } catch (err) {
    console.error('Error querying Supabase products:', err);
    return INITIAL_FOOD_ITEMS;
  }
}

/**
 * Fetch orders from Supabase 'orders' table
 */
export async function fetchOrdersFromSupabase(userId?: string): Promise<Order[]> {
  try {
    if (!isSupabaseConfigured) return INITIAL_ORDERS;

    let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return INITIAL_ORDERS;
    }

    return data.map((d: any) => ({
      id: d.id,
      tokenNumber: d.token_number || d.tokenNumber || 'A-01',
      userId: d.user_id || d.userId,
      userName: d.user_name || d.userName,
      studentId: d.student_id || d.studentId,
      items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items || [],
      subtotal: Number(d.subtotal),
      tax: Number(d.tax),
      discount: Number(d.discount),
      totalAmount: Number(d.total_amount ?? d.totalAmount),
      couponCode: d.coupon_code || d.couponCode,
      paymentMethod: d.payment_method || d.paymentMethod || 'upi',
      paymentStatus: d.payment_status || d.paymentStatus || 'paid',
      paymentGatewayRef: d.payment_ref || d.paymentGatewayRef,
      orderStatus: d.order_status || d.orderStatus || 'pending',
      pickupSlot: d.pickup_slot || d.pickupSlot,
      estimatedPrepTimeMinutes: Number(d.estimated_prep_minutes ?? d.estimatedPrepTimeMinutes ?? 8),
      estimatedReadyTime: d.estimated_ready_time || d.estimatedReadyTime,
      counterNumber: Number(d.counter_number ?? d.counterNumber ?? 1),
      createdAt: d.created_at || new Date().toISOString(),
      updatedAt: d.updated_at || new Date().toISOString(),
      notes: d.notes,
    }));
  } catch {
    return INITIAL_ORDERS;
  }
}

/**
 * Create a new order in Supabase
 */
export async function insertOrderToSupabase(order: Order): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured) return { success: true };

    const { error } = await supabase.from('orders').insert([
      {
        id: order.id,
        token_number: order.tokenNumber,
        user_id: order.userId,
        user_name: order.userName,
        student_id: order.studentId,
        items: order.items,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        total_amount: order.totalAmount,
        coupon_code: order.couponCode,
        payment_method: order.paymentMethod,
        payment_status: order.paymentStatus,
        payment_ref: order.paymentGatewayRef,
        order_status: order.orderStatus,
        pickup_slot: order.pickupSlot,
        estimated_prep_minutes: order.estimatedPrepTimeMinutes,
        estimated_ready_time: order.estimatedReadyTime,
        counter_number: order.counterNumber,
        notes: order.notes,
        created_at: order.createdAt,
      },
    ]);

    if (error) {
      console.warn('Could not insert order to Supabase:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update order status in Supabase
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  status: string
): Promise<{ success: boolean }> {
  try {
    if (!isSupabaseConfigured) return { success: true };

    const { error } = await supabase
      .from('orders')
      .update({ order_status: status, updated_at: new Date().toISOString() })
      .eq('id', orderId);

    if (error) {
      console.warn('Could not update status in Supabase:', error.message);
      return { success: false };
    }

    return { success: true };
  } catch {
    return { success: false };
  }
}

/* ========================================================================== */
/*                        SUPABASE AUTHENTICATION                             */
/* ========================================================================== */

export async function supabaseSignUp(email: string, password: string, studentId: string, fullName: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          student_id: studentId,
          role: 'student',
        },
      },
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function supabaseSignIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return { success: true, user: data.user, session: data.session };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function supabaseSignOut() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
