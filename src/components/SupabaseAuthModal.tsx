import React, { useState } from 'react';
import { supabaseSignIn, supabaseSignUp, supabaseSignOut } from '../lib/supabase.ts';
import { useCanteen } from '../context/CanteenContext.tsx';
import { X, Lock, Mail, User, GraduationCap, ArrowRight, Loader2, Database, CheckCircle2 } from 'lucide-react';

interface SupabaseAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseAuthModal: React.FC<SupabaseAuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, addToast } = useCanteen();
  const [isRegister, setIsRegister] = useState<boolean>(false);
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      if (isRegister) {
        const res = await supabaseSignUp(email, password, studentId, fullName);
        if (res.success) {
          addToast('Account created in Supabase! You are now logged in.', 'success');
          onClose();
        } else {
          setErrorMessage(res.error || 'Failed to sign up');
        }
      } else {
        const res = await supabaseSignIn(email, password);
        if (res.success) {
          addToast('Signed in successfully via Supabase!', 'success');
          onClose();
        } else {
          setErrorMessage(res.error || 'Invalid credentials');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-stone-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1">
            <Database className="w-4 h-4" />
            Supabase Primary Authentication
          </div>

          <h3 className="font-heading font-black text-2xl text-white">
            {isRegister ? 'Student Registration' : 'Student Sign In'}
          </h3>
          <p className="text-xs text-stone-400 mt-0.5">
            Connected to Supabase project <code className="text-amber-300">tiz2oezmwfkd9y1x5ria</code>
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {isRegister && (
            <>
              <div>
                <label className="block font-bold text-stone-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Rahul Sharma"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">College Roll / Student ID</label>
                <div className="relative">
                  <GraduationCap className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="CS-2023-042"
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block font-bold text-stone-700 mb-1">College Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@college.edu"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isRegister ? 'Complete Supabase Registration' : 'Sign In with Supabase'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="pt-2 text-center text-xs text-stone-500">
            {isRegister ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="font-bold text-orange-600 hover:underline"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                New to BitBite?{' '}
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  className="font-bold text-orange-600 hover:underline"
                >
                  Create an account
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
