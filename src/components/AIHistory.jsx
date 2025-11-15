import React, { useState, useEffect } from 'react';
import { FiClock, FiTrash2, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useModal } from '../context/ModalContext';

const AIHistory = () => {
    const [history, setHistory] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const { openModal } = useModal();

    // Load history from localStorage
    useEffect(() => {
        const loadHistory = () => {
            try {
                const savedHistory = localStorage.getItem('ai_analysis_history');
                if (savedHistory) {
                    const parsed = JSON.parse(savedHistory);
                    setHistory(parsed);
                }
            } catch (error) {
                console.error('Error loading history:', error);
            }
        };
        loadHistory();

        // Listen for history updates
        const handleStorageChange = () => {
            loadHistory();
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('ai_history_updated', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('ai_history_updated', handleStorageChange);
        };
    }, []);

    const clearHistory = () => {
        if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử phân tích?')) {
            localStorage.removeItem('ai_analysis_history');
            setHistory([]);
            toast.success('Đã xóa lịch sử phân tích');
        }
    };

    const deleteHistoryItem = (id) => {
        const newHistory = history.filter(item => item.id !== id);
        localStorage.setItem('ai_analysis_history', JSON.stringify(newHistory));
        setHistory(newHistory);
        toast.success('Đã xóa kết quả phân tích');
        // Trigger event to update other components
        window.dispatchEvent(new Event('ai_history_updated'));
    };

    const viewHistoryItem = (item) => {
        openModal('ai_result', item.result);
    };

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (history.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <FiClock className="text-orange-500 text-xl" />
                    <h3 className="text-xl font-bold text-gray-800">
                        Lịch sử phân tích AI ({history.length})
                    </h3>
                </div>
                <div className="flex items-center gap-4">
                    {history.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                clearHistory();
                            }}
                            className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1"
                        >
                            <FiTrash2 />
                            Xóa tất cả
                        </button>
                    )}
                    {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-3">
                    {history.map((item) => (
                        <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-orange-300 hover:shadow-md transition-all cursor-pointer"
                            onClick={() => viewHistoryItem(item)}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded-full">
                                            {item.type === 'text' ? '📝 Văn bản' : '🖼️ Hình ảnh'}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(item.timestamp)}
                                        </span>
                                    </div>
                                    <h4 className="font-semibold text-gray-800 mb-1">
                                        {item.result?.dish?.vietnamese_name || 'Món ăn'}
                                        {item.result?.dish?.name && (
                                            <span className="text-sm text-gray-500 font-normal ml-2">
                                                ({item.result.dish.name})
                                            </span>
                                        )}
                                    </h4>
                                    <p className="text-sm text-gray-600 line-clamp-2">
                                        {item.query}
                                    </p>
                                    {item.result?.cart?.items && (
                                        <p className="text-xs text-gray-500 mt-2">
                                            {item.result.cart.items.length} nguyên liệu
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deleteHistoryItem(item.id);
                                    }}
                                    className="text-red-400 hover:text-red-600 p-2"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AIHistory;

// Utility function to save AI result to history
export const saveAIResultToHistory = (query, result, type = 'text') => {
    try {
        const historyItem = {
            id: Date.now(),
            timestamp: Date.now(),
            query: query,
            result: result,
            type: type // 'text' or 'image'
        };

        // Get existing history
        const savedHistory = localStorage.getItem('ai_analysis_history');
        let history = savedHistory ? JSON.parse(savedHistory) : [];

        // Add new item at the beginning
        history.unshift(historyItem);

        // Keep only last 20 items
        if (history.length > 20) {
            history = history.slice(0, 20);
        }

        // Save to localStorage
        localStorage.setItem('ai_analysis_history', JSON.stringify(history));

        // Trigger event to update UI
        window.dispatchEvent(new Event('ai_history_updated'));
    } catch (error) {
        console.error('Error saving to history:', error);
    }
};