import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';


const AdminRoute = ({ children }) => {
    const { user, loading, isAdmin } = useContext(AuthContext);


    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }


    if (!user || !isAdmin()) {
        return <Navigate to="/" />;
    }

    return children;
};

export default AdminRoute;