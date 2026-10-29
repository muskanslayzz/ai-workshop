import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import {
  User,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle2,
  Award,
  CreditCard,
  Mail,
  Phone,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { currentUser, orders, switchDemoRole, settings } = useCanteen();

  const studentOrders = orders.filter((o) => o.userId === currentUser.id);
  const completedOrders = studentOrders.filter((o) => o.orderStatus === 'completed');
  const totalSpent = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Approximate time saved (12 minutes saved per pre-order vs standing in rush lines!)
  const minutesSaved = completedOrders.length * 12;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Student Identity Card */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-800 to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center font-heading font-black text-2xl sm:text-3xl text-white shadow-lg">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
                  {currentUser.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Verified Student
                </span>
              </div>
              <p className="text-xs text-stone-300 font-mono mt-0.5">
                Roll / Student ID: <strong>{currentUser.studentId}</strong>
              </p>
              <p className="text-xs text-stone-400 mt-1">{settings.collegeName}</p>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2">
            <button
              onClick={() => switchDemoRole('staff')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-colors backdrop-blur-xs"
            >
              Switch to Staff KDS
            </button>
            <button
              onClick={() => switchDemoRole('admin')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-900 text-xs font-bold rounded-xl transition-colors shadow-sm"
            >
              Switch to Admin Panel
            </button>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
              Time Saved in Lines
            </span>
            <div className="font-heading font-black text-2xl text-emerald-400 mt-1">
              ~{minutesSaved} mins
            </div>
            <span className="text-[10px] text-stone-400">Queue skip efficiency</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
              Total Pre-Orders
            </span>
            <div className="font-heading font-black text-2xl text-amber-400 mt-1">
              {studentOrders.length}
            </div>
            <span className="text-[10px] text-stone-400">Digital orders placed</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
              Campus Dining Spend
            </span>
            <div className="font-heading font-black text-2xl text-white mt-1">
              ₹{totalSpent}
            </div>
            <span className="text-[10px] text-stone-400">Subsidized total</span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] text-stone-400 font-semibold block uppercase tracking-wider">
              Payment Health
            </span>
            <div className="font-heading font-bold text-sm text-emerald-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              100% Verified
            </div>
            <span className="text-[10px] text-stone-400">UPI / Card enabled</span>
          </div>
        </div>
      </div>

      {/* Account Info & Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-stone-900 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-orange-600" />
            Student Credentials
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 text-stone-500">
                <Mail className="w-4 h-4" />
                <span>Email Address</span>
              </div>
              <span className="font-semibold text-stone-900">{currentUser.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 text-stone-500">
                <Phone className="w-4 h-4" />
                <span>Mobile Contact</span>
              </div>
              <span className="font-semibold text-stone-900">{currentUser.phone || '+91 98765 43210'}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div className="flex items-center gap-2 text-stone-500">
                <Award className="w-4 h-4" />
                <span>Account Status</span>
              </div>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Active & Enrolled
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h3 className="font-heading font-extrabold text-lg text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Campus Canteen Perks
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl">
              <strong className="font-bold text-amber-950 block">Coupon Code: CAMPUS50</strong>
              <p className="text-amber-800 text-[11px] mt-0.5">
                Enjoy 15% discount on all snack & meal combos above ₹80.
              </p>
            </div>

            <div className="p-3 bg-orange-50/60 border border-orange-200/60 rounded-xl">
              <strong className="font-bold text-orange-950 block">Express Token Counter</strong>
              <p className="text-orange-800 text-[11px] mt-0.5">
                Flash your digital token at Counter 1, 2, or 3 for 10-second pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
