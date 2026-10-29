import React from 'react';
import { FoodItem } from '../types/index.ts';
import { useCanteen } from '../context/CanteenContext.tsx';
import { Clock, Star, Plus, Minus, Check } from 'lucide-react';

interface FoodCardProps {
  item: FoodItem;
}

export const FoodCard: React.FC<FoodCardProps> = ({ item }) => {
  const { cart, addToCart, updateQuantity, setFoodDetailModalItem } = useCanteen();

  const cartItem = cart.find((ci) => ci.foodItem.id === item.id);
  const currentQty = cartItem ? cartItem.quantity : 0;

  return (
    <div className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-orange-200 transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Top Image Container */}
      <div
        onClick={() => setFoodDetailModalItem(item)}
        className="relative h-44 sm:h-48 w-full overflow-hidden bg-stone-100 cursor-pointer"
      >
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Veg / Non-Veg Indicator */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg shadow-xs flex items-center justify-center">
          <div
            className={`w-4 h-4 border-2 flex items-center justify-center ${
              item.isVeg ? 'border-emerald-600' : 'border-rose-600'
            }`}
          >
            <div
              className={`w-2 h-2 ${
                item.isVeg ? 'rounded-full bg-emerald-600' : 'bg-rose-600 transform rotate-45'
              }`}
            />
          </div>
        </div>

        {/* Prep Time Badge */}
        <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{item.preparationTimeMinutes} min</span>
        </div>

        {/* Counter Tag */}
        <div className="absolute bottom-2.5 left-3 bg-white/90 backdrop-blur-xs text-stone-800 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
          Counter {item.counterNumber}
        </div>

        {/* Popular / Special Pill */}
        {item.isSpecial && (
          <div className="absolute bottom-2.5 right-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
            Special
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-stone-900/75 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-lg transform -rotate-3">
              Sold Out
            </span>
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header Title & Rating */}
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3
              onClick={() => setFoodDetailModalItem(item)}
              className="font-heading font-bold text-base sm:text-lg text-stone-900 group-hover:text-orange-600 transition-colors cursor-pointer line-clamp-1"
              title={item.name}
            >
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded-md shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Description */}
          <p
            onClick={() => setFoodDetailModalItem(item)}
            className="text-xs text-stone-500 line-clamp-2 leading-relaxed mb-3 cursor-pointer"
          >
            {item.description}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg sm:text-xl font-extrabold text-stone-900 font-heading">
                ₹{item.price}
              </span>
              {item.originalPrice && item.originalPrice > item.price && (
                <span className="text-xs text-stone-400 line-through">₹{item.originalPrice}</span>
              )}
            </div>
            <span className="text-[10px] text-stone-400 block font-medium">Incl. Canteen Subsidy</span>
          </div>

          {/* Action button */}
          <div>
            {!item.isAvailable ? (
              <button
                disabled
                className="px-3 py-1.5 text-xs font-bold bg-stone-100 text-stone-400 rounded-xl cursor-not-allowed"
              >
                Unavailable
              </button>
            ) : currentQty === 0 ? (
              <button
                onClick={() => addToCart(item, 1)}
                className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm px-3.5 py-2 rounded-xl shadow-xs shadow-orange-600/20 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add</span>
              </button>
            ) : (
              <div className="flex items-center bg-orange-50 border border-orange-200 rounded-xl p-0.5 shadow-xs">
                <button
                  onClick={() => updateQuantity(item.id, currentQty - 1)}
                  className="w-7 h-7 flex items-center justify-center text-orange-700 hover:bg-orange-100 rounded-lg transition-colors font-bold"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-7 text-center font-bold text-orange-900 text-xs sm:text-sm">
                  {currentQty}
                </span>
                <button
                  onClick={() => updateQuantity(item.id, currentQty + 1)}
                  className="w-7 h-7 flex items-center justify-center text-orange-700 hover:bg-orange-100 rounded-lg transition-colors font-bold"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
