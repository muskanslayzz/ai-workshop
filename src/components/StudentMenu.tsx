import React, { useState, useMemo } from 'react';
import { useCanteen } from '../context/CanteenContext.tsx';
import { FoodCard } from './FoodCard.tsx';
import { FoodCategory } from '../types/index.ts';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  Clock,
  ArrowUpDown,
  Filter,
} from 'lucide-react';

export const StudentMenu: React.FC = () => {
  const { menuItems, loadingMenu } = useCanteen();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [vegOnly, setVegOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'prep-time'>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(120);

  const categories: { id: FoodCategory | 'all'; name: string; icon: string }[] = [
    { id: 'all', name: 'All Dishes', icon: '🍽️' },
    { id: 'breakfast', name: 'Breakfast', icon: '🥞' },
    { id: 'lunch', name: 'Lunch', icon: '🍛' },
    { id: 'snacks', name: 'Snacks', icon: '🥟' },
    { id: 'beverages', name: 'Beverages', icon: '☕' },
    { id: 'fast_food', name: 'Fast Food', icon: '🍔' },
  ];

  const filteredItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        // Category filter
        if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

        // Veg filter
        if (vegOnly && !item.isVeg) return false;

        // Price filter
        if (item.price > maxPrice) return false;

        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.name.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchTags = item.tags?.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchDesc && !matchCat && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'prep-time') return a.preparationTimeMinutes - b.preparationTimeMinutes;
        // Default popular
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
  }, [menuItems, selectedCategory, vegOnly, maxPrice, searchQuery, sortBy]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header & Search */}
      <div className="bg-white rounded-3xl p-6 border border-stone-200/80 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-stone-900 tracking-tight">
              College Canteen Food Menu
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
              Freshly prepared campus snacks, hot meals, and drinks with instant pre-ordering.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search samosa, chai, thali, momos..."
              className="w-full text-xs sm:text-sm pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const count =
              cat.id === 'all'
                ? menuItems.length
                : menuItems.filter((i) => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                    : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-extrabold ${
                    isSelected ? 'bg-orange-800 text-white' : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Secondary Filter Bar: Veg Only, Price Slider, Sort By */}
        <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Pure Veg Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={vegOnly}
                onChange={(e) => setVegOnly(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-9 h-5 rounded-full transition-colors flex items-center p-0.5 ${
                  vegOnly ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${
                    vegOnly ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </div>
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                Pure Veg Only
              </span>
            </label>

            {/* Price Cap Filter */}
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Max Price:</span>
              <span className="font-bold text-stone-900 w-10">₹{maxPrice}</span>
              <input
                type="range"
                min={20}
                max={120}
                step={5}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 sm:w-32 accent-orange-600"
              />
            </div>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="text-stone-500 font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 text-stone-800 font-bold px-2.5 py-1.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-orange-500"
            >
              <option value="popular">Most Popular ★</option>
              <option value="price-asc">Price: Low to High (₹)</option>
              <option value="price-desc">Price: High to Low (₹)</option>
              <option value="prep-time">Fastest Prep Time ⏱️</option>
            </select>
          </div>
        </div>
      </div>

      {/* Food Items Grid */}
      {loadingMenu ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-72 border border-stone-200 animate-pulse p-4 flex flex-col justify-between"
            >
              <div className="h-40 bg-stone-200 rounded-xl" />
              <div className="space-y-2">
                <div className="h-4 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto text-2xl">
            🔍
          </div>
          <h3 className="font-heading font-bold text-lg text-stone-800">
            No dishes found matching your filters
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Try adjusting your search keyword, unchecking pure-veg, or increasing the maximum price slider.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setVegOnly(false);
              setMaxPrice(120);
            }}
            className="px-4 py-2 bg-stone-900 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <FoodCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};
