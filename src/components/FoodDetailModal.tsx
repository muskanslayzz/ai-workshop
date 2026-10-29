import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { X, Clock, Flame, ShieldAlert, Star, Plus, Minus, Check, MessageSquare } from 'lucide-react';

export const FoodDetailModal: React.FC = () => {
  const { foodDetailModalItem, setFoodDetailModalItem, addToCart, cart, updateQuantity } = useCanteen();
  const [quantity, setQuantity] = useState<number>(1);
  const [instructions, setInstructions] = useState<string>('');

  if (!foodDetailModalItem) return null;

  const item = foodDetailModalItem;
  const existingInCart = cart.find((ci) => ci.foodItem.id === item.id);

  const handleAdd = () => {
    addToCart(item, quantity, instructions);
    setFoodDetailModalItem(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={() => setFoodDetailModalItem(null)}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 sm:h-72 w-full bg-stone-100">
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Badges on Image */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between text-white">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-white/90 text-stone-900 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1.5 shadow-xs">
                  <div
                    className={`w-3 h-3 border-2 flex items-center justify-center ${
                      item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                    }`}
                  >
                    <div
                      className={`w-1.5 h-1.5 ${
                        item.isVeg ? 'rounded-full bg-emerald-600' : 'bg-rose-600'
                      }`}
                    />
                  </div>
                  {item.isVeg ? 'Pure Veg' : 'Non-Veg'}
                </span>
                <span className="bg-stone-900/80 backdrop-blur-xs text-xs font-semibold px-2.5 py-0.5 rounded-md">
                  Counter {item.counterNumber}
                </span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white">
                {item.name}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-extrabold font-heading text-amber-400">
                ₹{item.price}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="block text-xs text-stone-300 line-through">₹{item.originalPrice}</span>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Quick Metrics */}
          <div className="flex items-center gap-4 py-2 border-b border-stone-100 text-xs sm:text-sm text-stone-600">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>
                Prep Time: <strong className="text-stone-900">{item.preparationTimeMinutes} mins</strong>
              </span>
            </div>
            {item.calories && (
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>
                  Calories: <strong className="text-stone-900">~{item.calories} kcal</strong>
                </span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>
                Rating: <strong className="text-stone-900">{item.rating.toFixed(1)}</strong> ({item.ratingCount} reviews)
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">About this dish</h4>
            <p className="text-sm text-stone-700 leading-relaxed">{item.description}</p>
          </div>

          {/* Ingredients list */}
          {item.ingredients && item.ingredients.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Key Ingredients</h4>
              <div className="flex flex-wrap gap-1.5">
                {item.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-stone-100 text-stone-700 font-medium px-2.5 py-1 rounded-lg"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Allergens Notice */}
          {item.allergens && item.allergens.length > 0 && (
            <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Allergen Notice:</strong> Contains{' '}
                {item.allergens.join(', ')}. Please inform counter staff if you have severe dietary allergies.
              </div>
            </div>
          )}

          {/* Special Cooking Instructions */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-stone-700 mb-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
              Special Kitchen Instructions (Optional)
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g., Less spicy, extra green chutney, no onions..."
              maxLength={100}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4">
          {/* Quantity selector */}
          <div className="flex items-center bg-white border border-stone-200 rounded-2xl p-1 shadow-xs">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-stone-900 text-sm">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors font-bold"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add to Cart button */}
          <button
            onClick={handleAdd}
            disabled={!item.isAvailable}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl font-bold text-sm shadow-md transition-all ${
              item.isAvailable
                ? 'bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/20 active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Add {quantity} to Tray • ₹{item.price * quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
