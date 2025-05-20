const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Создание Express приложения
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:5173", "http://localhost:3000", ],
        methods: ["GET", "POST"],
      }
});
// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(async (req, res, next) => {
    try {
      await pool.query('SET client_encoding TO UTF8');
      next();
    } catch (error) {
      console.error('Ошибка при установке кодировки:', error);
      next(error);
    }
  });
// Middleware для проверки авторизации
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Необходима авторизация' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, user) => {
        if (err) return res.status(403).json({ message: 'Токен недействителен' });
        req.user = user;
        next();
    });
};

// Middleware для проверки роли админа
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Доступ запрещен' });
    }
    next();
};

// Конфигурация подключения к базе данных
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Gevork2611@localhost:5432/testdb?client_encoding=utf8',
  });

// Создание директории для загрузки файлов, если она не существует
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Регистрация пользователя
app.post('/api/register', async (req, res) => {
    console.log("Регистрация");
    try {
        const { email, password, username, phone, name, surname } = req.body;
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await pool.query(
            'INSERT INTO users (email, password, username, phone, name, surname) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, email, username, role',
            [email, hashedPassword, username, phone, name, surname]
        );
        // Создание JWT токена
        const token = jwt.sign(
            { id: newUser.rows[0].id, email, role: newUser.rows[0].role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            user: newUser.rows[0],
            token
        });
    } catch (error) {
        console.error('Ошибка при регистрации:', error);
        res.status(500).json({ message: 'Ошибка сервера при регистрации' });
    }
});

// Вход пользователя
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Поиск пользователя по email
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        const user = result.rows[0];

        // Проверка пароля
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        // Создание JWT токена
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.json({
            message: 'Успешный вход',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role
            },
            token
        });
    } catch (error) {
        console.error('Ошибка при входе:', error);
        res.status(500).json({ message: 'Ошибка сервера при входе' });
    }
});

// Получение всех объявлений
app.get('/api/listings', async (req, res) => {
    try {
        const { sort, order, search, minYear, minPrice, maxPrice, location } = req.query;
        let query = `
      SELECT l.*, u.username, u.email, u.phone, 
             (SELECT image_url FROM images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.is_active = true
    `;
        if (search) {
            query += ` AND (l.title ILIKE '%${search}%' OR l.description ILIKE '%${search}%')`;
        }
        if (minYear) {
            query += ` AND l.year >= ${minYear}`;
        }
        if (minPrice && maxPrice) {
            query += ` AND l.price BETWEEN ${minPrice} AND ${maxPrice}`;
        }
        else if (minPrice) {
            query += ` AND l.price >= ${minPrice}`;
        }
        else if (maxPrice) {
            query += ` AND l.price <= ${minPrice}`;
        }
        if (location) {
            query += ` AND l.location = '${location}'`;
        }
        if (sort && order) {
            query += ` ORDER BY ${sort} ${order}`;
        } else {
            query += ` ORDER BY l.created_at DESC`;
        }
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении объявлений:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении объявлений' });
    }
});

// Получение одного объявления по ID
app.get('/api/listings/:id', async (req, res) => {
    try {
        const listingId = req.params.id;

        // Получение данных объявления
        const listingResult = await pool.query(`
      SELECT l.*, u.username, u.email, u.phone
      FROM listings l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = $1
    `, [listingId]);

        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        // Получение изображений для объявления
        const imagesResult = await pool.query('SELECT * FROM images WHERE listing_id = $1', [listingId]);

        const listing = {
            ...listingResult.rows[0],
            images: imagesResult.rows
        };

        res.json(listing);
    } catch (error) {
        console.error('Ошибка при получении объявления:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении объявления' });
    }
});

// Создание нового объявления
app.post('/api/listings', authenticateToken, upload.fields([
    { name: 'images', maxCount: 5 },
    { name: 'model', maxCount: 1 }
]), async (req, res) => {
    try {
        const { title, description, price, location, year, type, address } = req.body;
        const userId = req.user.id;
        const lat = 55.6614;
        const lng = 37.4770;

        let modelUrl = null;
        // Обработка GLB модели, если она была загружена
        if (req.files.model && req.files.model[0]) {
            modelUrl = `/uploads/${req.files.model[0].filename}`;
        }

        const result = await pool.query(
            'INSERT INTO listings (title, description, price, location, lat, lng, user_id, year, type, address, model_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [title, description, price, location, lat, lng, userId, year, type, address, modelUrl]
        );
        const listingId = result.rows[0].id;

        // Обработка изображений
        if (req.files.images && req.files.images.length > 0) {
            const imagePromises = req.files.images.map(async (file, index) => {
                const isPrimary = index === 0;
                const imageUrl = `/uploads/${file.filename}`;
                return pool.query(
                    'INSERT INTO images (listing_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *',
                    [listingId, imageUrl, isPrimary]
                );
            });
            await Promise.all(imagePromises);
        }

        res.status(201).json({
            message: 'Объявление успешно создано',
            listing: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при создании объявления:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании объявления' });
    }
});

// Обновление объявления
app.put('/api/listings/:id', authenticateToken, async (req, res) => {
    try {
        const listingId = req.params.id;
        const { title, description, price, location, lat, lng, is_active } = req.body;
        const userId = req.user.id;

        // Проверка, принадлежит ли объявление пользователю
        const listingCheck = await pool.query('SELECT user_id FROM listings WHERE id = $1', [listingId]);

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        if (listingCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав на редактирование этого объявления' });
        }

        // Обновление объявления
        const result = await pool.query(
            'UPDATE listings SET title = $1, description = $2, price = $3, location = $4, lat = $5, lng = $6, is_active = $7 WHERE id = $8 RETURNING *',
            [title, description, price, location, lat, lng, is_active, listingId]
        );

        res.json({
            message: 'Объявление успешно обновлено',
            listing: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при обновлении объявления:', error);
        res.status(500).json({ message: 'Ошибка сервера при обновлении объявления' });
    }
});

// Удаление объявления
app.delete('/api/listings/:id', authenticateToken, async (req, res) => {
    try {
        const listingId = req.params.id;
        const userId = req.user.id;

        // Проверка, принадлежит ли объявление пользователю или пользователь - админ
        const listingCheck = await pool.query('SELECT user_id FROM listings WHERE id = $1', [listingId]);

        if (listingCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }

        if (listingCheck.rows[0].user_id !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'У вас нет прав на удаление этого объявления' });
        }

        // Получение изображений для удаления файлов
        const images = await pool.query('SELECT image_url FROM images WHERE listing_id = $1', [listingId]);

        // Удаление файлов изображений
        images.rows.forEach(image => {
            const imagePath = path.join(__dirname, image.image_url);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        });

        // Удаление объявления из базы данных (каскадно удалятся и изображения)
        await pool.query('DELETE FROM listings WHERE id = $1', [listingId]);

        res.json({ message: 'Объявление успешно удалено' });
    } catch (error) {
        console.error('Ошибка при удалении объявления:', error);
        res.status(500).json({ message: 'Ошибка сервера при удалении объявления' });
    }
});

// Получение объявлений пользователя
app.get('/api/my-listings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT l.*, 
             (SELECT image_url FROM images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
      FROM listings l
      WHERE l.user_id = $1
      ORDER BY l.created_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении объявлений пользователя:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении объявлений пользователя' });
    }
});

// Админ: получение всех объявлений (включая неактивные)
app.get('/api/admin/listings', authenticateToken, isAdmin, async (req, res) => {
    try {
        const result = await pool.query(`
      SELECT l.*, u.username, u.email,
             (SELECT image_url FROM images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as primary_image
      FROM listings l
      JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
    `);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении всех объявлений:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении всех объявлений' });
    }
});

// Создание нового чата
app.post('/api/chats', authenticateToken, async (req, res) => {
    try {
        const { listing_id } = req.body;
        const buyer_id = req.user.id;
        // Получение данных о продавце
        const listingResult = await pool.query('SELECT user_id FROM listings WHERE id = $1', [listing_id]);
        if (listingResult.rows.length === 0) {
            return res.status(404).json({ message: 'Объявление не найдено' });
        }
        const seller_id = listingResult.rows[0].user_id;
        // Проверка, чтобы покупатель не создавал чат с самим собой
        if (buyer_id === seller_id) {
            return res.status(400).json({ message: 'Вы не можете создать чат с самим собой' });
        }
        // Проверка, существует ли уже чат
        const chatExists = await pool.query(
            'SELECT * FROM chats WHERE listing_id = $1 AND buyer_id = $2 AND seller_id = $3',
            [listing_id, buyer_id, seller_id]
        );
        if (chatExists.rows.length > 0) {
            return res.json({
                message: 'Чат уже существует',
                chat: chatExists.rows[0]
            });
        }
        const result = await pool.query(
            'INSERT INTO chats (listing_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING *',
            [listing_id, buyer_id, seller_id]
        );
        res.status(201).json({
            message: 'Чат успешно создан',
            chat: result.rows[0]
        });
    } catch (error) {
        console.error('Ошибка при создании чата:', error);
        res.status(500).json({ message: 'Ошибка сервера при создании чата' });
    }
});

// Получение чатов пользователя
app.get('/api/chats', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(`
      SELECT c.*, 
             l.title as listing_title, 
             l.price as listing_price,
             (SELECT image_url FROM images WHERE listing_id = l.id AND is_primary = true LIMIT 1) as listing_image,
             CASE
               WHEN c.buyer_id = $1 THEN seller.username
               WHEN c.seller_id = $1 THEN buyer.username
             END as other_user_name,
             (SELECT message FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
             (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
             (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != $1 AND is_read = false) as unread_count
      FROM chats c
      JOIN listings l ON c.listing_id = l.id
      JOIN users buyer ON c.buyer_id = buyer.id
      JOIN users seller ON c.seller_id = seller.id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY last_message_time DESC NULLS LAST
    `, [userId]);

        res.json(result.rows);
    } catch (error) {
        console.error('Ошибка при получении чатов:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении чатов' });
    }
});

// Получение сообщений чата
app.get('/api/chats/:id/messages', authenticateToken, async (req, res) => {
    try {
        const chatId = req.params.id;
        const userId = req.user.id;
        console.log('Полный путь:', req.path); // /api/chats/123/messages
        console.log('Params:', req.params);    // { id: '123' }
        console.log('chatId тип:', typeof chatId, 'значение:', chatId);

        // Проверка, имеет ли пользователь доступ к чату
        const chatCheck = await pool.query(
            'SELECT * FROM chats WHERE id = $1 AND (buyer_id = $2 OR seller_id = $2)',
            [chatId, userId]
        );

        if (chatCheck.rows.length === 0) {
            return res.status(403).json({ message: 'У вас нет доступа к этому чату' });
        }

        // Получение сообщений
        const messages = await pool.query(`
      SELECT m.*, u.username as sender_name
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
    `, [chatId]);

        // Пометить все непрочитанные сообщения как прочитанные
        await pool.query(
            'UPDATE messages SET is_read = true WHERE chat_id = $1 AND sender_id != $2 AND is_read = false',
            [chatId, userId]
        );

        res.json(messages.rows);
    } catch (error) {
        console.error('Ошибка при получении сообщений:', error);
        res.status(500).json({ message: 'Ошибка сервера при получении сообщений' });
    }
});

// Настройка WebSocket для чата
io.on('connection', (socket) => {
    console.log('Новое соединение:', socket.id);
    socket.on('join', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`Пользователь присоединился к чату ${chatId}`);
    });
    // Отправка сообщения
    socket.on('sendMessage', async (data) => {
        try {
            const { chatId, userId, message } = data;
            const result = await pool.query(
                'INSERT INTO messages (chat_id, sender_id, message) VALUES ($1, $2, $3) RETURNING *',
                [chatId, userId, message]
            );
            console.log(userId)
            const userResult = await pool.query('SELECT username FROM users WHERE id = $1', [userId]);
            console.log(userResult);
            const sender_name = userResult.rows[0].username;
            const newMessage = {
                ...result.rows[0],
                sender_name
            };
            io.to(`chat_${chatId}`).emit('message', newMessage);
        } catch (error) {
            console.error('Ошибка при отправке сообщения:', error);
        }
    });
    socket.on('typing', (data) => {
        const { chatId, username } = data;
        socket.to(`chat_${chatId}`).emit('typing', { username });
    });
    socket.on('disconnect', () => {
        console.log('Пользователь отключился:', socket.id);
    });
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});