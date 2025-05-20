import { useContext, useEffect, useState } from "react";
import styles from "./ListingDetail.module.css";
import cn from 'classnames';
import AuthContext from '../../context/AuthContext.jsx';
import { getListing, deleteListing } from "../../js/api.js";
import { useParams, useNavigate } from 'react-router-dom';
import { createChat } from "../../js/chat.js";
import { div } from "three/src/nodes/TSL.js";

export default function ListingDetail() {
    const { user, isAdmin } = useContext(AuthContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [trying, setTrying] = useState(false);
    const [isModelAccesible, setIsModelAccesible] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const [modelScale, setModelScale] = useState(0.01);
    const [containerDimensions, setContainerDimensions] = useState({
        width: 'auto',
        height: '500px' // Начальная высота по умолчанию
    });
    const handleScaleChange = (event) => {
        const newScale = parseFloat(event.target.value);
        setModelScale(newScale);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            
            // Загружаем изображение, чтобы получить его размеры
            const img = new Image();
            img.onload = () => {
                // Устанавливаем размеры контейнера на основе пропорций изображения
                // с максимальной шириной в 100%
                const aspectRatio = img.height / img.width;
                setContainerDimensions({
                    width: '100%',
                    height: `${Math.min(aspectRatio * window.innerWidth, window.innerHeight * 0.8)}px`
                });
                
                setBackgroundImage(imageUrl);
            };
            img.src = imageUrl;
        }
    };
    useEffect(() => {
        const handleResize = () => {
            if (backgroundImage) {
                const img = new Image();
                img.onload = () => {
                    const aspectRatio = img.height / img.width;
                    setContainerDimensions({
                        width: '100%',
                        height: `${Math.min(aspectRatio * window.innerWidth, window.innerHeight * 0.8)}px`
                    });
                };
                img.src = backgroundImage;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [backgroundImage]);

    useEffect(() => {
        fetchListing();
    }, [id]); // Добавляем id в зависимости useEffect

    const fetchListing = async () => {
        setLoading(true);
        try {
            const data = await getListing(id);
            if (data) {
                setListing(data);
                setError(null);
                if (data.model_url) {
                    setIsModelAccesible(true);
                }
            } else {
                throw new Error("Не удалось получить данные");
            }
        } catch (err) {
            setError("Не удалось загрузить объявление");
            console.error("Ошибка при загрузке объявления:", err);
        } finally {
            setLoading(false);
        }
    };

    const isAuthorOrAdmin = () => {
        return user && listing && (user.user.id === listing.user_id || isAdmin());
    };

    const handleCreateChat = async () => {
        try {
            await createChat(id);
            // Перенаправление в чат или другое действие
        } catch (error) {
            console.error("Ошибка при создании чата:", error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteListing(id);
            navigate('/'); // Перенаправление после удаления
        } catch (error) {
            console.error("Ошибка при удалении:", error);
        }
    };

    const handleChange = async () => {
        navigate(`/listings/${id}/change`);
    };

    const nextImage = () => {
        console.log(currentImageIndex);
        if (listing.images?.length) {
            setCurrentImageIndex((prev) => 
                prev === listing.images.length - 1 ? 0 : prev + 1
            );
            console.log(listing.images.length);
        }
    };

    const prevImage = () => {
        if (listing.images?.length) {
            setCurrentImageIndex((prev) => 
                prev === 0 ? listing.images.length - 1 : prev - 1
            );
        }
    };

    const handleTrying = () => {
        if (trying == false)
            setTrying(true);
        else
            setTrying(false)

    }

    if (trying) {
        return (
            <div>
                <button onClick={handleTrying}>
                    Закрыть
                </button>
                <div style={{
                    position: 'relative',
                    width: containerDimensions.width,
                    height: containerDimensions.height,
                    backgroundColor: backgroundImage ? 'transparent' : 'white',
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                    backgroundSize: 'contain', // 'contain' вместо 'cover', чтобы не обрезать изображение
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}>
                    <model-viewer
                        src={`http://localhost:5000${listing.model_url}`}
                        scale={`${modelScale} ${modelScale} ${modelScale}`}
                        ar
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls
                        shadow-intensity="1"
                        alt="Диван в стиле лофт"
                        style={{
                            width: '100%',
                            height: '100%',
                            '--poster-color': 'transparent',
                            '--progress-bar-color': 'rgba(0,0,0,0.5)'
                        }}
                    >
                        <button slot="ar-button">Примерить в комнате (AR)</button>
                    </model-viewer>
                    <label>
                        Размер модели:
                        <input
                            type="range"
                            min="0.001"
                            max="0.05"
                            step="0.001"
                            value={modelScale}
                            onChange={handleScaleChange}
                            style={{ width: '150px' }}
                        />
                        <span style={{ marginLeft: '5px' }}>{(modelScale * 100).toFixed(0)}%</span>
                    </label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{
                            position: 'absolute',
                            bottom: '20px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            zIndex: 10
                        }}
                    />
                </div>
            </div>
            
        )
    }


    if (loading) {
        return (
            <div className={styles.loading}>
                <div>Загрузка объявления...</div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    if (!listing) {
        return <div className={styles.error}>Объявление не найдено</div>;
    }
    let currentImage = "";
    console.log(listing.images?.[currentImageIndex].image_url);
    if (listing.images?.[currentImageIndex].image_url) {
        currentImage = `http://localhost:5000${listing.images?.[currentImageIndex].image_url}`;
    }

    

    return (
        <div className={styles.listingContainer}>
            <div className={styles.leftWrapper}>
                <h1>{listing.title}</h1>
                <div className={styles.imgWrapper}>
                    <div className={cn(styles.leftButton, styles.imgButtonWrapper)}>
                        <button className={styles.imgButton} onClick={prevImage}>
                            &lt;
                        </button>
                    </div>
                    <img 
                        src={currentImage}
                        alt={"Картинка недоступна"} 
                    />
                    <div className={cn(styles.rightButton, styles.imgButtonWrapper)}>
                        <button className={styles.imgButton} onClick={nextImage}>
                            &gt;
                        </button>
                    </div>
                </div>
                <div>
                    <h2>Адрес</h2>
                    <p>{listing.location} {listing.address}</p>
                </div>
                <div>
                    <h2>Характеристики</h2>
                    <div>
                        <span>Год</span> <span>{listing.year}</span>
                    </div>
                    <div>
                        <span>Тип</span> <span>{listing.type}</span>
                    </div>
                </div>
                <div>
                    <h2>Описание</h2>
                    <p>{listing.description}</p>
                </div>
            </div>
            <div className={styles.rightWrapper}>
                <p className={styles.price}>{listing.price ? `${listing.price} ₽` : 'Цена не указана'}</p>
                <div className={styles.buttonWrapper}>
                    {isAuthorOrAdmin() ? (
                        <div className={styles.buttonDiv}>
                            <button 
                                onClick={handleDelete}
                                className={styles.deleteButton}
                                >
                                Удалить
                            </button>
                            <button 
                                onClick={handleChange}
                                className={styles.chatButton}
                                >
                                Изменить
                            </button>
                            
                        </div>
                        
                    ) : (
                        <button 
                            onClick={handleCreateChat}
                            className={styles.chatButton}
                        >
                            Написать
                        </button>
                    )}
                    {isModelAccesible && (
                        <button onClick={handleTrying} className={styles.ARButton}>
                            Примерить
                        </button>
                    )}
                </div>
                <p className={styles.author}>{listing.username}</p>
            </div>
        </div>
    );
}