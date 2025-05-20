import {useEffect, useState, useRef, Suspense} from "react";
import {getListings} from "../../js/api.js";
import { Search, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import styles from "./Home.module.css"
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import * as THREE from 'three';
import chairModel from "/seat.glb";
import ARViewer from '../ARViewer.jsx';
import {Link} from "react-router-dom"


// Компонент 3D-модели мебели

  

  
  // Основной компонент просмотра


export default function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [sortField, setSortField] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("DESC");
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(null);
    const [minYear, setMinYear] = useState(null);
    const [location, setLocation] = useState("");
    const [roomImage, setRoomImage] = useState(null);
    const [furniturePosition, setFurniturePosition] = useState([0, 0, 0]);
    const [isDragging, setIsDragging] = useState(false);
    const floorRef = useRef();
    const [showAR, setShowAR] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState(null);
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onload = (event) => {
          setBackgroundImage(event.target.result);
        };
        reader.readAsDataURL(file);
      };
    
  
    
    

    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Используем предоставленную функцию getListings
            const params = {};
            if (search) params.search = search;
            if (sortField) params.sort = sortField;
            if (sortOrder) params.order = sortOrder;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (minYear) params.minYear = minYear;
            if (location) params.location = location;

            const data = await getListings(params);

            if (data) {
                setListings(data);
                setError(null);
            } else {
                throw new Error("Не удалось получить данные");
            }
        } catch (err) {
            setError("Не удалось загрузить объявления");
            console.error("Ошибка при загрузке объявлений:", err);
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = () => {
        setMinPrice(0);
        setMaxPrice(Infinity);
        setMinYear(-Infinity);
        setLocation("");
        fetchListings();
    }

    const handleSearch = () => {
        setSearch(searchInput);
    };

    const toggleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
        } else {
            setSortField(field);
            setSortOrder("ASC");
        }
    };

    const getSortIcon = (field) => {
        if (sortField !== field) return null;
        return sortOrder === "ASC" ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    if (loading && listings.length === 0) {
        return (
            <div className={styles.loading}>
                <div>Загрузка объявлений...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.error}>
                {error}
            </div>
        );
    }

    return (
        <div className={styles.container}>
             
            

            <h1 className={styles.header}>Объявления</h1>
            
            
            <aside className={styles.filters}>
                {/* Поле поиска */}
                <div className={styles.filterGroup}>
                    <label htmlFor="search" className={styles.filterLabel}>Поиск</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Введите название"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={styles.filterInput}
                    />
                </div>

                {/* Диапазон цен */}
                <div className={styles.filterGroup}>
                    <label htmlFor="minPrice" className={styles.filterLabel}>Цена от</label>
                    <input
                        type="number"
                        id="minPrice"
                        placeholder="Минимальная цена"
                        value={minPrice === -Infinity ? '' : minPrice}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : -Infinity)}
                        className={styles.filterInput}
                    />
                </div>

                <div className={styles.filterGroup}>
                    <label htmlFor="maxPrice" className={styles.filterLabel}>Цена до</label>
                    <input
                        type="number"
                        id="maxPrice"
                        placeholder="Максимальная цена"
                        value={maxPrice === Infinity ? '' : maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : Infinity)}
                        className={styles.filterInput}
                    />
                </div>

                {/* Год */}
                <div className={styles.filterGroup}>
                    <label htmlFor="minYear" className={styles.filterLabel}>Год от</label>
                    <input
                        type="number"
                        id="minYear"
                        placeholder="Минимальный год"
                        value={minYear === -Infinity ? '' : minYear}
                        onChange={(e) => setMinYear(e.target.value ? Number(e.target.value) : -Infinity)}
                        className={styles.filterInput}
                    />
                </div>

                {/* Выбор города */}
                <div className={styles.filterGroup}>
                    <label htmlFor="location" className={styles.filterLabel}>Город</label>
                    <select
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="">Все города</option>
                        <option value="Москва">Москва</option>
                        <option value="Санкт-Петербург">Санкт-Петербург</option>
                        <option value="Новосибирск">Новосибирск</option>
                        <option value="Екатеринбург">Екатеринбург</option>
                        <option value="Казань">Казань</option>
                    </select>
                </div>

                {/* Кнопки */}
                <div className={styles.buttons}>
                    <button 
                        onClick={fetchListings}
                        className={`${styles.button} ${styles.buttonPrimary}`}
                    >
                        Применить
                    </button>    
                    <button 
                        onClick={resetFilters}
                        className={`${styles.button} ${styles.buttonSecondary}`}
                    >
                        Сбросить
                    </button>
                </div>
            </aside>
            

            <main className={styles.mainContent}>
                {loading && listings.length === 0 ? (
                    <div className={styles.loading}>
                        <div>Загрузка объявлений...</div>
                    </div>
                ) : error ? (
                    <div className={styles.error}>
                        <div>
                            <AlertCircle className={styles.errorIcon} size={20} />
                            {error}
                        </div>
                    </div>
                ) : listings.length === 0 ? (
                    <div className={styles.empty}>
                        Объявления не найдены
                    </div>
                ) : (
                    <div className={styles.listingsGrid}>
                        {listings.map((listing) => (
                            <div key={listing.id} className={styles.listingCard}>
                                <div className={styles.imageContainer}>
                                    {listing.primary_image ? (
                                        <img
                                            src={`https://furniture-coursework.onrender.com/${listing.primary_image}`}
                                            alt={listing.title}
                                            className={styles.listingImage}
                                            
                                        />
                                    ) : (
                                        <div className={styles.imagePlaceholder}>
                                            <img src="/api/placeholder/400/320" alt="Нет изображения" />
                                        </div>
                                    )}
                                </div>

                                <div className={styles.cardContent}>
                                    <h2 className={styles.cardTitle}>{listing.title}</h2>
                                    <p className={styles.cardDescription}>
                                        {listing.description}
                                    </p>
                                    <p className={styles.cardLocation}>
                                        {listing.location} {listing.address}
                                    </p>

                                    <div className={styles.cardFooter}>
                                        <div className={styles.cardPrice}>
                                            {listing.price ? `${listing.price} ₽` : "Цена не указана"}
                                        </div>
                                        <button className={styles.detailButton}>
                                            <Link to={`/listings/${listing.id}`}>Подробнее</Link>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
        
    );
}