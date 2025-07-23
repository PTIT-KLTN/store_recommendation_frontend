import React, { useState, useRef, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import ProductCard from '../components/ingredients/ProductCard';
import DishCard from '../components/DishCard';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useModal } from '../context/ModalContext';
import { ingredientService } from '../services/ingredientService';
import { dishService } from '../services/dishService';
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

    const ingredientsRef = useRef(null);
    const dishesRef = useRef(null);

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

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            {/* Hero Section */}
            {/* Hero Section với Background Grocery Store */}
            <section
                className="relative py-20 mb-8 overflow-hidden"
                style={{
                        backgroundImage: `url(${images.background})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                    }}
            >
                {/* Overlay để tạo độ tương phản cho text */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>

                {/* Content */}
                <div className="container mx-auto px-4 relative z-10">
                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
                            Ứng dụng gợi ý cửa hàng mua sắm thông minh
                        </h1>
                        <p className="text-white text-xl md:text-2xl mb-8 drop-shadow-md">
                            Khám phá nguyên liệu tươi ngon và món ăn ngon miệng từ các đối tác uy tín
                        </p>
                    </div>
                </div>

                {/* Decorative elements */}
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