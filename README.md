# Smart Canteen – Digital College Canteen Platform

A modern, responsive, and full-stack web application designed to digitize college campus canteen operations, eliminate 15-minute recess lines, manage kitchen preparation queues, and offer seamless online ordering with express digital token pickup.

---

## 1. Project Objectives
- **Reduce Waiting Time & Overcrowding:** Eliminate long lines during short recess (11:15 AM) and lunch break (1:00 PM).
- **Online Food Pre-Ordering:** Enable students to browse food menus from hostels or classrooms and schedule pickup slots.
- **Smart Queue Management:** Dynamically pace kitchen tickets based on counter capacity and prepare orders chronologically.
- **Accurate Live Preparation Estimates:** Calculate dynamic prep times based on actual dish cooking duration and current queue backlog.
- **Flexible Digital Payments:** Support instant UPI (PhonePe, Google Pay, Paytm), debit/credit card gateway, and cash-on-desk options.
- **Staff & Admin Productivity:** Provide a Kitchen Display System (KDS) for kitchen chefs and an administrative dashboard for menu, stock, sales, and promo management.

---

## 2. Key Features

### A. Student Panel
- **Authentic Campus Menu:** Indian canteen staples (Aloo Paratha, Poha, Deluxe Veg Thali, Rajma Chawal, Chole Bhature, Samosas, Adrak Masala Chai, Frappe Cold Coffee, Momos, Maggi, and Burgers).
- **Search & Filters:** Search by dish name, filter by category (Breakfast, Lunch, Snacks, Beverages, Fast Food), Pure-Veg toggle, and Student Budget slider (Under ₹30, ₹50, ₹70, ₹100).
- **Dish Details Modal:** Detailed ingredients, preparation time, calorie counts, allergen notices, and custom kitchen cooking instructions (e.g., "extra green chutney", "less spicy").
- **Smart Recess Slots:** Select break windows with live capacity tracking and rush-hour warning indicators to prevent counter overcrowding.
- **Coupons & Promo Codes:** Apply campus coupons such as `CAMPUS50`, `WELCOME20`, or `CHAI20` with real-time bill discount calculations.
- **Simulated Payment Gateway:** Razorpay / UPI QR code simulation, test debit card authorization, and cash on pickup option.
- **Digital Token & Live Progress Stepper:**
  - Unique token code (e.g., `A-14`, `B-22`) with verifiable QR code.
  - 5-stage live status: Order Placed ➔ Kitchen Accepted ➔ Cooking & Packing 🔥 ➔ Ready for Pickup 🎉 (triggers confetti & audio chime!) ➔ Handed Over.
  - Assigned express pickup counter (Counter 1, 2, or 3).
- **1-Click Quick Reorder:** Repeat favorite meals directly from order history.
- **Post-Meal Ratings:** 5-star rating and written review submission.

### B. Canteen Staff Panel (Kitchen Display System - KDS)
- **Live Streamed Tickets:** Auto-refreshing queue of incoming, cooking, and ready orders.
- **Counter Filtering:** Route orders to Counter 1 (Breakfast/Snacks), Counter 2 (Lunch/Thalis), or Counter 3 (Beverages/FastFood).
- **Cooking Instructions:** Clear visual highlight for special student requests (e.g. "No onions", "Crispy rotis").
- **One-Click Progression:** Advance tickets through "Start Preparing" ➔ "Mark Ready & Alert Student" ➔ "Handed Over".
- **Token Search:** Quickly find orders by token code when students arrive at the counter.

### C. Canteen Admin Console
- **Sales Analytics & KPIs:** Today's revenue, order counts, average turnaround time, and active kitchen load.
- **Rush Hour Distribution:** Hourly order traffic graph clustered around break times.
- **Menu Management (CRUD):** Add new dishes, edit prices, update photos, adjust preparation times, or toggle availability ("Sold Out") with one click.
- **Slot Capacity Pacing:** Adjust maximum orders per slot to protect kitchen throughput.
- **Coupon Manager:** Create and activate discount promo codes.
- **Broadcast Announcements:** Send real-time notices displayed on students' app headers.

---

## 3. Technology Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** Node.js with Express, providing RESTful API endpoints.
- **Development Tooling:** Vite 8, `tsx`, `@tailwindcss/vite`.
- **Audio Synthesizer:** Native Web Audio API for responsive order status chimes.
- **Database Architecture:** In-memory store initialized with realistic seed records, easily portable to Firestore or PostgreSQL.

---

## 4. Project Structure

```
├── server.ts                  # Express full-stack backend with Vite middleware
├── index.html                 # Main HTML entry point with campus typography
├── metadata.json              # AI Studio app metadata
├── package.json               # Dependencies and scripts
├── src/
│   ├── main.tsx               # React root mounting
│   ├── App.tsx                # App container with navigation and view routing
│   ├── index.css              # Tailwind CSS styling and font definitions
│   ├── types/
│   │   └── index.ts           # TypeScript interfaces (FoodItem, Order, User, Slot, Coupon)
│   ├── context/
│   │   └── CanteenContext.tsx # Central state management, cart, and live polling
│   ├── utils/
│   │   └── audio.ts           # Web Audio API chime synthesizer
│   ├── server/
│   │   └── dataStore.ts       # Realistic seed dataset of canteen items & orders
│   └── components/
│       ├── Navbar.tsx             # Header with role switcher, queue status, and cart button
│       ├── StudentHome.tsx        # Hero section, queue widget, budget filters, specials
│       ├── StudentMenu.tsx        # Menu catalog with search, category tabs, and filters
│       ├── FoodCard.tsx           # Food card with veg badge, price, and add stepper
│       ├── FoodDetailModal.tsx    # Modal with ingredients, allergens, and custom notes
│       ├── CartDrawer.tsx         # Tray slideover with slot selection and coupons
│       ├── PaymentModal.tsx       # Simulated Razorpay / UPI QR payment gateway
│       ├── OrderTrackingModal.tsx # Digital token, status stepper, and rating form
│       ├── StudentOrders.tsx      # Active orders and order history with 1-click reorder
│       ├── StudentProfile.tsx     # Student credentials and queue time saved metric
│       ├── StaffDashboard.tsx     # Kitchen Display System (KDS) for canteen chefs
│       ├── AdminDashboard.tsx     # Analytics, menu CRUD, slot pacing, and settings
│       └── ToastContainer.tsx     # Floating toast notification manager
```

---

## 5. Getting Started & Installation

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or yarn

### Installation Steps
1. Clone or download the repository:
   ```bash
   git clone <repo-url>
   cd smart-canteen
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:3000`.

4. Build for production:
   ```bash
   npm run build
   ```

---

## 5.1 Payment Gateway Configuration (Publishable & Secret Keys)

The application supports both **Sandbox / Test Mode** (default out-of-the-box demo) and **Production Live Mode** via Razorpay or any compatible gateway.

### Environment Variables
Configure these variables in your `.env` file or Cloud Run / server environment secrets:

| Variable Name | Type | Description |
|---|---|---|
| `RAZORPAY_KEY_ID` | **Publishable Key** | Safe to share with client browsers. Starts with `rzp_test_...` in test mode or `rzp_live_...` in production. |
| `RAZORPAY_KEY_SECRET` | **Secret Key** | **Strictly confidential.** Kept on the backend server (`server.ts`) to verify HMAC SHA256 payment signatures. Never sent to frontend code. |
| `PAYMENT_MODE` | Setting | Set to `"test"` for sandbox testing or `"live"` for actual bank transactions. |

### Where to view & test in UI:
- Open the **Admin Console** (click "Admin" in top bar) ➔ **"Payment Gateway & Keys"** tab.
- Here you can inspect the active Publishable Key, confirm Secret Key masking, and run the **"Run Verification Test"** button to execute a live cryptographic HMAC SHA256 handshake check.

---

## 5.2 Supabase Primary Backend Database & Authentication

The application is configured to use **Supabase** as its primary cloud database and authentication provider.

### Environment Variables
Configured in `/.env` and `src/lib/supabase.ts`:

```env
# Supabase Project Credentials
VITE_SUPABASE_URL="https://tiz2oezmwfkd9y1x5ria.supabase.co"
VITE_SUPABASE_ANON_KEY="sb_publishable_tiz2OezmwfkD9y1x5RIA8g_K9ld9THS"
```

### Optional Supabase Database Schema (SQL)
To create native PostgreSQL tables in your Supabase project SQL Editor:

```sql
-- 1. Food Products Table
create table if not exists products (
  id text primary key,
  name text not null,
  description text,
  category text not null,
  price numeric not null,
  original_price numeric,
  is_veg boolean default true,
  is_available boolean default true,
  stock_quantity integer default 50,
  prep_time integer default 7,
  image_url text,
  counter_number integer default 1,
  rating numeric default 4.8,
  rating_count integer default 120,
  is_special boolean default false,
  is_popular boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Orders Table
create table if not exists orders (
  id text primary key,
  token_number text not null,
  user_id text,
  user_name text,
  student_id text,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null,
  tax numeric not null,
  discount numeric not null default 0,
  total_amount numeric not null,
  coupon_code text,
  payment_method text not null,
  payment_status text not null default 'paid',
  payment_ref text,
  order_status text not null default 'pending',
  pickup_slot text,
  estimated_prep_minutes integer default 8,
  estimated_ready_time text,
  counter_number integer default 1,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);
```

---

## 6. How to Test & Demonstrate the App

1. **Student Ordering Flow:**
   - On the homepage, select **"Explore Today's Menu"** or browse by category.
   - Use the **Budget Filter** (e.g. "Under ₹50") or search for "Thali".
   - Click on a dish to inspect ingredients and enter a note like *"extra green chutney"*.
   - Add items to the tray and open the Cart.
   - Select a break slot (e.g., *11:15 AM Short Recess*).
   - Enter promo code `CAMPUS50` to apply a 15% discount.
   - Click **"Place Order"**, choose UPI QR or Card, and authorize payment.
   - Observe the generated **Digital Token** (e.g., `A-15`) and the live queue stepper.

2. **Kitchen Staff Flow:**
   - In the top navigation, click the **"Kitchen"** role switcher.
   - Notice the new incoming ticket with the student's custom cooking note.
   - Click **"Start Preparing Now"** (advances order to "Preparing").
   - Click **"Mark Ready & Alert Student"** (triggers celebration chime and ready badge).

3. **Canteen Admin Flow:**
   - In the top navigation, click the **"Admin"** role switcher.
   - Check real-time daily revenue, peak hour rush distribution, and popular dishes.
   - Navigate to **"Menu & Dishes"** and toggle an item to *"Sold Out"* or click **"Add New Dish"**.
   - Navigate to **"Recess Slot Capacities"** to adjust maximum bookings per slot.
   - Update the **Campus Announcement Banner** in Settings and see it broadcast in real-time.

4. **Resetting Demo Data:**
   - Click the circular arrow icon in the navbar at any time to reset all sample data to the fresh state.
