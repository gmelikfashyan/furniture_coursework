import axios from "axios";
const API_URL = 'http://localhost:5000/api';
const api = axios.create({
    baseURL: API_URL,
});



const createChat = async (listing_id) => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }

        const response = await api.post('/chats', 
            { listing_id },
            {
                headers: {
                    'Authorization': `Bearer ${storedUser.token}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Ошибка при создании чата:', error.response?.data?.message || error.message);
        throw error;
    }
};


const getChats = async () => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const response = await api.get('/chats');
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении чатов:', error.response?.data?.message || error.message);
        throw error;
    }
};


const getChatMessages = async (chatId) => {
    try {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (!storedUser?.token) {
            throw new Error('Токен не найден');
        }
        api.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        const response = await api.get(`/chats/${chatId}/messages`);
        return response.data;
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error.response?.data?.message || error.message);
        throw error;
    }
};

import io from 'socket.io-client';

// Подключение к Socket.IO серверу
const connectSocket = (userId) => {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
        console.log('Подключено к серверу чата');
    });
    return socket;
};
// Присоединение к комнате чата
const joinChat = (socket, chatId) => {
    socket.emit('join', chatId);
};
// Отправка сообщения
const sendMessage = (socket, chatId, userId, message) => {
    socket.emit('sendMessage', { chatId, userId, message });
};
// Оповещение о печатании
const sendTyping = (socket, chatId, username) => {
    socket.emit('typing', { chatId, username });
};
// Слушатель новых сообщений
const listenForMessages = (socket, callback) => {
    socket.on('message', (message) => {
        callback(message);
    });
};
// Слушатель печатания
const listenForTyping = (socket, callback) => {
    socket.on('typing', (data) => {
        callback(data);
    });
};
export {
    createChat,
    connectSocket,
    joinChat,
    getChats,
    getChatMessages,
    sendMessage,
    listenForMessages,
    listenForTyping
}