import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MyChats.module.css';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {getChats} from "../../js/chat";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  

  useEffect(() => {
    fetchChats();
  }, []);
  const fetchChats = async () => {
    setLoading(true);
    try {
        const data = await getChats();
        if (data) {
            setChats(data);
            setError(null);
        } else {
            throw new Error("Не удалось получить данные");
        }
    } catch (err) {
        setError("Не удалось загрузить чаты");
        console.error("Ошибка при загрузке объявления:", err);
    } finally {
        setLoading(false);
    }
};

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'HH:mm', { locale: ru });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd MMMM', { locale: ru });
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка чатов...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.chatContainer}>
      <h1 className={styles.title}>Мои чаты</h1>
      
      {chats.length === 0 ? (
        <div className={styles.empty}>У вас пока нет активных чатов</div>
      ) : (
        <div className={styles.chatList}>
          {chats.map(chat => (
            <div 
              key={chat.id} 
              className={styles.chatItem}
              onClick={() => navigate(`/chats/${chat.id}/messages`)}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={`http://localhost:5000${chat.listing_image}`} 
                  alt={chat.listing_title}
                  className={styles.listingImage}
                />
                {chat.unread_count > 0 && (
                  <span className={styles.unreadBadge}>{chat.unread_count}</span>
                )}
              </div>
              
              <div className={styles.chatContent}>
                <div className={styles.chatHeader}>
                  <h3 className={styles.listingTitle}>{chat.listing_title}</h3>
                  <span className={styles.listingPrice}>{chat.listing_price} ₽</span>
                </div>
                
                <div className={styles.chatInfo}>
                  <p className={styles.otherUser}>С {chat.other_user_name}</p>
                  {chat.last_message && (
                    <>
                      <p className={styles.lastMessage}>
                        {chat.last_message.length > 50 
                          ? `${chat.last_message.substring(0, 50)}...` 
                          : chat.last_message}
                      </p>
                      <div className={styles.messageTime}>
                        {formatDate(chat.last_message_time)}
                        <span className={styles.timeSeparator}>•</span>
                        {formatTime(chat.last_message_time)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}