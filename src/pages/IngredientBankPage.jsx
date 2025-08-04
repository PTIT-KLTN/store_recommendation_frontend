import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ingredients/ProductCard';
import Footer from '../components/Footer';
import IngredientCategories from '../components/ingredients/IngredientCategories';
import { ingredientService } from '../services/ingredientService';
import { useDebounce } from '../hooks/useDebounce';

const IngredientBankPage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState("Tất cả");
    const [currentPage, setCurrentPage] = useState(0);
    const [pagination, setPagination] = useState({
        totalPages: 0,
        totalElements: 0,
        hasNext: false,
        hasPrevious: false
    });
    const [searchPattern, setSearchPattern] = useState('');
    const [searchInput, setSearchInput] = useState(''); // New state for input
    const [featuredIngredients, setFeaturedIngredients] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const pageSize = 32;

    // Debounce search input for suggestions 
    const debouncedSearchInput = useDebounce(searchInput, 500);

    // Fetch ingredients with current filters
    const fetchIngredients = useCallback(async (page, filters = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await ingredientService.getIngredients(page, pageSize, filters);

            if (response) {
                setIngredients(response.ingredients || []);
                setPagination(response.pagination || {
                    totalPages: 0,
                    totalElements: 0,
                    hasNext: false,
                    hasPrevious: false
                });
            }
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            setError("Có lỗi xảy ra khi tải dữ liệu nguyên liệu. Vui lòng thử lại sau.");
            setIngredients([]);
            setPagination({
                totalPages: 0,
                totalElements: 0,
                hasNext: false,
                hasPrevious: false
            });
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // Fetch featured ingredients (first page without filters)
    const fetchFeaturedIngredients = useCallback(async () => {
        try {
            const response = await ingredientService.getIngredients(0, 8, {});
            if (response && response.ingredients) {
                setFeaturedIngredients(response.ingredients);
            }
        } catch (error) {
            console.error("Error fetching featured ingredients:", error);
        }
    }, []);

    // Build filters object based on current state
    const buildFilters = useCallback(() => {
        const filters = {};
        
        if (searchPattern) {
            filters.pattern = searchPattern;
        }
        
        if (activeCategory && activeCategory !== "Tất cả") {
            filters.category = activeCategory;
        }
        
        return filters;
    }, [searchPattern, activeCategory]);

    // Fetch suggestions for search autocomplete with debounced input
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoadingSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const response = await ingredientService.getSuggestions(query, 10);
            if (response && response.suggestions) {
                setSuggestions(response.suggestions);
                setShowSuggestions(true);
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            setSuggestions([]);
            setShowSuggestions(false);
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    // Fetch ingredients when page or filters change
    useEffect(() => {
        const filters = buildFilters();
        fetchIngredients(currentPage, filters);
    }, [currentPage, searchPattern, activeCategory, fetchIngredients, buildFilters]);

    // Fetch featured ingredients on component mount
    useEffect(() => {
        fetchFeaturedIngredients();
    }, [fetchFeaturedIngredients]);

    // Fetch suggestions when debounced search input changes
    useEffect(() => {
        fetchSuggestions(debouncedSearchInput);
    }, [debouncedSearchInput, fetchSuggestions]);

    // Handle search form submission
    const handleSearch = (searchTerm) => {
        if (searchTerm !== searchPattern) {
            setCurrentPage(0);
            setSearchPattern(searchTerm);
            setShowSuggestions(false);
            // Reset category when searching
            if (searchTerm && activeCategory !== "Tất cả") {
                setActiveCategory("Tất cả");
            }
        }
    };

    // Handle search input change for suggestions (debounced)
    const handleSearchInputChange = (searchTerm) => {
        setSearchInput(searchTerm);
        // Don't call fetchSuggestions directly - let the debounced effect handle it
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        const searchText = suggestion.text || suggestion.vietnamese_text || '';
        setSearchPattern(searchText);
        setSearchInput(searchText); // Update input as well
        setCurrentPage(0);
        setShowSuggestions(false);
        
        // If suggestion is a category, set it as active category
        if (suggestion.type === 'category') {
            setActiveCategory(suggestion.category);
            setSearchPattern(''); // Clear search when selecting category
            setSearchInput(''); // Clear input as well
        }
    };

    // Handle category change
    const handleCategoryChange = (category) => {
        if (category !== activeCategory) {
            setCurrentPage(0);
            setActiveCategory(category);
            setShowSuggestions(false);
            // Clear search when changing category
            if (searchPattern) {
                setSearchPattern('');
                setSearchInput(''); // Clear input as well
            }
        }
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage !== currentPage && newPage >= 0 && newPage < pagination.totalPages) {
            window.scrollTo(0, 0);
            setCurrentPage(newPage);
        }
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchPattern('');
        setSearchInput(''); // Clear input as well
        setActiveCategory("Tất cả");
        setCurrentPage(0);
        setShowSuggestions(false);
    };

    // Render pagination
    const renderPagination = () => {
        if (pagination.totalPages <= 1) return null;

        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(pagination.totalPages - 1, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 0) {
                endPage = Math.min(4, pagination.totalPages - 1);
            } else if (endPage === pagination.totalPages - 1) {
                startPage = Math.max(0, pagination.totalPages - 5);
            }
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                    {/* First page button */}
                    <button
                        onClick={() => handlePageChange(0)}
                        disabled={!pagination.hasPrevious}
                        className={`px-3 py-1 rounded-md ${
                            !pagination.hasPrevious
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border border-gray-300`}
                    >
                        «
                    </button>

                    {/* Previous page button */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={!pagination.hasPrevious}
                        className={`px-3 py-1 rounded-md ${
                            !pagination.hasPrevious
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border border-gray-300`}
                    >
                        ‹
                    </button>

                    {/* Page numbers */}
                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${
                                currentPage === page
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    {/* Next page button */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!pagination.hasNext}
                        className={`px-3 py-1 rounded-md ${
                            !pagination.hasNext
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border border-gray-300`}
                    >
                        ›
                    </button>

                    {/* Last page button */}
                    <button
                        onClick={() => handlePageChange(pagination.totalPages - 1)}
                        disabled={!pagination.hasNext}
                        className={`px-3 py-1 rounded-md ${
                            !pagination.hasNext
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                        } border border-gray-300`}
                    >
                        »
                    </button>
                </div>
            </div>
        );
    };

    // Get current filter display text
    const getFilterDisplayText = () => {
        const parts = [];
        
        if (searchPattern) {
            parts.push(`tìm kiếm "${searchPattern}"`);
        }
        
        if (activeCategory && activeCategory !== "Tất cả") {
            parts.push(`danh mục "${activeCategory}"`);
        }
        
        return parts.length > 0 ? ` cho ${parts.join(' và ')}` : '';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Search Bar with Suggestions */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <SearchBar 
                            onSearch={handleSearch}
                            onInputChange={handleSearchInputChange}
                            placeholder='Tìm kiếm nguyên liệu...'
                        />
                        
                        {/* Suggestions dropdown */}
                        {showSuggestions && (
                            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                                {isLoadingSuggestions ? (
                                    <div className="px-4 py-3 text-center">
                                        <div className="animate-spin inline-block w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full mr-2"></div>
                                        <span className="text-gray-600">Đang tải gợi ý...</span>
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    suggestions.map((suggestion, index) => (
                                        <div
                                            key={index}
                                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                            onClick={() => handleSuggestionClick(suggestion)}
                                        >
                                            <div className="font-medium text-gray-900">
                                                {suggestion.text}
                                            </div>
                                            {suggestion.vietnamese_text && suggestion.vietnamese_text !== suggestion.text && (
                                                <div className="text-sm text-gray-500">
                                                    {suggestion.vietnamese_text}
                                                </div>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <div className="text-xs text-orange-500">
                                                    {suggestion.type === 'name' && 'Tên tiếng Anh'}
                                                    {suggestion.type === 'vietnamese_name' && 'Tên tiếng Việt'}
                                                    {suggestion.type === 'category' && 'Danh mục'}
                                                </div>
                                                {suggestion.category && suggestion.type !== 'category' && (
                                                    <div className="text-xs text-gray-400">
                                                        {suggestion.category}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-center text-gray-500">
                                        Không tìm thấy gợi ý phù hợp
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Active filters */}
                    {(searchPattern || activeCategory !== "Tất cả") && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-600">Bộ lọc hiện tại:</span>
                            {searchPattern && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    Tìm kiếm: {searchPattern}
                                </span>
                            )}
                            {activeCategory !== "Tất cả" && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                    Danh mục: {activeCategory}
                                </span>
                            )}
                            <button
                                onClick={clearFilters}
                                className="text-red-600 hover:text-red-800 text-sm underline"
                            >
                                Xóa bộ lọc
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                            <p>{error}</p>
                            <button 
                                onClick={() => fetchIngredients(currentPage, buildFilters())}
                                className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    )}

                    <IngredientCategories
                        activeCategory={activeCategory}
                        setActiveCategory={setActiveCategory}
                        onCategoryChange={handleCategoryChange}
                    />

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {activeCategory === "Tất cả" && !searchPattern 
                                ? "Tất Cả Nguyên Liệu" 
                                : `Nguyên Liệu${getFilterDisplayText()}`
                            }
                        </h2>

                        {!loading && (
                            <div className="text-sm text-gray-600">
                                Hiển thị {ingredients.length} / {pagination.totalElements} nguyên liệu
                                {pagination.totalPages > 1 && ` (trang ${currentPage + 1}/${pagination.totalPages})`}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {Array.from({ length: 8 }, (_, index) => (
                                <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : ingredients.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {ingredients.map((ingredient) => (
                                    <ProductCard
                                        key={ingredient._id}
                                        id={ingredient._id}
                                        vietnamese_name={ingredient.name}
                                        name={ingredient.name_en}
                                        unit={ingredient.unit}
                                        image={ingredient.image}
                                        net_unit_value={ingredient.net_unit_value}
                                        category={ingredient.category}
                                    />
                                ))}
                            </div>

                            {renderPagination()}
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="mb-4">
                                <svg
                                    className="mx-auto h-12 w-12 text-gray-400"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                            </div>
                            <p className="text-gray-500 text-lg">
                                Không tìm thấy nguyên liệu phù hợp{getFilterDisplayText()}
                            </p>
                            {(searchPattern || activeCategory !== "Tất cả") && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-4 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
                                >
                                    Xem tất cả nguyên liệu
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default IngredientBankPage;