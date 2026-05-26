import { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import { getProducts } from '../services/api';

const CATEGORIES = ['Electronics', 'Fashion', 'Gaming', 'Home & Living', 'Beauty', 'Sports', 'Books', 'Collectibles', 'Art', 'Jewelry'];
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
    { value: 'popular', label: 'Most Popular' },
];

export default function Products() {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    const isDealsPage = location.pathname === '/deals';
    const [products, setProducts] = useState([]);
    const [showFilters, setShowFilters] = useState(false);
const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const urlPage = parseInt(searchParams.get('page') || '1', 10);
    const [page, setPage] = useState(urlPage);
    const [pages, setPages] = useState(1);
    // Keep URL page in sync when page state changes
    useEffect(() => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('page', String(page));
        setSearchParams(newParams);
    }, [page]);

    // Filters derived from URL
    const filters = {
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        sort: searchParams.get('sort') || 'newest',
        isFeatured: searchParams.get('isFeatured') === 'true',
        isTrending: searchParams.get('isTrending') === 'true',
        isFlashSale: searchParams.get('isFlashSale') === 'true',
        hasDiscount: isDealsPage ? 'true' : searchParams.get('hasDiscount'),
    };

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = { page, limit: 12, ...filters };
            // Clean empty params
            Object.keys(params).forEach(k => !params[k] && params[k] !== 0 && delete params[k]);
            const { data } = await getProducts(params);
            setProducts(data.products);
            setTotal(data.total);
            setPages(data.pages);
        } catch (error) {
            console.error('Fetch products error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [searchParams]); // Refetch when URL params (including page) change

    const updateFilter = (key, val) => {
        const newParams = new URLSearchParams(searchParams);
        if (val) {
            newParams.set(key, String(val));
        } else {
            newParams.delete(key);
        }
        newParams.set('page', '1'); // Reset to page 1 on filter
        setSearchParams(newParams);
        setPage(1);
    };

    const clearFilters = () => {
        setSearchParams({});
        setPage(1);
    };

    return (
        <div className="min-h-screen pt-8 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-orbitron text-3xl font-bold text-white uppercase tracking-tighter">
                            {isDealsPage ? 'Deals & Super Offers' : (filters.category || (filters.isFlashSale ? 'Flash Sale' : filters.isTrending ? 'Trending' : filters.isFeatured ? 'Featured' : 'All Products'))}
                        </h1>
                        <p className="text-slate-400 mt-1">{total} {isDealsPage ? 'exclusive deals' : 'products'} found</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={filters.sort}
                            onChange={e => updateFilter('sort', e.target.value)}
                            className="input-glass text-sm py-2 w-44"
                        >
                            {SORT_OPTIONS.map(o => (
                                <option key={o.value} value={o.value} className="bg-[#0d1120]">{o.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 btn-secondary text-sm py-2 px-4 whitespace-nowrap"
                        >
                            <SlidersHorizontal size={15} /> Filters
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters sidebar */}
                    <motion.aside
                        initial={false}
                        animate={{ width: showFilters ? 260 : 0, opacity: showFilters ? 1 : 0 }}
                        className="overflow-hidden shrink-0"
                    >
                        <div className="glass rounded-2xl p-5 w-[260px]">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-white font-semibold">Filters</h3>
                                <button onClick={clearFilters} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                                    <X size={14} /> Clear
                                </button>
                            </div>

                            {/* Search */}
                            <div className="mb-6">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block font-bold">Search</label>
                                <div className="relative">
                                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={filters.search}
                                        onChange={e => updateFilter('search', e.target.value)}
                                        placeholder="Type to search..."
                                        className="input-glass text-sm pl-9 py-2.5 w-full"
                                    />
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-6">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block font-bold">Category</label>
                                <div className="flex flex-col gap-1.5">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
                                            className={`text-left text-sm px-3 py-2 rounded-xl transition-all ${filters.category === cat
                                                ? 'bg-purple-600/20 text-purple-300 border border-purple-500/40 shadow-lg shadow-purple-500/10'
                                                : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price range */}
                            <div className="mb-6">
                                <label className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 block font-bold">Price Range (₹)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        value={filters.minPrice}
                                        onChange={e => updateFilter('minPrice', e.target.value)}
                                        placeholder="Min"
                                        className="input-glass text-sm py-2 px-3 w-full"
                                    />
                                    <input
                                        type="number"
                                        value={filters.maxPrice}
                                        onChange={e => updateFilter('maxPrice', e.target.value)}
                                        placeholder="Max"
                                        className="input-glass text-sm py-2 px-3 w-full"
                                    />
                                </div>
                            </div>

                            {/* Quick filters */}
                            <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                                {[
                                    ['isFeatured', 'Featured Items'],
                                    ['isTrending', 'Trending Now'],
                                    ['isFlashSale', 'Flash Sales']
                                ].map(([k, l]) => (
                                    <label key={k} className="flex items-center gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${filters[k] ? 'bg-purple-600 border-purple-600' : 'border-slate-600 group-hover:border-purple-500'
                                            }`}>
                                            {filters[k] && <div className="w-2 h-2 bg-white rounded-full shadow-sm" />}
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={filters[k]}
                                            onChange={e => updateFilter(k, e.target.checked)}
                                            className="hidden"
                                        />
                                        <span className={`text-sm transition-colors ${filters[k] ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{l}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </motion.aside>

                    {/* Products grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {Array(8).fill(0).map((_, i) => (
                                    <div key={i} className="glass rounded-2xl h-80 shimmer-bg" />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-20 glass rounded-3xl border border-white/5 relative overflow-hidden group">
                                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                                <div className="relative z-10">
                                    <div className="text-6xl mb-6 filter drop-shadow-2xl">
                                        {isDealsPage ? '🏷️' : '🔍'}
                                    </div>
                                    <h3 className="text-white font-semibold text-xl">
                                        {isDealsPage ? 'No Deals Available Right Now' : 'No products found'}
                                    </h3>
                                    <p className="text-slate-400 mt-2 max-w-xs mx-auto">
                                        {isDealsPage
                                            ? "Check back soon for exclusive discounts and limited-time offers!"
                                            : "We couldn't find anything matching your filters. Try clearing some selections."}
                                    </p>
                                    <button onClick={clearFilters} className="mt-8 btn-secondary px-8 py-3 rounded-xl border border-white/10 hover:border-purple-500/50 transition-all font-medium">
                                        {isDealsPage ? 'View All Products' : 'Clear All Filters'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {products.map((p, i) => <ProductCard key={p._id} product={p} index={i} />)}
                                </div>
                                {pages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-12">
                                        {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                            <button
                                                key={p}
                                        onClick={() => {
                                            const newParams = new URLSearchParams(searchParams);
                                            newParams.set('page', String(p));
                                            setSearchParams(newParams);
                                            window.scrollTo({ top: 0, behavior: 'smooth' });
                                        }}
                                                className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${p === page
                                                    ? 'bg-gradient-to-br from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                                                    : 'glass text-slate-400 hover:text-white hover:border-purple-500/50'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
