import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import SavedBasketsList from '../components/saved-baskets/SavedBasketsList';
import { basketService } from '../services/basketService';
import { toast } from 'react-toastify';

const SavedBasketsPage = () => {
    const [baskets, setBaskets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSavedBaskets();
    }, []);

    const fetchSavedBaskets = async () => {
        try {
            setLoading(true);
            const savedBaskets = await basketService.getSavedBaskets();
            setBaskets(savedBaskets);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching saved baskets:", error);
            toast.error("Không thể tải giỏ hàng đã lưu. Vui lòng thử lại sau.");
            setBaskets([]);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <Navbar />

            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
                    </div>
                ) : (
                    <SavedBasketsList baskets={baskets} onRefresh={fetchSavedBaskets} />
                )}
            </div>

            <Footer />
        </div>
    );
};

export default SavedBasketsPage;