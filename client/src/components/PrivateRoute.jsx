import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

// Компонент для защиты маршрутов, требующих авторизации
const PrivateRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }


    return children;
};

export default PrivateRoute;