import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './ProductDetail.css';

interface Category {
  name: string;
  description: string;
  active: boolean;
  id_key: number;
}

interface ManufacturedItem {
  name: string;
  description: string;
  preparation_time: number;
  price: number;
  image_url: string;
  recipe: string;
  active: boolean;
  category: Category;
  details: any[];
  id_key: number;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ManufacturedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/manufactured_item/${id}`);
        setProduct(response.data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Error al cargar el producto. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  if (loading) {
    return <div className="product-detail-loading">Cargando producto...</div>;
  }

  if (error || !product) {
    return (
      <div className="product-detail-error">
        {error || 'No se encontró el producto'}
        <button onClick={handleBack} className="back-button">Volver</button>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <header className="product-detail-header">
        <button onClick={handleBack} className="back-button">
          <span className="back-arrow">←</span>
          Volver
        </button>
        <h1>El Buen Sabor</h1>
      </header>

      <div className="product-detail-content">
        <div className="product-detail-image">
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'} 
            alt={product.name} 
          />
        </div>

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          <p className="product-detail-description">{product.description}</p>
          
          <div className="product-detail-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Categoría:</span>
              <span>{product.category.name}</span>
            </div>
            <div className="metadata-item">
              <span className="metadata-label">Tiempo de preparación:</span>
              <span>{product.preparation_time} minutos</span>
            </div>
          </div>

          <div className="product-detail-price">
            <span className="price-label">Precio:</span>
            <span className="price-value">${product.price}</span>
          </div>

          <div className="product-detail-actions">
            <div className="quantity-controls">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => handleQuantityChange(1)}>+</button>
            </div>
            <button className="add-to-cart-button">
              Agregar al carrito - ${(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 