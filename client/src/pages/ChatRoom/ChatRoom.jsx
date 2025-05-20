import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from './ChatRoom.module.css';
import {getChatMessages} from "../../js/chat"

export default function ChatRoom() {
  const { id: chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef();
  const currentUser = JSON.parse(localStorage.getItem('user')).user;

  // Загрузка сообщений и настройка WebSocket
  useEffect(() => {
    fetchMessages();

    // Настройка WebSocket соединения
    socketRef.current = io('http://localhost:5000', {
      auth: {
        token: currentUser.token
      }
    });

    socketRef.current.emit('join', chatId);

    // Обработчики событий WebSocket
    socketRef.current.on('message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    socketRef.current.on('typing', ({ username }) => {
      setTypingUser(username);
      setIsTyping(true);
      
      const timer = setTimeout(() => {
        setIsTyping(false);
        setTypingUser('');
      }, 5000);
      
      return () => clearTimeout(timer);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, currentUser.token]);
  const fetchMessages = async () => {
    try {
        const data = await getChatMessages(chatId);
        if (data) {
            setMessages(data);
            setError(null);
        } else {
            throw new Error("Не удалось получить данные");
        }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Прокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim() === '') return;

    const messageData = {
      chatId,
      userId: currentUser.id,
      message: newMessage
    };
    console.log(messageData);

    socketRef.current.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      socketRef.current.emit('typing', {
        chatId,
        username: currentUser.username
      });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка сообщений...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messagesContainer}>
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`${styles.message} ${
              message.sender_id === currentUser.id ? styles.sent : styles.received
            }`}
          >
            <div className={styles.messageHeader}>
              <span className={styles.senderName}>
                {message.sender_name}
              </span>
              <span className={styles.messageTime}>
                {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className={styles.messageContent}>
              {message.message}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className={`${styles.message} ${styles.received} ${styles.typingIndicator}`}>
            <div className={styles.messageContent}>
              {typingUser} печатает...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <textarea
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Напишите сообщение..."
          className={styles.messageInput}
          rows={3}
        />
        <button 
          onClick={handleSendMessage}
          disabled={!newMessage.trim()}
          className={styles.sendButton}
        >
          Отправить
        </button>
      </div>
    </div>
  );
}