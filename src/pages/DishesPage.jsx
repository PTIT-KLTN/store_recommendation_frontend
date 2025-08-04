import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import SearchBar from '../components/SearchBar';
import Footer from '../components/Footer';
import DishCard from '../components/DishCard';
import { dishService } from '../services/dishService';
import { useDebounce } from '../hooks/useDebounce';

const DishesPage = () => {
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalDishes, setTotalDishes] = useState(0);
    const [searchPattern, setSearchPattern] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [searchInput, setSearchInput] = useState(''); // New state for input
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const pageSize = 12;

    // Debounce search input for suggestions (300ms delay)
    const debouncedSearchInput = useDebounce(searchInput, 500);

    // Fetch dishes với tham số mới
    const fetchDishes = useCallback(async (page, pattern, category = '') => {
        setLoading(true);
        setError(null);
        
        try {
            const filters = {};
            if (category) {
                filters.category = category;
            }

            const response = await dishService.getDishes(page, pageSize, pattern, filters);

            if (response) {
                setDishes(response.dishes || []);
                setTotalDishes(response.numDishes || 0);
                
                const calculatedTotalPages = response.pagination 
                    ? response.pagination.totalPages 
                    : Math.ceil((response.numDishes || 0) / pageSize);
                    
                setTotalPages(calculatedTotalPages);
            }
        } catch (error) {
            console.error("Error fetching dishes:", error);
            setError("Có lỗi xảy ra khi tải dữ liệu món ăn. Vui lòng thử lại sau.");
            setDishes([]);
            setTotalDishes(0);
            setTotalPages(0);
        } finally {
            setLoading(false);
        }
    }, [pageSize]);

    // Fetch categories
    const fetchCategories = useCallback(async () => {
        try {
            const response = await dishService.getDishCategories();
            if (response && response.categories) {
                setCategories(response.categories);
            }
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    // Fetch suggestions with debounced input
    const fetchSuggestions = useCallback(async (query) => {
        if (!query || query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            setIsLoadingSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);

        try {
            const response = await dishService.getDishSuggestions(query, 10);
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

    // Load initial data
    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    // Fetch dishes when page, search, or category changes
    useEffect(() => {
        fetchDishes(currentPage, searchPattern, selectedCategory);
    }, [fetchDishes, currentPage, searchPattern, selectedCategory]);

    // Fetch suggestions when debounced search input changes
    useEffect(() => {
        fetchSuggestions(debouncedSearchInput);
    }, [debouncedSearchInput, fetchSuggestions]);

    // Handle search form submission
    const handleSearch = (searchTerm) => {
        if (searchTerm.toLowerCase() !== searchPattern.toLowerCase()) {
            setCurrentPage(0);
            setSearchPattern(searchTerm);
            setShowSuggestions(false);
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
    };

    // Handle category change
    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setCurrentPage(0);
    };

    // Handle page change
    const handlePageChange = (newPage) => {
        window.scrollTo(0, 0);
        setCurrentPage(newPage);
    };

    // Clear filters
    const clearFilters = () => {
        setSearchPattern('');
        setSearchInput(''); // Clear input as well
        setSelectedCategory('');
        setCurrentPage(0);
        setShowSuggestions(false);
    };

    // Pagination component
    const renderPagination = () => {
        if (totalPages <= 1) return null;

        let startPage = Math.max(0, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        if (endPage - startPage < 4) {
            if (startPage === 0) {
                endPage = Math.min(4, totalPages - 1);
            } else if (endPage === totalPages - 1) {
                startPage = Math.max(0, totalPages - 5);
            }
        }

        const pages = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return (
            <div className="flex justify-center mt-8">
                <div className="flex items-center space-x-2">
                    <button
                        onClick={() => handlePageChange(0)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        «
                    </button>

                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 0}
                        className={`px-3 py-1 rounded-md ${currentPage === 0
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ‹
                    </button>

                    {pages.map(page => (
                        <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md ${currentPage === page
                                ? 'bg-orange-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                } border border-gray-300`}
                        >
                            {page + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                            } border border-gray-300`}
                    >
                        ›
                    </button>

                    <button
                        onClick={() => handlePageChange(totalPages - 1)}
                        disabled={currentPage === totalPages - 1}
                        className={`px-3 py-1 rounded-md ${currentPage === totalPages - 1
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    <div className="relative">
                        <SearchBar 
                            onSearch={handleSearch}
                            onInputChange={handleSearchInputChange}
                            placeholder="Tìm kiếm món ăn..."
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
                                            <div className="text-xs text-orange-500">
                                                {suggestion.type === 'dish_name' ? 'Tên món ăn' : 'Tên tiếng Việt'}
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

                    {/* Category filter */}
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="text-sm font-medium text-gray-700">Danh mục:</span>
                        <button
                            onClick={() => handleCategoryChange('')}
                            className={`px-3 py-1 rounded-full text-sm ${selectedCategory === ''
                                ? 'bg-orange-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Tất cả
                        </button>
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => handleCategoryChange(category)}
                                className={`px-3 py-1 rounded-full text-sm ${selectedCategory === category
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    {/* Active filters */}
                    {(searchPattern || selectedCategory) && (
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-sm text-gray-600">Bộ lọc hiện tại:</span>
                            {searchPattern && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                                    Tìm kiếm: {searchPattern}
                                </span>
                            )}
                            {selectedCategory && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                                    Danh mục: {selectedCategory}
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

                {/* Error message */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
                        <p>{error}</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        Tất Cả Món Ăn
                    </h2>

                    {!loading && (
                        <div className="text-sm text-gray-600">
                            Hiển thị {dishes.length} trong tổng số {totalDishes} món ăn
                            {totalPages > 1 && ` (trang ${currentPage + 1}/${totalPages})`}
                        </div>
                    )}
                </div>

                {/* Dishes grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                            <div key={index} className="w-full h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                        ))}
                    </div>
                ) : dishes.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {dishes.map((dish) => (
                                <DishCard
                                    key={dish._id}
                                    id={dish._id}
                                    image={dish.image}
                                    name={dish.vietnamese_name}
                                    englishName={dish.name}
                                    ingredientCount={dish.ingredients?.length || 0}
                                    ingredients={dish.ingredients || []}
                                    category={dish.category}
                                    servings={dish.servings}
                                />
                            ))}
                        </div>

                        {renderPagination()}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">
                            {searchPattern || selectedCategory 
                                ? 'Không tìm thấy món ăn phù hợp với bộ lọc hiện tại'
                                : 'Không có món ăn nào'
                            }
                        </p>
                        {(searchPattern || selectedCategory) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-blue-600 hover:text-blue-800 underline"
                            >
                                Xóa bộ lọc và xem tất cả
                            </button>
                        )}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default DishesPage;