import React, { useEffect, useState } from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext.tsx';
import { Navbar } from './components/Navbar.tsx';
import { StudentHome } from './components/StudentHome.tsx';
import { StudentMenu } from './components/StudentMenu.tsx';
import { StudentOrders } from './components/StudentOrders.tsx';
import { StudentProfile } from './components/StudentProfile.tsx';
import { StaffDashboard } from './components/StaffDashboard.tsx';
import { AdminDashboard } from './components/AdminDashboard.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FoodDetailModal } from './components/FoodDetailModal.tsx';
import { OrderTrackingModal } from './components/OrderTrackingModal.tsx';
import { ToastContainer } from './components/ToastContainer.tsx';
import { SupabaseAuthModal } from './components/SupabaseAuthModal.tsx';
import { supabase, fetchProductsFromSupabase, isSupabaseConfigured } from './lib/supabase.ts';
import {
  UtensilsCrossed,
  Heart,
  ShieldCheck,
  ChefHat,
  GraduationCap,
  Clock,
  Sparkles,
  Database,
  LogIn,
  CheckCircle2,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    activeRole,
    activeTab,
    trackedOrder,
    setTrackedOrder,
    settings,
    switchDemoRole,
    isAuthModalOpen,
    setIsAuthModalOpen,
    currentUser,
  } = useCanteen();

  // Direct Supabase product query and session check on app root
  useEffect(() => {
    // 1. Direct Supabase query for products
    fetchProductsFromSupabase().then((products) => {
      console.log(`[Supabase] Loaded ${products.length} products directly from database.`);
    });

    // 2. Direct Supabase query for current authenticated user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('[Supabase Auth] Active session found for:', session.user.email);
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 font-sans">
      {/* Top sticky navigation */}
      <Navbar />

      {/* Supabase Database Active Indicator Banner */}
      <div className="bg-emerald-950 text-emerald-100 text-xs py-1.5 px-4 border-b border-emerald-900/60 font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold">Primary Database:</span>
            <span>Supabase PostgreSQL (<code className="text-emerald-300 font-mono">tiz2oezmwfkd9y1x5ria.supabase.co</code>)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-white font-bold transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>{currentUser.email ? currentUser.name : 'Supabase Sign In / Register'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeRole === 'student' && (
          <>
            {activeTab === 'home' && <StudentHome />}
            {activeTab === 'menu' && <StudentMenu />}
            {activeTab === 'orders' && <StudentOrders />}
            {activeTab === 'profile' && <StudentProfile />}
          </>
        )}

        {activeRole === 'staff' && <StaffDashboard />}

        {activeRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Modals & Drawers */}
      <CartDrawer />
      <FoodDetailModal />
      <OrderTrackingModal order={trackedOrder} onClose={() => setTrackedOrder(null)} />
      <SupabaseAuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <ToastContainer />

      {/* College Project Footer */}
      <footer className="mt-auto bg-stone-900 text-stone-300 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Branding */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
                <span className="font-heading font-black text-xl text-white tracking-tight">
                  Bit<span className="text-orange-500">Bite</span>
                </span>
              </div>
              <p className="text-xs text-stone-400 max-w-md leading-relaxed">
                BitBite is an innovative digital college canteen food ordering and queue management system backed by Supabase PostgreSQL, designed to eliminate 15-minute recess lines, streamline kitchen prep tickets, and offer students seamless online payments and express pickup.
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Operating Hours: {settings.openingHours}</span>
              </div>
            </div>

            {/* Quick Demo Switcher */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                Demo Role Switcher
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    onClick={() => switchDemoRole('student')}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <GraduationCap className="w-3.5 h-3.5 text-orange-400" />
                    Student Ordering Panel
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchDemoRole('staff')}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ChefHat className="w-3.5 h-3.5 text-amber-400" />
                    Kitchen Display System (KDS)
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => switchDemoRole('admin')}
                    className="hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Canteen Admin Console
                  </button>
                </li>
              </ul>
            </div>

            {/* Counters */}
            <div className="space-y-3">
              <h4 className="font-heading font-bold text-xs uppercase tracking-wider text-amber-400">
                Express Counters
              </h4>
              <div className="space-y-2 text-xs text-stone-400">
                <div>
                  <strong className="text-white">Counter 1:</strong> Breakfast & Quick Snacks
                </div>
                <div>
                  <strong className="text-white">Counter 2:</strong> Lunch Thalis & Rice Bowls
                </div>
                <div>
                  <strong className="text-white">Counter 3:</strong> Beverages, Burgers & Chinese
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-2">
            <div>
              © 2026 BitBite – Digital College Canteen Platform • Backed by Supabase • {settings.collegeName}
            </div>
            <div className="flex items-center gap-1">
              Developed for College Engineering Project
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <MainContent />
    </CanteenProvider>
  );
}
