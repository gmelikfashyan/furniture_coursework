import axios from "axios";
const API_URL = 'https://furniture-coursework.onrender.com/api';
const api = axios.create({
    baseURL: API_URL,
});
const isAuthenticated = () => {
    return localStorage.getItem('token') !== null;
};
const getListings = async (params) => {
    try {
        const response = await api.get('/listings', {params: params});
        return response.data;
    } catch (error) {
        console.error(error);
    }
}
const getListing = async (id) => {
    try {
        const response = await api.get(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении объявления:', error.response?.data?.message || error.message);
        throw error;
    }
};

const createListing = async (listingData, images, modelFile) => {
    try {
        let storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const formData = new FormData();
        Object.keys(listingData).forEach(key => {
            formData.append(key, listingData[key]);
        });
        if (images && images.length) {
            images.forEach(image => {
                formData.append('images', image);
            });
        }
        if (modelFile) {
            formData.append('model', modelFile);
          }
        const response = await api.post('/listings', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании объявления:', error.response?.data?.message || error.message);
        throw error;
    }
};

const updateListing = async (id, listingData) => {
    try {
        let storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const response = await api.put(`/listings/${id}`, listingData);
        return response.data;
    } catch (error) {
        console.error('Ошибка при обновлении объявления:', error.response?.data?.message || error.message);
        throw error;
    }
};

const deleteListing = async (id) => {
    try {
        let storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const response = await api.delete(`/listings/${id}`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при удалении объявления:', error.response?.data?.message || error.message);
        throw error;
    }
};

const getMyListings = async () => {
    try {
        let storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const response = await api.get('/my-listings',
        );
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении объявлений пользователя:', error.response?.data?.message || error.message);
        throw error;
    }
};
const getAdminListings = async () => {
    try {
        const response = await api.get('/admin/listings');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении всех объявлений:', error.response?.data?.message || error.message);
        throw error;
    }
};
export {
    isAuthenticated,
    getListings,
    createListing,
    updateListing,
    deleteListing,
    getListing,
    getMyListings,
}