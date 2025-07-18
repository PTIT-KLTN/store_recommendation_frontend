import botmiImg from './images/botmi.jpg';
import cachuaImg from './images/cachua.jpg';
import caImg from './images/ca.jpg';
import carotImg from './images/carot.jpg';
import cartImg from './images/cart.png';
import comgaImg from './images/comga.jpg';
import dauanImg from './images/dauan.jpg';
import duongImg from './images/duong.jpg';
import gaoImg from './images/gao.jpg';
import garanImg from './images/garan.jpg';
import hatnemImg from './images/hatnem.jpg';
import logoImg from './images/logo.png';
import muoiImg from './images/muoi.jpg';
import myybobamImg from './images/myybobam.jpg';
import nuocmamImg from './images/nuocmam.jpg';
import phobobImg from './images/phobo.jpeg';
import pizzagaImg from './images/pizzaga.jpg';
import bokhoImg from './images/bokho.jpg';
import thitboImg from './images/thitbo.jpg';
import thitgaImg from './images/thitga.jpg';
import thitheoImg from './images/thitheo.jpg';
import toiImg from './images/toi.jpg';
import tomImg from './images/tom.jpg';
import bhxLogo from './images/bachhoaxanh.webp';
import coopfoodLogo from './images/coopfood.jpg';
import winmartLogo from './images/winmart.jpg';

export const images = {
    botmi: botmiImg,
    cachua: cachuaImg,
    ca: caImg,
    carot: carotImg,
    cart: cartImg,
    comga: comgaImg,
    dauan: dauanImg,
    duong: duongImg,
    gao: gaoImg,
    garan: garanImg,
    hatnem: hatnemImg,
    logo: logoImg,
    muoi: muoiImg,
    myybobam: myybobamImg,
    nuocmam: nuocmamImg,
    phobo: phobobImg,
    pizzaga: pizzagaImg,
    bokho: bokhoImg,
    thitbo: thitboImg,
    thitga: thitgaImg,
    thitheo: thitheoImg,
    toi: toiImg,
    tom: tomImg,
    bhx: bhxLogo,
    coopfood: coopfoodLogo,
    winmart: winmartLogo
};

export const ingredientsList = [
    { id: 1, name: "Bột Mì", category: "Bột", restaurantCount: 21, image: images.botmi, unit: "Kg" },
    { id: 2, name: "Gạo", category: "Gạo", restaurantCount: 45, image: images.gao, unit: "Kg" },
    { id: 3, name: "Dầu Ăn", category: "Dầu ăn", restaurantCount: 36, image: images.dauan, unit: "Lít" },
    { id: 4, name: "Nước Mắm", category: "Gia vị", restaurantCount: 50, image: images.nuocmam, unit: "Lít" },
    { id: 5, name: "Thịt Bò", category: "Thịt", restaurantCount: 47, image: images.thitbo, unit: "Kg" },
    { id: 6, name: "Thịt Gà", category: "Thịt", restaurantCount: 52, image: images.thitga, unit: "Kg" },
    { id: 7, name: "Tỏi", category: "Rau củ", restaurantCount: 55, image: images.toi, unit: "Kg" },
    { id: 8, name: "Cà Chua", category: "Rau củ", restaurantCount: 40, image: images.cachua, unit: "Kg" },
    { id: 9, name: "Muối", category: "Gia vị", restaurantCount: 42, image: images.muoi, unit: "Kg" },
    { id: 10, name: "Hạt Nêm", category: "Gia vị", restaurantCount: 33, image: images.hatnem, unit: "Kg" },
    { id: 11, name: "Đường", category: "Gia vị", restaurantCount: 28, image: images.duong, unit: "Kg" },
    { id: 12, name: "Cà Rốt", category: "Rau củ", restaurantCount: 38, image: images.carot, unit: "Kg" },
    { id: 13, name: "Thịt Heo", category: "Thịt", restaurantCount: 49, image: images.thitheo, unit: "Kg" },
    { id: 14, name: "Tôm", category: "Hải sản", restaurantCount: 44, image: images.tom, unit: "Kg" },
    { id: 15, name: "Cá", category: "Hải sản", restaurantCount: 41, image: images.ca, unit: "Kg " }
];

// Dishes list with references to ingredients
export const dishesList = [
    {
        id: 1,
        name: "Phở Bò",
        category: "Món Việt",
        image: images.phobo,
        ingredientIds: [2, 5, 7, 9, 10]
    },
    {
        id: 2,
        name: "Cơm Gà",
        category: "Món Việt",
        image: images.comga,
        ingredientIds: [2, 6, 7, 9, 10]
    },
    {
        id: 3,
        name: "Pizza Gà",
        category: "Món Ý",
        image: images.pizzaga,
        ingredientIds: [1, 3, 6, 7, 8, 9]
    },
    {
        id: 4,
        name: "Mì Ý Bò Bằm",
        category: "Món Ý",
        image: images.myybobam,
        ingredientIds: [1, 3, 5, 7, 8, 9]
    },
    {
        id: 5,
        name: "Gà Rán",
        category: "Món Âu",
        image: images.garan,
        ingredientIds: [1, 3, 6, 9, 10]
    },
    {
        id: 6,
        name: "Bò Kho",
        category: "Món Việt",
        image: images.bokho,
        ingredientIds: [5, 7, 8, 9, 10]
    }
];

export const restaurantsList = [
    {
        id: 1,
        name: "Bách hóa xanh",
        image: images.bhx,
        address: '1 Nguyễn Hữu Cảnh, Quận 1, TP Hồ Chí Minh',
        rating: 4,
        match: 80,
        totalPrice: 100000
    },
    {
        id: 2,
        name: "Coopfood",
        image: images.coopfood,
        address: '1 Nguyễn Hữu Cảnh, Quận 1, TP Hồ Chí Minh',
        rating: 4,
        match: 80,
        totalPrice: 100000
    },
    {
        id: 3,
        name: "Winmart",
        image: images.winmart,
        address: '1 Nguyễn Hữu Cảnh, Quận 1, TP Hồ Chí Minh',
        rating: 4,
        match: 80,
        totalPrice: 100000
    },
    {
        id: 4,
        name: "Bách hóa xanh",
        image: images.bhx,
        address: '1 Nguyễn Hữu Cảnh, Quận 1, TP Hồ Chí Minh',
        rating: 4,
        match: 90,
        totalPrice: 100000
    }
];

export const getIngredientById = (id) => {
    return ingredientsList.find(ingredient => ingredient.id === id);
};

export const getDishWithIngredients = (dishId) => {
    const dish = dishesList.find(dish => dish.id === dishId);

    if (!dish) return null;

    const dishWithIngredients = {
        ...dish,
        ingredients: dish.ingredientIds.map(id => getIngredientById(id)).filter(Boolean)
    };

    return dishWithIngredients;
};

export default {
    images,
    ingredientsList,
    dishesList,
    getIngredientById,
    getDishWithIngredients,
    restaurantsList
};