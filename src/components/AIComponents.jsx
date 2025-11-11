import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

// Component hiển thị warnings
export const AIWarnings = ({ warnings }) => {
    if (!warnings || warnings.length === 0) return null;
    
    return (
        <div className="mb-4 border-l-4 border-red-500 bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1.5">
                <FiAlertTriangle className="text-red-600 w-4 h-4" />
                <h4 className="font-bold text-red-800 text-sm">Cảnh báo</h4>
            </div>
            <div className="space-y-0.5">
                {warnings.map((warning, idx) => (
                    <div key={idx} className="flex items-start text-xs text-red-700">
                        <span className="mr-1.5 mt-0.5">•</span>
                        <span className="flex-1">{warning.message || warning}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Component hiển thị suggestions
export const AISuggestions = ({ suggestions, selectedSuggestions, onToggle }) => {
    if (!suggestions || suggestions.length === 0) return null;
    
    return (
        <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Gợi ý bổ sung ({suggestions.length})</h4>
            <div className="space-y-1">
                {suggestions.map((sug, idx) => {
                    const key = sug.ingredient_id || sug.name_vi;
                    const isSelected = selectedSuggestions[key];
                    
                    return (
                        <div
                            key={key || idx}
                            className={`flex items-start py-2 px-3 rounded-lg border cursor-pointer transition-colors ${
                                isSelected 
                                    ? 'border-blue-500 bg-blue-50' 
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                            onClick={() => onToggle(key)}
                        >
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => onToggle(key)}
                                className="w-4 h-4 mr-3 mt-0.5 text-blue-600 rounded flex-shrink-0"
                                onClick={(e) => e.stopPropagation()}
                            />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm">
                                    <span className="font-medium text-gray-800">{sug.name_vi}</span>
                                    {sug.name_en && <span className="text-gray-500 text-xs ml-1">({sug.name_en})</span>}
                                </div>
                                {sug.reason && (
                                    <p className="text-gray-600 text-xs mt-0.5 leading-snug">{sug.reason}</p>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// Component hiển thị similar dishes
export const AISimilarDishes = ({ similarDishes }) => {
    if (!similarDishes || similarDishes.length === 0) return null;
    
    return (
        <div className="mb-4">
            <h4 className="text-lg font-bold text-gray-900 mb-2">Món ăn tương tự</h4>
            <div className="space-y-1">
                {similarDishes.map((dish, idx) => (
                    <div 
                        key={dish.dish_id || idx} 
                        className="flex items-center py-2 px-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <svg className="w-4 h-4 text-orange-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-800 text-sm">{dish.dish_name}</span>
                            {dish.match_count && (
                                <span className="text-xs text-gray-500 ml-2">
                                    ({dish.match_count} nguyên liệu giống)
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

