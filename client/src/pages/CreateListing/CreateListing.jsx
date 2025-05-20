import { useState } from 'react';
import { createListing } from "../../js/api";
import styles from './CreateListing.module.css';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    location: '',
    year: '',
    type: '',
    address: '',
  });
  const [images, setImages] = useState([]);
  const [preview, setPreview] = useState([]);
  const [modelFile, setModelFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
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
      
      const result = await createListing(formData, images, modelFile);
      
      setFormData({
        title: '',
        description: '',
        price: '',
        location: '',
        year: '',
        type: '',
        address: '',
      });
      setImages([]);
      setPreview([]);
      setModelFile(null);
      
      setMessage({ 
        text: 'Объявление успешно создано!', 
        type: 'success' 
      });
    } catch (error) {
      setMessage({ 
        text: error.message || 'Ошибка при создании объявления', 
        type: 'error' 
      });
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

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Фотографии (максимум 5)
          </label>
          <input
            type="file"
            id="images"
            name="images"
            onChange={handleImageChange}
            className={`${styles.input} ${styles.fileInput}`}
            accept="image/*"
            multiple
          />
        </div>

        {preview.length > 0 && (
          <div className={styles.previewGrid}>
            {preview.map((src, index) => (
              <div key={index} className="relative">
                <img 
                  src={src} 
                  alt={`Preview ${index}`} 
                  className={styles.previewImage} 
                />
                {index === 0 && (
                  <span className={styles.primaryBadge}>
                    Главное
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className={styles.modelUpload}>
          <label htmlFor="model" className={styles.modelUploadLabel}>
            3D-модель мебели (GLB формат)
          </label>
          <input
            type="file"
            id="model"
            name="model"
            onChange={handleModelChange}
            className={`${styles.input} ${styles.fileInput}`}
            accept=".glb"
          />
          <p className={styles.modelUploadHint}>
            Необязательное поле. Загрузите файл в формате .glb для 3D-просмотра мебели
          </p>
          {modelFile && (
            <p className={styles.modelUploadHint}>
              Выбран файл: {modelFile.name}
            </p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`${styles.submitButton} ${
            loading ? styles.submitButtonDisabled : ''
          }`}
        >
          {loading ? 'Создание...' : 'Создать объявление'}
        </button>
      </div>
    </div>
  );
}