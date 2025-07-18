import React, { useState, useRef, useEffect } from 'react';

const SearchBar = ({ onSearch, onInputChange,  placeholder = "Tìm kiếm...", className = "", autoFocus = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        
        // Call onInputChange for suggestions
        if (onInputChange) {
            onInputChange(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSearch) {
            onSearch(searchTerm.trim());
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSubmit(e);
        }
        if (e.key === 'Escape') {
            setSearchTerm('');
            if (onInputChange) {
                onInputChange('');
            }
            if (onSearch) {
                onSearch('');
            }
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        if (onInputChange) {
            onInputChange('');
        }
        if (onSearch) {
            onSearch('');
        }
        if (inputRef.current) {
            inputRef.current.focus();
        }
    };

    const handleFocus = () => {
        setIsFocused(true);
    };

    const handleBlur = () => {
        // Delay blur to allow click on suggestions
        setTimeout(() => setIsFocused(false), 150);
    };

    return (
        <div className={`relative ${className}`}>
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    {/* Search Icon */}
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg 
                            className="h-5 w-5 text-gray-400" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                            />
                        </svg>
                    </div>

                    {/* Search Input */}
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        placeholder={placeholder}
                        className={`
                            w-full pl-10 pr-12 py-3 
                            border border-gray-300 rounded-lg 
                            focus:ring-2 focus:ring-orange-500 focus:border-orange-500 
                            outline-none transition-all duration-200
                            ${isFocused ? 'shadow-lg' : 'shadow-sm'}
                        `}
                    />

                    {/* Clear Button */}
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute inset-y-0 right-12 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-orange-500 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </button>
                </div>
            </form>

            {/* Search Tips */}
            {isFocused && !searchTerm && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-4">
                    <div className="text-sm text-gray-600">
                        <p className="font-medium mb-2">Mẹo tìm kiếm:</p>
                        <ul className="space-y-1 text-xs">
                            <li>• Nhập tên món ăn bằng tiếng Việt hoặc tiếng Anh</li>
                            <li>• Sử dụng từ khóa ngắn gọn để có kết quả tốt nhất</li>
                            <li>• Nhấn Enter hoặc click nút tìm kiếm</li>
                            <li>• Nhấn Esc để xóa tìm kiếm</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchBar;