import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {AuthProvider} from "./context/AuthContext.jsx";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Home from "./pages/Home/Home.jsx";
import ListingDetail from "./pages/ListingDetail/ListingDetail.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import CreateListing from "./pages/CreateListing/CreateListing.jsx";
import MyListings from "./pages/MyListings/MyListings.jsx";
import MyChats from "./pages/MyChats/MyChats.jsx";
import ChatRoom from "./pages/ChatRoom/ChatRoom.jsx";
import ChangeListing from "./pages/ChangeListing/ChangeListing.jsx"
import AdminRoute from "./components/AdminRoute.jsx";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<App />}>
                        <Route index element={<Home />} />
                        <Route path="listings/:id" element={<ListingDetail />} />
                        <Route path="login" element={<Login />} />
                        <Route path="register" element={<Register />} />
                        <Route path="create-listing" element={
                            <PrivateRoute>
                                <CreateListing />
                            </PrivateRoute>
                        } />
                        <Route path="listings/:id/change" element={
                            <PrivateRoute>
                                <ChangeListing />
                            </PrivateRoute>
                        } />
                        <Route path="my-listings" element={
                            <PrivateRoute>
                                <MyListings />
                            </PrivateRoute>
                        } />
                        <Route path="my-chats" element={
                            <PrivateRoute>
                                <MyChats />
                            </PrivateRoute>
                        } />
                        <Route path="chats/:id/messages" element={
                            <PrivateRoute>
                                <ChatRoom />
                            </PrivateRoute>
                        } />

                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>
)