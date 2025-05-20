import {useEffect, useState, useRef, Suspense} from "react";
import {getMyListings} from "../../js/api.js";
import { Search, ChevronUp, ChevronDown, AlertCircle } from "lucide-react";
import styles from "./MyListings.module.css"
import {Link} from "react-router-dom"


// Компонент 3D-модели мебели

  

  
  // Основной компонент просмотра


export default function MyListings() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        fetchListings();
    }, []);

    const fetchListings = async () => {
        setLoading(true);
        try {
            // Используем предоставленную функцию getListings


            const data = await getMyListings();

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
    if (listings) {
        console.log(listings);
    }

    return (
        <div className={styles.container}>
             
           

            <h1 className={styles.header}>Объявления</h1>
            
            
            
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
                                        src={`https://furniture-coursework.onrender.com${listing.primary_image}`}
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