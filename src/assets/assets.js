import cartImg from './images/cart.png';
import logoImg from './images/logo.png';
import bhxLogo from './images/bachhoaxanh.webp';
import coopfoodLogo from './images/coopfood.jpg';
import winmartLogo from './images/winmart.jpg';
import backgroundImage from './images/background.jpg'

export const images = {
    cart: cartImg,
    logo: logoImg,
    bhx: bhxLogo,
    coopfood: coopfoodLogo,
    winmart: winmartLogo,
    background: backgroundImage
};


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
    }
];

export default {
    images,
    restaurantsList
};