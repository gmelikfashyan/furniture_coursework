import axios from "axios";
const API_URL = 'https://furniture-coursework.onrender.com/api';
const api = axios.create({
    baseURL: API_URL,
});

const register = async (userData) => {
    try {
        const response = await api.post('/register', userData);
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data;
    } catch (error) {
        console.error('Ошибка регистрации:', error.response?.data?.message || error.message);
        throw error;
    }
};
const login = async (credentials) => {
    try {
        const response = await api.post('/login', credentials);

        // Сохранение токена и информации о пользователе
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        return response.data;
    } catch (error) {
        console.error('Ошибка входа:', error.response?.data?.message || error.message);
        throw error;
    }
};

const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Перенаправление на домашнюю страницу
    window.location.href = '/login';
};
export { register, login, logout };