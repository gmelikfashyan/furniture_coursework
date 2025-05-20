import { useEffect, useState } from 'react';
import { updateListing, getListing } from "../../js/api";
import styles from './ChangeListing.module.css';
import { useParams, useNavigate } from 'react-router-dom';

export default function CangeListing() {
    const [isActive, setIsActive] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    year: '',
    type: '',
    address: '',
    is_active: '',
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const { id } = useParams();
    const navigate = useNavigate();
    const [listing, setListing] = useState(null);
  useEffect(() => {

  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  const handleChange = async () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);
    setFormData(prevFormData => ({
        ...prevFormData,
        is_active: newActiveState
    }));
};

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setMessage({ 
        text: 'Можно загрузить максимум 5 изображений', 
        type: 'error' 
      });
      return;
    }
    
    setImages(files);
    
    // Create image previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreview(newPreviews);
  };

  const handleModelChange = (e) => {
    const file = e.target.files[0];
    if (file && !file.name.endsWith('.glb')) {
      setMessage({
        text: 'Пожалуйста, загрузите файл в формате .glb',
        type: 'error'
      });
      return;
    }
    setModelFile(file || null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });
    
    try {
      if (!formData.title || !formData.price || !formData.location) {
        throw new Error('Пожалуйста, заполните все обязательные поля');
      }
      console.log(formData);
      const result = await updateListing(id, formData);
      
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        year: '',
        type: '',
        address: '',
        is_active: '',
      });
      
      setMessage({ 
        text: 'Объявление успешно создано!', 
        type: 'success' 
      });
      navigate("/my-listings");
    } catch (error) {
      setMessage({ 
        text: error.message || 'Ошибка при создании объявления', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchListing();
}, []); // Добавляем id в зависимости useEffect

const fetchListing = async () => {
    setLoading(true);
    try {
        const data = await getListing(id);
        if (data) {
            setListing(data);
            console.log(data);
            setError(null);
            setIsActive(data.is_active);
            setFormData(data);
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Создать новое объявление</h2>
      
      {message.text && (
        <div className={`${styles.alert} ${
          message.type === 'success' ? styles.alertSuccess : styles.alertError
        }`}>
          {message.text}
        </div>
      )}
      
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="title" className={`${styles.label} ${styles.labelRequired}`}>
            Заголовок
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={styles.input}
            maxLength="100"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="type" className={`${styles.label} ${styles.labelRequired}`}>
            Тип мебели
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className={styles.input}
            maxLength="100"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="year" className={`${styles.label} ${styles.labelRequired}`}>
            Год производства
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Описание
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className={`${styles.input} ${styles.textarea}`}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="price" className={`${styles.label} ${styles.labelRequired}`}>
            Цена (₽)
          </label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            className={styles.input}
            min="0"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="location" className={`${styles.label} ${styles.labelRequired}`}>
            Город
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="address" className={`${styles.label} ${styles.labelRequired}`}>
            Адрес
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={formData.address}
            onChange={handleInputChange}
            className={styles.input}
          />
        </div>

        

        

        

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.submitButton} ${
            loading ? styles.submitButtonDisabled : ''
          }`}
        >
          {loading ? 'Обновление...' : 'Изменить объявление'}
        </button>
        <button
          onClick={handleChange}
          disabled={loading}
          className={`${styles.submitButton} ${
            loading ? styles.submitButtonDisabled : ''
          }`}
        >
          {isActive ? 'Скрыть объявление' : 'Показать объявление'}
        </button>
      </div>
    </div>
  );
}