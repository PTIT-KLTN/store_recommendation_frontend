// Utility functions for handling ingredient and product images

export const getCategoryColor = (category) => {
    const colors = {
        'Vegetables': '#4ade80',      // green
        'Fresh Meat': '#f87171',      // red
        'Seasonings': '#fbbf24',      // yellow
        'Dairy': '#60a5fa',           // blue
        'Grains': '#a78bfa',          // purple
        'Fruits': '#fb7185',          // pink
        'Seafood': '#34d399',         // emerald
        'Beverages': '#fde047',       // yellow
        'Frozen Foods': '#06b6d4',    // cyan
        'Bakery': '#d97706',          // orange
        'Snacks': '#8b5cf6',          // violet
        'Condiments': '#10b981',      // emerald
        'Spices': '#f59e0b',          // amber
    };
    
    return colors[category] || '#6b7280'; // default gray
};

export const generateInitials = (name) => {
    if (!name || typeof name !== 'string') return '?';
    
    const cleanName = name.trim();
    if (cleanName.length === 0) return '?';
    
    const words = cleanName.split(/\s+/).filter(Boolean);
    
    if (words.length === 0) return '?';
    if (words.length === 1) {
        // Single word: take first 2 characters
        return words[0].slice(0, 2).toUpperCase();
    }
    
    // Multiple words: take first character of first and last word
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
};

export const createPlaceholderImage = (name, category, size = 100) => {
    const initials = generateInitials(name);
    const backgroundColor = getCategoryColor(category);
    
    // Create canvas for generating placeholder
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials, size / 2, size / 2);
    
    return canvas.toDataURL();
};

export const renderIngredientPlaceholder = (item, className = '', size = 100) => {
    const name = item.vietnamese_name || item.name || 'Nguyên liệu';
    const initials = generateInitials(name);
    const backgroundColor = getCategoryColor(item.category);
    
    return (
        <div 
            className={`flex items-center justify-center text-white font-bold rounded ${className}`}
            style={{ 
                backgroundColor,
                fontSize: `${size * 0.4}px`,
                width: size,
                height: size
            }}
            title={`${name} - ${item.category || 'Không phân loại'}`}
        >
            {initials}
        </div>
    );
};

export const IngredientImage = ({ 
    item, 
    className = "w-full h-full object-contain", 
    placeholderClassName = "w-full h-full",
    size = 100,
    showFallback = true 
}) => {
    const imageUrl = item.image || item.imageUrl;
    const name = item.vietnamese_name || item.name || 'Nguyên liệu';
    
    if (imageUrl && imageUrl !== null && imageUrl !== '') {
        return (
            <>
                <img
                    src={imageUrl}
                    alt={name}
                    className={className}
                    onError={(e) => {
                        if (showFallback) {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                        }
                    }}
                />
                {showFallback && (
                    <div 
                        className={`${placeholderClassName} items-center justify-center text-white font-bold rounded`}
                        style={{ 
                            backgroundColor: getCategoryColor(item.category),
                            display: 'none'
                        }}
                    >
                        {generateInitials(name)}
                    </div>
                )}
            </>
        );
    }
    
    // No image available, show placeholder directly
    return renderIngredientPlaceholder(item, placeholderClassName, size);
};