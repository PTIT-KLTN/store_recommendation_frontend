import React from 'react';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

// Component hiển thị warnings
export const AIWarnings = ({ warnings }) => {
    if (!warnings || warnings.length === 0) return null;
    
    return (
        <div className="mb-4 border-l-4 border-red-500 bg-red-50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
                <FiAlertTriangle className="text-red-600" />
                <h4 className="font-bold text-red-800">Cảnh báo</h4>
            </div>
            <ul className="text-sm text-red-700 space-y-1">
                {warnings.map((warning, idx) => (
                    <li key={idx}>• {warning.message || warning}</li>
                ))}
            </ul>
        </div>
    );
};

// Component hiển thị suggestions
export const AISuggestions = ({ suggestions, selectedSuggestions, onToggle }) => {
    if (!suggestions || suggestions.length === 0) return null;
    
    return (
        <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">💡 Gợi ý bổ sung ({suggestions.length})</h4>
            <ul className="space-y-2">
                {suggestions.map((sug, idx) => {
                    const key = sug.ingredient_id || sug.name_vi;
                    const isSelected = selectedSuggestions[key];
                    
                    return (
                        <li 
                            key={key || idx}
                            className={`flex items-start py-2 px-3 rounded border cursor-pointer ${
                                isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => onToggle(key)}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(key)}
                                className="w-4 h-4 mr-2 mt-0.5"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 text-sm">
                                <span className="font-medium">{sug.name_vi}</span>
                                {sug.name_en && <span className="text-gray-500 ml-1">({sug.name_en})</span>}
                                {sug.reason && <p className="text-gray-600 text-xs mt-1">{sug.reason}</p>}
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

// Component hiển thị similar dishes
export const AISimilarDishes = ({ similarDishes }) => {
    if (!similarDishes || similarDishes.length === 0) return null;
    
    return (
        <div className="mb-4">
            <h4 className="font-bold text-gray-800 mb-2">🔍 Món ăn tương tự</h4>
            <ul className="text-sm space-y-1">
                {similarDishes.map((dish, idx) => (
                    <li key={dish.dish_id || idx} className="text-gray-700">
                        • <span className="font-medium">{dish.name}</span>
                        {dish.match_count && <span className="text-gray-500"> ({dish.match_count} giống)</span>}
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Component hiển thị insights
export const AIInsights = ({ insights }) => {
    if (!insights || insights.length === 0) return null;
    
    return (
        <div className="mb-4 border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
            <div className="flex items-center gap-2 mb-2">
                <FiInfo className="text-blue-600" />
                <h4 className="font-bold text-blue-800">Thông tin thêm</h4>
            </div>
            <ul className="text-sm text-blue-700 space-y-1">
                {insights.map((insight, idx) => (
                    <li key={idx}>• {insight.message || insight}</li>
                ))}
            </ul>
        </div>
    );
};