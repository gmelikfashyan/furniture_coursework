import styles from './Register.module.css'
import { useContext, useState } from 'react'
import {Link} from "react-router-dom"
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

export default function Register() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        username: "",
        phone: "",
        name: "",
        surname: "",
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { register } = useContext(AuthContext); 
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Активируем состояние загрузки
        try {
            await register(formData);
            navigate('/login'); // Вызываем функцию регистрации
            // Можно добавить редирект после успешной регистрации
        } catch (error) {
            console.error("Ошибка регистрации:", error);
        } finally {
            setLoading(false); // Выключаем загрузку в любом случае
        }
    };
    
    return (
        <div>
            <div className={styles.authFormContainer}>
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit} className={styles.authForm}>
                    <label htmlFor='email'>Email</label>
                    <input 
                        type="email"
                        id='email'
                        name='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder='Введите ваш email'
                    />
                    <label htmlFor='username'>Имя пользователя</label>
                    <input 
                        type="text"
                        id='username'
                        name='username'
                        value={formData.username}
                        onChange={handleChange}
                        required
                        placeholder='Введите имя пользователя'
                    />
                    <label htmlFor='name'>Имя</label>
                    <input 
                        type="text"
                        id='name'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder='Введите Ваше имя'
                    />
                    <label htmlFor='surname'>Фамилия</label>
                    <input 
                        type="text"
                        id='surname'
                        name='surname'
                        value={formData.surname}
                        onChange={handleChange}
                        required
                        placeholder='Введите Вашу фамилию'
                    />
                    <label htmlFor="phone">Телефон</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Введите ваш телефон"
                    />
                    <label htmlFor="password">Пароль</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="Введите пароль"
                        minLength="6"
                    />
                    <button 
                        type="submit" 
                        className={styles["auth-button"]}
                        disabled={loading}
                    >
                        {loading ? 'Загрузка...' : 'Зарегистрироваться'}
                    </button>
                </form>
      
                <div className={styles["auth-footer"]}>
                    <p>
                    Уже есть аккаунт? <Link to={'/login'}>Войти</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}