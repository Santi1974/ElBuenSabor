import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../../services/api';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../hooks/useAuth';
import ClientLayout from '../../../components/ClientLayout/ClientLayout';
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

interface InventoryItem {
  name: string;
  description: string;
  price: number;
  image_url: string;
  active: boolean;
  current_stock: number;
  minimum_stock: number;
  purchase_cost: number;
  category: Category;
  id_key: number;
}

type Product = ManufacturedItem | InventoryItem;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  const productType = searchParams.get('type') || 'manufactured';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const endpoint = productType === 'inventory' 
          ? `/inventory_item/${id}` 
          : `/manufactured_item/${id}`;
        const response = await api.get(endpoint);
        setProduct(response.data);
      } catch (err: any) {
        console.error('Error fetching product:', err);
        setError('Error al cargar el producto. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, productType]);

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (product) {
      for (let i = 0; i < quantity; i++) {
        addItem({ id_key: product.id_key, name: product.name, price: product.price, type: productType as 'manufactured' | 'inventory' });
      }
      // Reset quantity after adding to cart
      setQuantity(1);
    }
  };

  // Helper function to check if product is manufactured
  const isManufacturedItem = (product: Product): product is ManufacturedItem => {
    return 'preparation_time' in product;
  };

  const isOutOfStock = product ? !isManufacturedItem(product) && ('current_stock' in product) && product.current_stock <= 0 : false;

  const getButtonText = () => {
    if (!isAuthenticated) {
      return 'No disponible';
    }
    if (isOutOfStock) {
      return 'Sin stock';
    }
    return `Agregar al carrito - $${(product!.price * quantity).toFixed(2)}`;
  };

  if (loading) {
    return (
      <ClientLayout title="El Buen Sabor" showSearchBar={false}>
        <div className="product-detail-loading">Cargando producto...</div>
      </ClientLayout>
    );
  }

  if (error || !product) {
    return (
      <ClientLayout title="El Buen Sabor" showSearchBar={false}>
      <div className="product-detail-error">
        {error || 'No se encontró el producto'}
      </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout title="El Buen Sabor" showSearchBar={false}>
      <div className="product-detail-content">
        <div className="product-detail-image">
          <img 
            src={product.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'} 
            alt={product.name} 
          />
        </div>

        <div className="product-detail-info">
          <h2>{product.name}</h2>
          {isManufacturedItem(product) && (
            <p className="product-detail-description">{product.description}</p>
          )}
          
          <div className="product-detail-metadata">
            <div className="metadata-item">
              <span className="metadata-label">Categoría: </span>
              <span>{product.category.name}</span>
            </div>
            {isManufacturedItem(product) && (
              <div className="metadata-item">
                <span className="metadata-label">Tiempo de preparación:</span>
                <span>{product.preparation_time} minutos</span>
              </div>
            )}
          </div>

          <div className="product-detail-price">
            <span className="price-label">Precio:</span>
            <span className="price-value">${product.price}</span>
          </div>

          {!isAuthenticated && (
            <div className="auth-notice">
              <i className="bi bi-info-circle me-2"></i>
              Inicia sesión para agregar productos al carrito y realizar pedidos
            </div>
          )}

          <div className="product-detail-actions">
            <div className="quantity-controls">
              <button 
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1 || !isAuthenticated}
                style={{padding: '0 10px'}}
              >
                -
              </button>
              <span>{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(1)}
                disabled={!isAuthenticated}
                style={{padding: '0 10px'}}
              >
                +
              </button>
            </div>
            <button 
              className="add-to-cart-button"
              onClick={handleAddToCart}
              disabled={isOutOfStock || !isAuthenticated}
            >
              {getButtonText()}
            </button>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ProductDetail; 