import React, { useState, useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { HiOutlineLocationMarker, HiStar, HiChevronDown, HiChevronUp, HiSwitchHorizontal, HiCheck } from "react-icons/hi";
import { images } from '../assets/assets';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import SimilarProductsModal from '../components/SimilarProductsModal';

const CheckoutCalculation = () => {
    const location = useLocation();
    const [basketItems, setBasketItems] = useState({
        ingredients: [],
        dishes: {}
    });
    const [loading, setLoading] = useState(true);
    const [combinedIngredients, setCombinedIngredients] = useState([]);
    const [suggestedStores, setSuggestedStores] = useState([]);
    const [calculationResult, setCalculationResult] = useState(null);
    const [expandedStoreId, setExpandedStoreId] = useState(null);
    const [selectedProducts, setSelectedProducts] = useState({});

    // Modal state
    const [modalOpen, setModalOpen] = useState(false);
    const [currentProduct, setCurrentProduct] = useState(null);
    const [currentStore, setCurrentStore] = useState(null);
    const [similarProductsForModal, setSimilarProductsForModal] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const storedBasket = localStorage.getItem('basketItems');

                if (storedBasket) {
                    const parsedBasket = JSON.parse(storedBasket);
                    setBasketItems(parsedBasket);
                    combineIngredients(parsedBasket);
                }

                const calculationData = location.state?.calculationResult;

                if (calculationData) {
                    console.log("Data received from API:", calculationData);
                    setCalculationResult(calculationData);
                    processCalculationResult(calculationData);
                } else {
                    try {
                        const response = await axios.get('/basket/calculate');
                        const apiData = response.data;
                        setCalculationResult(apiData);
                        processCalculationResult(apiData);
                    } catch (apiError) {
                        console.error("Error fetching calculation data:", apiError);
                        toast.error("Không thể tải dữ liệu tính toán từ server");
                    }
                }
            } catch (error) {
                console.error("Error initializing checkout calculation:", error);
                toast.error("Đã xảy ra lỗi khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [location.state]);

    const processCalculationResult = (result) => {
        if (!result || !result.store_recommendations) {
            toast.error("Dữ liệu tính toán không hợp lệ");
            return;
        }

        const storeRecommendations = result.store_recommendations;

        if (storeRecommendations.length === 0) {
            toast.warning("Không tìm thấy cửa hàng phù hợp");
            return;
        }

        const formattedStores = storeRecommendations.map(storeRec => {
            // Extract available products
            const availableItems = storeRec.items.filter(item => item.available);
            const unavailableItems = storeRec.items.filter(item => !item.available);

            // Group available products by category
            const productsByCategory = {};
            availableItems.forEach(item => {
                const category = item.product_category;
                if (!productsByCategory[category]) {
                    productsByCategory[category] = [];
                }

                const product = {
                    id: item.product_sku,
                    name: item.product_name,
                    name_vi: item.product_name,
                    name_en: item.product_name_en,
                    image: item.product_image || null,
                    price: item.price_per_unit || 0,
                    quantity: item.quantity_needed || 1,
                    unit: item.product_unit || "cái",
                    cost: item.total_price || 0,
                    sku: item.product_sku || "",
                    category: category,
                    chainStore: storeRec.store_chain || "",
                    discount_percent: item.discount_percent || 0,
                    promotion: item.promotion || "",
                    match_score: item.match_score || 0,
                    matched_field: item.matched_field || "",
                    original_price: item.original_price || 0,
                    ingredientName: item.ingredient_name,
                    ingredientVietnameseName: item.ingredient_vietnamese_name
                };

                // Process alternatives for this product
                const alternatives = (item.alternatives || []).map(alt => ({
                    id: alt.product_sku,
                    name: alt.product_name,
                    name_vi: alt.product_name,
                    name_en: alt.product_name_en,
                    image: alt.product_image || null,
                    price: alt.price_per_unit || 0,
                    quantity: item.quantity_needed || 1,
                    unit: alt.product_unit || "cái",
                    cost: alt.total_price || 0,
                    sku: alt.product_sku || "",
                    category: alt.product_category || category,
                    chainStore: storeRec.store_chain || "",
                    discount_percent: alt.discount_percent || 0,
                    promotion: alt.promotion || "",
                    match_score: alt.match_score || 0,
                    matched_field: alt.matched_field || "",
                    original_price: alt.original_price || 0,
                    rank: alt.rank || 0,
                    ingredientName: item.ingredient_name,
                    ingredientVietnameseName: item.ingredient_vietnamese_name
                }));

                product.alternatives = alternatives;
                productsByCategory[category].push(product);
            });

            // Process missing ingredients
            const lackIngredients = unavailableItems.map(item => ({
                id: `missing-${Math.random().toString(36).substring(2, 9)}`,
                vietnamese_name: item.ingredient_vietnamese_name || "",
                name: item.ingredient_name || "Nguyên liệu",
                image: null,
                quantity: item.quantity_needed || 0,
                unit: item.ingredient_unit,
                category: item.ingredient_category || "Khác"
            }));

            return {
                id: storeRec.store_id || `store-${Math.random().toString(36).substring(2, 9)}`,
                name: storeRec.store_name || "Cửa hàng",
                address: storeRec.store_address || "Unknown Address",
                phone: storeRec.store_phone || "",
                logo: null,
                rating: storeRec.store_rating || 0,
                reviews_count: storeRec.store_reviews_count || 0,
                distance: storeRec.distance_km || 0,
                totalCost: storeRec.total_cost,
                availableProducts: availableItems,
                productsByCategory: productsByCategory,
                lackIngredients: lackIngredients,
                chain: storeRec.store_chain || "",
                availabilityPercentage: storeRec.availability_percentage || 0,
                foundIngredients: storeRec.found_ingredients || 0,
                totalIngredients: result.total_ingredients || 0,
                overallScore: storeRec.overall_score || 0,
                scoreBreakdown: storeRec.score_breakdown || {},
                calculationTime: result.calculation_time_ms || 0
            };
        });

        // Sort by overall score (highest first)
        formattedStores.sort((a, b) => b.overallScore - a.overallScore);

        console.log("Processed store list:", formattedStores);
        setSuggestedStores(formattedStores);
    };

    const combineIngredients = (basket) => {
        const combined = {};

        if (basket.ingredients && basket.ingredients.length > 0) {
            basket.ingredients.forEach(item => {
                if (!combined[item.id]) {
                    combined[item.id] = {
                        ...item,
                        totalQuantity: parseFloat(item.quantity) || 0.1,
                        unit: item.unit
                    };
                } else {
                    combined[item.id].totalQuantity += parseFloat(item.quantity) || 0.1;
                }
            });
        }

        if (basket.dishes) {
            Object.values(basket.dishes).forEach(dish => {
                if (dish.ingredients && dish.ingredients.length > 0) {
                    const servings = parseInt(dish.servings, 10) || 1;

                    dish.ingredients.forEach(item => {
                        if (!combined[item.id]) {
                            combined[item.id] = {
                                ...item,
                                totalQuantity: (parseFloat(item.quantity) || 0.1) * servings,
                                unit: item.unit
                            };
                        } else {
                            combined[item.id].totalQuantity += (parseFloat(item.quantity) || 0.1) * servings;
                        }
                    });
                }
            });
        }

        const combinedArray = Object.values(combined).map(item => ({
            ...item,
            totalQuantity: parseFloat(item.totalQuantity.toFixed(1))
        }));

        setCombinedIngredients(combinedArray);
    };

    const handleBackToCart = () => {
        window.history.back();
    };

    const formatPrice = (price) => {
        return parseFloat(price).toLocaleString('vi-VN');
    };

    const toggleStoreDetails = (storeId) => {
        setExpandedStoreId(expandedStoreId === storeId ? null : storeId);
    };

    const handleProductSelect = (storeId, productId, alternativeProduct) => {
        const store = suggestedStores.find(s => s.id === storeId);
        if (!store) return;

        // Find the original product in the store
        let foundProduct = null;
        let foundCategory = null;

        for (const [category, products] of Object.entries(store.productsByCategory)) {
            const product = products.find(p => p.id === productId);
            if (product) {
                foundProduct = product;
                foundCategory = category;
                break;
            }
        }

        if (!foundProduct) return;

        setSelectedProducts({
            ...selectedProducts,
            [`${storeId}-${productId}`]: alternativeProduct.id
        });

        // Update the store data with the selected alternative
        const updatedStores = [...suggestedStores];
        const storeIndex = updatedStores.findIndex(s => s.id === storeId);

        if (storeIndex !== -1) {
            const categoryProducts = updatedStores[storeIndex].productsByCategory[foundCategory];
            const productIndex = categoryProducts.findIndex(p => p.id === productId);

            if (productIndex !== -1) {
                const updatedProduct = {
                    ...alternativeProduct,
                    originalProductId: productId,
                    isAlternative: true,
                    alternatives: foundProduct.alternatives // Keep the alternatives list
                };

                updatedStores[storeIndex].productsByCategory[foundCategory][productIndex] = updatedProduct;

                // Recalculate total price
                let newTotal = 0;
                Object.values(updatedStores[storeIndex].productsByCategory).forEach(products => {
                    products.forEach(p => {
                        newTotal += p.cost || 0;
                    });
                });
                updatedStores[storeIndex].totalPrice = newTotal;

                setSuggestedStores(updatedStores);
                toast.success("Đã thay đổi sản phẩm thành công!");
            }
        }
    };

    const openSimilarProductsModal = (product, store) => {
        const alternatives = product.alternatives || [];
        if (alternatives.length === 0) {
            toast.info("Không có sản phẩm thay thế cho sản phẩm này");
            return;
        }

        setCurrentProduct(product);
        setCurrentStore(store);
        setSimilarProductsForModal(alternatives);
        setModalOpen(true);
    };

    const handleProductSwapFromModal = (originalProduct, newProduct) => {
        if (!currentStore || !originalProduct || !newProduct) return;

        handleProductSelect(currentStore.id, originalProduct.id, newProduct);
        setModalOpen(false);
    };

    const formatProductName = (product) => {
        if (product.name_vi && product.name_en && product.name_vi !== product.name_en) {
            return (
                <>
                    <div className="text-sm font-medium">{product.name_vi}</div>
                    <div className="text-xs text-gray-500 italic">{product.name_en}</div>
                </>
            );
        }
        return <div className="font-medium">{product.name_vi || product.name}</div>;
    };

    const renderRating = (rating, reviewsCount) => {
        if (!rating && rating !== 0) return null;

        const roundedRating = parseFloat(rating).toFixed(1);

        return (
            <div className="flex items-center mb-2">
                <span className="text-sm mr-2">Đánh giá từ Google Map:</span>
                <span className="font-medium mr-2">{roundedRating}</span>
                <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <HiStar
                            key={star}
                            className={`w-4 h-4 ${star <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`}
                        />
                    ))}
                </div>
                {reviewsCount > 0 && (
                    <span className="text-xs text-gray-500 ml-2">({reviewsCount} đánh giá)</span>
                )}  
            </div>
        );
    };

    const formatCurrency = (value) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(2)}tr`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}k`;
        }
        return value.toString();
    };

    const renderCompactProduct = (product, store) => {
        const hasAlternatives = product.alternatives && product.alternatives.length > 0;
        const isSelected = selectedProducts[`${store.id}-${product.id}`];
        const isAlternative = product.isAlternative === true;

        return (
            <div className={`${isAlternative ? 'bg-orange-50' : 'bg-white'} rounded-lg border border-gray-200 p-3 mb-3`}>
                <div className="flex mb-2">
                    {/* Product image */}
                    <div className="w-16 h-16 flex-shrink-0 mr-3">
                        <img
                            src={product.image || '/images/default-product.jpg'}
                            alt={product.name_vi || product.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/default-product.jpg';
                            }}
                        />
                    </div>

                    {/* Product info */}
                    <div className="flex-1">
                        {formatProductName(product)}
                        
                        {/* Ingredient mapping info */}
                        <div className="text-xs text-gray-500 mt-1">
                            Cho: {product.ingredientVietnameseName || product.ingredientName}
                        </div>
                        
                        <div className="flex justify-between text-sm mt-1">
                            <div className="flex flex-col">
                                {product.discount_percent > 0 && (
                                    <span className="text-xs text-red-500 line-through">
                                        {formatPrice(product.original_price)}đ
                                    </span>
                                )}
                                <span className="text-green-600 font-medium">{formatPrice(product.cost)}đ</span>
                            </div>
                            <div className="text-right text-gray-500">
                                <div>{product.quantity} {product.unit}</div>
                                {product.product_net_unit_value && (
                                    <div className="text-xs">({product.product_net_unit_value}{product.product_unit}/sản phẩm)</div>
                                )}
                            </div>
                        </div>

                        {/* Discount and promotion info */}
                        {product.discount_percent > 0 && (
                            <div className="text-xs text-red-600 mt-1">
                                Giảm {product.discount_percent}%
                            </div>
                        )}
                        {product.promotion && (
                            <div className="text-xs text-blue-600 mt-1">
                                {product.promotion}
                            </div>
                        )}
                    </div>

                    {/* Alternatives button */}
                    {hasAlternatives && (
                        <div className="ml-2">
                            <button
                                onClick={() => openSimilarProductsModal(product, store)}
                                className={`p-1.5 rounded-full ${isAlternative ? 'bg-orange-100 text-orange-600' : 'bg-green-600 text-white'} hover:bg-green-200`}
                                title={`Xem ${product.alternatives.length} sản phẩm tương tự`}
                            >
                                <HiSwitchHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Product details */}
                <div className="text-xs text-gray-500 mt-2 pl-2 border-l-2 border-gray-200">
                    <div className="mb-1">
                        <span className="font-medium">Đơn giá:</span> {formatPrice(product.price)}đ/{product.unit}
                    </div>
                    <div className="mb-1">
                        <span className="font-medium">Tổng tiền:</span> {formatPrice(product.cost)}đ
                    </div>
                    {product.match_score > 0 && (
                        <div className="mb-1">
                            <span className="font-medium">Độ phù hợp:</span> {Math.round(product.match_score * 100)}%
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-wrap -mx-4">
                    {/* Ingredients Summary Panel */}
                    <div className="w-full md:w-1/3 px-4 mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <img src={images.cart} className="h-8 w-8 mr-2" alt="Cart icon" />
                                    Tổng sản phẩm
                                </h2>
                            </div>

                            <div>
                                <h3 className="text-xl font-bold mb-4 text-gray-800">Nguyên Liệu</h3>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                    {combinedIngredients.length > 0 ? (
                                        combinedIngredients.map((item) => (
                                            <div key={item.id} className="flex items-center border-b pb-4">
                                                <div className="w-16 h-16 mr-4 flex-shrink-0 bg-gray-50 p-1 rounded">
                                                    <img
                                                        src={item.image || item.imageUrl}
                                                        alt={item.name}
                                                        className="w-full h-full object-contain"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = '/images/default-ingredient.jpg';
                                                        }}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="font-medium text-gray-800">{item.vietnamese_name || item.name}</div>
                                                    <div className="text-gray-600 text-sm mt-1">
                                                        {item.totalQuantity} {item.unit}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500">Không có nguyên liệu</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Suggested Stores Panel */}
                    <div className="w-full md:w-2/3 px-4">
                        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                            <div className="bg-green-600 p-4 -m-6 mb-6 rounded-t-lg">
                                <h2 className="text-xl font-medium flex items-center text-white">
                                    <HiOutlineLocationMarker className="h-8 w-8 mr-2" />
                                    Địa điểm đề xuất (Sắp xếp theo điểm tổng)
                                </h2>
                            </div>

                            {/* Calculation summary */}
                            {calculationResult && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                                    <div className="text-sm text-blue-700">
                                        <strong>Thời gian tính toán:</strong> {(calculationResult.calculation_time_ms / 1000).toFixed(2)}s
                                    </div>
                                    <div className="text-sm text-blue-700">
                                        <strong>Tổng nguyên liệu:</strong> {calculationResult.total_ingredients}
                                    </div>
                                </div>
                            )}

                            {suggestedStores.length > 0 ? (
                                <div className="space-y-6">
                                    {suggestedStores.map((store) => (
                                        <div key={store.id} className="border border-gray-200 rounded-lg overflow-hidden">
                                            {/* Store header - Always visible */}
                                            <div className="bg-gray-50 p-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="flex-grow">
                                                        <div className="flex items-center mb-2">
                                                            <h3 className="text-xl font-medium text-gray-800 mr-2">{store.name}</h3>
                                                            <span className="text-sm text-gray-500">({store.chain})</span>
                                                        </div>

                                                        <div className="flex items-center mb-2">
                                                            <div className="mr-2 w-5 h-5 text-green-600">
                                                                <HiOutlineLocationMarker className="w-5 h-5" />
                                                            </div>
                                                            <span className="text-sm text-gray-600">{store.address}</span>
                                                        </div>

                                                        {store.phone && (
                                                            <div className="text-sm text-gray-600 mb-2">
                                                                SĐT: {store.phone}
                                                            </div>
                                                        )}

                                                        {/* Rating and distance info */}
                                                        {renderRating(store.rating, store.reviews_count)}

                                                        {store.distance > 0 && (
                                                            <div className="text-sm text-gray-600">
                                                                Khoảng cách: {store.distance.toFixed(1)}km
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Score info */}
                                                    <div className="ml-4 text-right">
                                                        <div className="text-lg font-bold text-green-600">
                                                            {store.overallScore.toFixed(1)}
                                                        </div>
                                                        <div className="text-xs text-gray-500">Điểm tổng</div>
                                                    </div>
                                                </div>

                                                {/* Availability info */}
                                                <div className="grid grid-cols-2 gap-4 mb-3">
                                                    <div className="bg-white p-2 rounded border">
                                                        <div className="text-xs text-gray-500">Tỷ lệ có hàng</div>
                                                        <div className="text-lg font-medium text-green-600">
                                                            {store.availabilityPercentage.toFixed(1)}%
                                                        </div>
                                                        <div className="text-xs text-gray-600">
                                                            {store.foundIngredients}/{store.totalIngredients} nguyên liệu
                                                        </div>
                                                    </div>
                                                    <div className="bg-white p-2 rounded border">
                                                        <div className="text-xs text-gray-500">Tổng giá</div>
                                                        <div className="text-lg font-medium text-green-600">
                                                            {formatPrice(store.totalCost)}đ
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    onClick={() => toggleStoreDetails(store.id)}
                                                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                                                >
                                                    {expandedStoreId === store.id ? (
                                                        <>
                                                            <HiChevronUp className="mr-2" />
                                                            Ẩn chi tiết sản phẩm
                                                        </>
                                                    ) : (
                                                        <>
                                                            <HiChevronDown className="mr-2" />
                                                            Xem chi tiết sản phẩm
                                                        </>
                                                    )}
                                                </button>
                                            </div>

                                            {/* Missing Ingredients Warning Section */}
                                            {store.lackIngredients && store.lackIngredients.length > 0 && (
                                                <div className="mx-4 my-3 border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                                                    <div className="flex items-center mb-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                        </svg>
                                                        <h4 className="text-base font-bold text-yellow-700">Nguyên liệu thiếu</h4>
                                                    </div>
                                                    <p className="text-sm text-yellow-700 mb-2">Cửa hàng này không có đủ các nguyên liệu sau:</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {store.lackIngredients.map((item, index) => (
                                                            <div key={index} className="flex items-center bg-white p-2 rounded border border-yellow-200">
                                                                <div className="flex-1">
                                                                    <div className="text-xs font-medium text-gray-800">{item.vietnamese_name || item.name}</div>
                                                                    <div className="text-xs text-gray-600">
                                                                        <span className="font-medium">{item.quantity}</span> {item.unit}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Expanded details - Only visible when expanded */}
                                            {expandedStoreId === store.id && Object.keys(store.productsByCategory).length > 0 && (
                                                <div className="p-4 border-t border-gray-200">
                                                    <h4 className="text-lg font-medium mb-4 text-gray-800">Chi tiết sản phẩm có sẵn</h4>

                                                    {/* Products by category */}
                                                    {Object.entries(store.productsByCategory || {}).map(([category, products]) => (
                                                        <div key={category} className="mb-6">
                                                            <h5 className="font-medium text-green-700 mb-3 pb-1 border-b border-green-100">
                                                                {category} ({products.length})
                                                            </h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {products.map(product =>
                                                                    renderCompactProduct(product, store)
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Preview of products when not expanded */}
                                            {expandedStoreId !== store.id && Object.keys(store.productsByCategory).length > 0 && (
                                                <div className="px-4 py-3 border-t border-gray-200">
                                                    <div className="flex flex-wrap gap-2">
                                                        {Object.values(store.productsByCategory).flat().slice(0, 3).map((product, index) => (
                                                            <div key={index} className="flex items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                                {product.image && (
                                                                    <div className="w-8 h-8 flex-shrink-0 mr-2 bg-white rounded-md p-1">
                                                                        <img
                                                                            src={product.image}
                                                                            alt={product.name_vi || product.name}
                                                                            className="w-full h-full object-contain"
                                                                            onError={(e) => {
                                                                                e.target.onerror = null;
                                                                                e.target.src = '/images/default-product.jpg';
                                                                            }}
                                                                        />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="font-medium text-xs truncate">{product.name_vi || product.name}</div>
                                                                    <div className="flex justify-between items-center text-xs">
                                                                        <div className="text-green-600">{formatCurrency(product.cost)}đ</div>
                                                                        <div className="text-gray-500">{product.quantity} {product.unit}</div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {Object.values(store.productsByCategory).flat().length > 3 && (
                                                            <div className="bg-gray-100 p-2 rounded-lg flex items-center justify-center text-xs text-gray-500">
                                                                +{Object.values(store.productsByCategory).flat().length - 3} sản phẩm khác
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Alternatives count indicator */}
                                                    {(() => {
                                                        const totalAlternatives = Object.values(store.productsByCategory).flat()
                                                            .reduce((total, product) => total + (product.alternatives?.length || 0), 0);
                                                        
                                                        return totalAlternatives > 0 && (
                                                            <div className="flex items-center mt-3 bg-orange-50 p-2 rounded-lg border border-orange-100">
                                                                <HiSwitchHorizontal className="w-4 h-4 text-orange-500 mr-2" />
                                                                <div className="text-xs text-orange-700">
                                                                    Có <span className="font-medium">{totalAlternatives}</span> sản phẩm thay thế có sẵn
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}

                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <p className="text-gray-500">Không tìm thấy cửa hàng phù hợp</p>
                                    <p className="text-gray-400 text-sm mt-2">Thử thay đổi các nguyên liệu trong giỏ hàng của bạn</p>
                                </div>
                            )}
                        </div>

                        {/* Back to cart button */}
                        <div className="flex justify-center mt-6">
                            <button
                                onClick={handleBackToCart}
                                className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors"
                            >
                                <FiArrowLeft className="w-5 h-5 mr-2" />
                                Trở về Giỏ Hàng
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />

            {/* Similar Products Modal */}
            <SimilarProductsModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                product={currentProduct}
                similarProducts={similarProductsForModal}
                onSelectProduct={handleProductSwapFromModal}
                formatPrice={formatPrice}
            />
        </div>
    );
};

export default CheckoutCalculation;