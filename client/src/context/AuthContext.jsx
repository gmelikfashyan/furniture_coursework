import { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const API_URL = 'https://furniture-coursework.onrender.com/api';
const api = axios.create({
    baseURL: API_URL,
});

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        const checkLoggedIn = async () => {
            let storedUser = localStorage.getItem('user');

            if (storedUser) {
                storedUser = JSON.parse(storedUser);
                setUser(storedUser);

                // Настройка заголовка Authorization для всех будущих запросов
                api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
            }

            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    // Регистрация пользователя
    const register = async (userData) => {
        try {
            const res = await api.post('/register', userData);

            if (res.data.token) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);

                // Настройка заголовка Authorization для всех будущих запросов
                axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Ошибка при регистрации'
            };
        }
    };

    // Вход пользователя
    const login = async (userData) => {
        try {
            const res = await api.post('/login', userData);

            if (res.data.token) {
                localStorage.setItem('user', JSON.stringify(res.data));
                setUser(res.data);

                // Настройка заголовка Authorization для всех будущих запросов
                api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;

                return { success: true };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Неверный email или пароль'
            };
        }
    };

    // Выход пользователя
    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        delete api.defaults.headers.common['Authorization'];
        navigate('/');
    };

    // Проверка, является ли пользователь администратором
    const isAdmin = () => {
        return user?.user?.role === 'admin';
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                register,
                login,
                logout,
                isAdmin
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;