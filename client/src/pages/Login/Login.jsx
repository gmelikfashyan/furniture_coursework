import styles from './Login.module.css'
import { useContext, useState } from 'react'
import {Link} from "react-router-dom"
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';

export default function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext); 
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); 
        let res; // Активируем состояние загрузки
        try {
            res = await login(formData);
            if (res.success === true) {
                navigate("/");
            }
            else {
                setErrorMessage(res.message);
                setIsErrorModalOpen(true);
            }
        } catch (error) {
            console.error("Ошибка регистрации:", error);
        } finally {
            setLoading(false); // Выключаем загрузку в любом случае
        }
    };
    
    return (
        <div>
            {isErrorModalOpen && (
                <div className={styles.errorModalOverlay}>
                    <div className={styles.errorModal}>
                    <h3>Ошибка авторизации</h3>
                    <p>{errorMessage}</p>
                    <button 
                        onClick={() => setIsErrorModalOpen(false)}
                        className={styles.modalCloseBtn}
                    >
                        Закрыть
                    </button>
                    </div>
                </div>
            )}
            <div className={styles.authFormContainer}>
                <h2>Вход</h2>
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
                        {loading ? 'Загрузка...' : 'Вход'}
                    </button>
                </form>
      
                <div className={styles["auth-footer"]}>
                    <p>
                    Нет аккаунта? <Link to={'/register'}>Зарегистрироваться</Link>
                    </p>
                </div>
            </div>
        </div>
    )
}