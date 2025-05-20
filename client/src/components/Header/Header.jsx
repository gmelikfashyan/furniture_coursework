import {useContext} from "react";
import AuthContext from '../../context/AuthContext.jsx'
import {Link, Navigate, NavLink, useNavigate} from "react-router-dom";
import styles from './Header.module.css';

export default function Header() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerContainer}>
                <Link to='/'>Мебель</Link>
            </div>
            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    <li className={styles.navItem}>
                        <NavLink to='/' className={({ isActive }) => isActive ? styles.active : ''}>Главная</NavLink>
                    </li>
                    {user ? (
                        <>
                            <li className={styles.navItem}>
                                <NavLink to='/my-chats' className={({ isActive }) => isActive ? styles.active : ''}>Сообщения</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to='/my-listings' className={({ isActive }) => isActive ? styles.active : ''}>Мои объявления</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to='/create-listing' className={({ isActive }) => isActive ? styles.active : ''}>Добавить объявление</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <button onClick={handleLogout}>Выйти</button>
                            </li>
                        </>
                    ) : (
                        <>
                            <li className={styles.navItem}>
                                <NavLink to="/login" className={`${styles.navBtn} ${({ isActive }) => isActive ? styles.active : ''}`}>Вход</NavLink>
                            </li>
                            <li className={styles.navItem}>
                                <NavLink to="/register" className={`${styles.navBtn} ${({ isActive }) => isActive ? styles.active : ''}`}>Регистрация</NavLink>
                            </li>
                        </>
                    )}
                </ul>
            </nav>
        </header>
    )
}