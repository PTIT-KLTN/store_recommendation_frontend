import React, { useState, useRef, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiImage, FiMessageSquare, FiX, FiLoader } from 'react-icons/fi';
import ProductCard from '../components/ingredients/ProductCard';
import DishCard from '../components/DishCard';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useModal } from '../context/ModalContext';
import { ingredientService } from '../services/ingredientService';
import { dishService } from '../services/dishService';
import { aiService } from '../services/aiService';
import { restaurantsList, images } from '../assets/assets';

const HomePage = () => {
    const [ingredients, setIngredients] = useState([]);
    const [dishes, setDishes] = useState([]);
    const restaurants = restaurantsList;
    const [loadingIngredients, setLoadingIngredients] = useState(true);
    const [loadingDishes, setLoadingDishes] = useState(true);
    const [errorIngredients, setErrorIngredients] = useState(null);
    const [errorDishes, setErrorDishes] = useState(null);
    const { openModal } = useModal();

    // AI Analysis States
    const [activeTab, setActiveTab] = useState('text'); // 'text' or 'image'
    const [textInput, setTextInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageDescription, setImageDescription] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null);
    const [aiError, setAiError] = useState(null);

    const ingredientsRef = useRef(null);
    const dishesRef = useRef(null);
    const fileInputRef = useRef(null);

    const [ingredientsScroll, setIngredientsScroll] = useState({ left: false, right: true });
    const [dishesScroll, setDishesScroll] = useState({ left: false, right: true });

    useEffect(() => {
        const fetchIngredients = async () => {
            try {
                setLoadingIngredients(true);
                const response = await ingredientService.getIngredients(0, 12);

                if (Array.isArray(response.ingredients)) {
                    setIngredients(response.ingredients);
                } else {
                    setIngredients([]);
                }
                setLoadingIngredients(false);
            } catch (error) {
                console.error("Error fetching ingredients:", error);
                setErrorIngredients("Không thể tải danh sách nguyên liệu");
                setLoadingIngredients(false);
            }
        };

        fetchIngredients();
    }, []);

    useEffect(() => {
        const fetchDishes = async () => {
            try {
                setLoadingDishes(true);
                const response = await dishService.getDishes(0, 12);

                if (Array.isArray(response.dishes)) {
                    setDishes(response.dishes);
                } else {
                    setDishes([]);
                }
                setLoadingDishes(false);
            } catch (error) {
                console.error("Error fetching dishes:", error);
                setErrorDishes("Không thể tải danh sách món ăn");
                setLoadingDishes(false);
            }
        };

        fetchDishes();
    }, []);

    const scrollIngredientsLeft = () => {
        if (ingredientsRef.current) {
            ingredientsRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollIngredientsRight = () => {
        if (ingredientsRef.current) {
            ingredientsRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollDishesLeft = () => {
        if (dishesRef.current) {
            dishesRef.current.scrollBy({ left: -300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const scrollDishesRight = () => {
        if (dishesRef.current) {
            dishesRef.current.scrollBy({ left: 300, behavior: 'smooth' });
            updateScrollButtons();
        }
    };

    const updateScrollButtons = () => {
        if (ingredientsRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ingredientsRef.current;
            setIngredientsScroll({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }

        if (dishesRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = dishesRef.current;
            setDishesScroll({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }
    };

    const handleScroll = (ref, setScrollState) => {
        if (ref.current) {
            const { scrollLeft, scrollWidth, clientWidth } = ref.current;
            setScrollState({
                left: scrollLeft > 0,
                right: scrollLeft < scrollWidth - clientWidth - 10
            });
        }
    };

    // AI Analysis Handlers
    const handleTextAnalysis = async (e) => {
        e.preventDefault();
        if (!textInput.trim()) {
            setAiError("Vui lòng nhập mô tả món ăn");
            return;
        }

        try {
            setAiLoading(true);
            setAiError(null);
            const response = await aiService.recipeAnalysis(textInput);
            
            if (response) {
                setAiResult(response);
                // Open modal with AI result
                openModal('ai_result', response);
            } else {
                setAiError("Không thể phân tích món ăn. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error in text analysis:", error);
            setAiError(error.response?.data?.error || "Đã xảy ra lỗi khi phân tích món ăn");
        } finally {
            setAiLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setAiError("Kích thước file quá lớn. Vui lòng chọn file nhỏ hơn 10MB");
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setAiError("Định dạng file không hợp lệ. Vui lòng chọn file JPG, PNG, WEBP hoặc GIF");
                return;
            }

            setSelectedImage(file);
            setAiError(null);

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleImageAnalysis = async (e) => {
        e.preventDefault();
        if (!selectedImage) {
            setAiError("Vui lòng chọn hình ảnh");
            return;
        }

        try {
            setAiLoading(true);
            setAiError(null);
            const response = await aiService.uploadAndAnalyze(selectedImage, imageDescription || null);
            
            if (response.success && response.result) {
                setAiResult(response.result);
                // Open modal with AI result
                openModal('ai_result', response.result);
            } else {
                setAiError("Không thể phân tích hình ảnh. Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Error in image analysis:", error);
            setAiError(error.response?.data?.error || "Đã xảy ra lỗi khi phân tích hình ảnh");
        } finally {
            setAiLoading(false);
        }
    };

    const clearImageSelection = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setImageDescription('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            {/* Hero Section with AI Analysis */}
            <section
                className="relative py-20 mb-8 overflow-hidden"
                style={{
                        backgroundImage: `url(${images.background})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
            >
                {/* Overlay để tạo độ tương phản */}
                <div className="absolute inset-0 bg-black bg-opacity-50"></div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                    {/* Hero Text */}
                    <div className="text-center max-w-4xl mx-auto mb-8">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                            Ứng dụng gợi ý của hàng mua sắm
                        </h1>
                        <p className="text-white text-xl md:text-2xl mb-4 drop-shadow-md">
                            Khám phá nguyên liệu tươi ngon và món ăn ngon miệng từ các đối tác uy tín
                        </p>
                    </div>

                    {/* AI Recipe Analysis Box */}
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl mx-auto">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                            🍳 Phân tích món ăn bằng AI
                        </h2>
                        <p className="text-gray-600 text-center mb-6">
                            Nhập mô tả hoặc tải lên hình ảnh món ăn để nhận gợi ý nguyên liệu và công thức nấu ăn
                        </p>

                        {/* Tabs */}
                        <div className="flex border-b border-gray-200 mb-6">
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'text'
                                        ? 'border-b-2 border-orange-500 text-orange-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FiMessageSquare />
                                Nhập văn bản
                            </button>
                            <button
                                onClick={() => setActiveTab('image')}
                                className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
                                    activeTab === 'image'
                                        ? 'border-b-2 border-orange-500 text-orange-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <FiImage />
                                Tải hình ảnh
                            </button>
                        </div>

                        {/* Text Analysis Tab */}
                        {activeTab === 'text' && (
                            <form onSubmit={handleTextAnalysis} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Mô tả món ăn bạn muốn nấu:
                                    </label>
                                    <textarea
                                        value={textInput}
                                        onChange={(e) => setTextInput(e.target.value)}
                                        placeholder="Ví dụ: Tôi muốn nấu phở bò..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        rows="4"
                                        disabled={aiLoading}
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={aiLoading || !textInput.trim()}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Đang phân tích...
                                        </>
                                    ) : (
                                        'Phân tích món ăn'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Image Analysis Tab */}
                        {activeTab === 'image' && (
                            <form onSubmit={handleImageAnalysis} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Chọn hình ảnh món ăn:
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        className="hidden"
                                        disabled={aiLoading}
                                    />
                                    
                                    {!imagePreview ? (
                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-orange-500 transition-colors flex flex-col items-center gap-2"
                                            disabled={aiLoading}
                                        >
                                            <FiImage className="text-4xl text-gray-400" />
                                            <span className="text-gray-600">Nhấn để chọn hình ảnh</span>
                                            <span className="text-sm text-gray-500">JPG, PNG, WEBP hoặc GIF (tối đa 10MB)</span>
                                        </button>
                                    ) : (
                                        <div className="relative">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="w-full h-64 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={clearImageSelection}
                                                className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                                                disabled={aiLoading}
                                            >
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        Mô tả bổ sung (tùy chọn):
                                    </label>
                                    <input
                                        type="text"
                                        value={imageDescription}
                                        onChange={(e) => setImageDescription(e.target.value)}
                                        placeholder="Ví dụ: Phở bò Việt Nam..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                        disabled={aiLoading}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={aiLoading || !selectedImage}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {aiLoading ? (
                                        <>
                                            <FiLoader className="animate-spin" />
                                            Đang phân tích...
                                        </>
                                    ) : (
                                        'Phân tích hình ảnh'
                                    )}
                                </button>
                            </form>
                        )}

                        {/* Error Message */}
                        {aiError && (
                            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {aiError}
                            </div>
                        )}
                    </div>
                </div>

                {/* Decorative gradient at bottom */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
            </section>

            <div className="container mx-auto px-4 py-4">
                {/* Ingredients Section */}
                <section className="mb-8" id="ingredients-section">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách thực phẩm</h2>
                    {errorIngredients ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
                            {errorIngredients}
                        </div>
                    ) : loadingIngredients ? (
                        <div className="flex space-x-4 overflow-hidden pb-4 mt-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-64 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={ingredientsRef}
                                className="flex space-x-4 overflow-hidden pb-4"
                                onScroll={() => handleScroll(ingredientsRef, setIngredientsScroll)}
                            >
                                {ingredients.map((ingredient) => (
                                    <div key={ingredient.id || ingredient.name} className="flex-shrink-0 w-64">
                                        <ProductCard
                                            id={ingredient.id}
                                            vietnamese_name={ingredient.name}
                                            name={ingredient.name_en}
                                            unit={ingredient.unit}
                                            image={ingredient.image}
                                            category={ingredient.category}
                                        />
                                    </div>
                                ))}
                            </div>

                            {ingredientsScroll.left && (
                                <button
                                    onClick={scrollIngredientsLeft}
                                    className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronLeft className="text-gray-600" />
                                </button>
                            )}

                            {ingredientsScroll.right && (
                                <button
                                    onClick={scrollIngredientsRight}
                                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronRight className="text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Dishes Section */}
                <section className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Danh sách món ăn</h2>
                    {errorDishes ? (
                        <div className="bg-red-100 text-red-700 p-4 rounded-lg mt-4">
                            {errorDishes}
                        </div>
                    ) : loadingDishes ? (
                        <div className="flex space-x-4 overflow-hidden pb-4 mt-4">
                            {[...Array(4)].map((_, index) => (
                                <div key={index} className="flex-shrink-0 w-64 h-64 bg-gray-200 animate-pulse rounded-lg"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="relative">
                            <div
                                ref={dishesRef}
                                className="flex space-x-4 overflow-hidden pb-4"
                                onScroll={() => handleScroll(dishesRef, setDishesScroll)}
                            >
                                {dishes.map((dish) => (
                                    <div key={dish.id} className="flex-shrink-0 w-64">
                                        <DishCard
                                            id={dish.id}
                                            image={dish.image}
                                            name={dish.vietnamese_name}
                                            ingredientCount={dish.ingredients?.length || 0}
                                            ingredients={dish.ingredients || []}
                                        />
                                    </div>
                                ))}
                            </div>

                            {dishesScroll.left && (
                                <button
                                    onClick={scrollDishesLeft}
                                    className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronLeft className="text-gray-600" />
                                </button>
                            )}

                            {dishesScroll.right && (
                                <button
                                    onClick={scrollDishesRight}
                                    className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-white w-8 h-8 rounded-full shadow-md flex items-center justify-center z-10 hover:bg-gray-100"
                                >
                                    <FiChevronRight className="text-gray-600" />
                                </button>
                            )}
                        </div>
                    )}
                </section>

                {/* Partner Restaurants Section */}
                <section>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Siêu thị, nhà cung cấp liên kết</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {restaurants.map((restaurant) => (
                            <div
                                key={restaurant.id}
                                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                            >
                                {/* Image Container */}
                                <div className="w-full h-40 overflow-hidden bg-gray-50 flex items-center justify-center">
                                    <img
                                        src={restaurant.image}
                                        alt={restaurant.name}
                                        className="w-32 h-32 object-contain"
                                    />
                                </div>

                                {/* Content */}
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-medium text-gray-800">{restaurant.name}</h3>
                                        <span className="text-xs text-white bg-green-600 px-2 py-1 rounded">Đối tác</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mb-2">Siêu thị & nhà cung cấp</div>

                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <Footer />
        </div>
    );
};

export default HomePage;