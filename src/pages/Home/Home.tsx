import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import CartPreview from '../../components/CartPreview/CartPreview';
import './Home.css';
//import logo from '../../assets/logo.svg'; // Cambia por tu logo real si lo tienes

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

const PRODUCTS_PER_PAGE = 9;

const Home = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ManufacturedItem[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/manufactured_item');
        setProducts(response.data);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError('Error al cargar los productos. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuOpen && profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleProductClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: ManufacturedItem) => {
    e.stopPropagation();
    addItem({ id_key: product.id_key, name: product.name, price: product.price });
  };

  // Calculate pagination values
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);

  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="home-container">
      <header className="home-header">
        <button onClick={() => navigate(-1)} className="back-button">
          <span className="back-arrow">←</span>
          Volver
        </button>
        <h1 className="home-title">El Buen Sabor</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="header-icons">
          <CartPreview />
          <div ref={profileRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="btn btn-outline-secondary rounded-circle header-icon"
              style={{ width: 40, height: 40, padding: 0 }}
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <i className="bi bi-person fs-4 text-dark"></i>
            </button>
            {userMenuOpen && (
              <div
                className="position-absolute end-0 mt-2 p-2 bg-white rounded shadow"
                style={{ minWidth: 160, zIndex: 2000 }}
              >
                <button
                  className="dropdown-item text-dark"
                  onClick={() => {
                    setUserMenuOpen(false);
                    navigate('/orders');
                  }}
                >
                  Mis Pedidos
                </button>
                <button
                  className="dropdown-item text-danger"
                  onClick={() => {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="products-grid">
        {loading ? (
          <div className="loading-message">Cargando productos...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : currentProducts.length === 0 ? (
          <div className="no-products-message">No hay productos disponibles</div>
        ) : (
          currentProducts.map(product => (
            <div 
              className="product-card" 
              key={product.id_key}
              onClick={() => handleProductClick(product.id_key)}
            >
              <img 
                src={product.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'} 
                alt={product.name} 
                className="product-image" 
              />
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <span className="product-price">${product.price}</span>
                <button 
                  className="add-button" 
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  Agregar al carrito
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!loading && !error && products.length > PRODUCTS_PER_PAGE && (
        <div className="pagination">
          <button 
            onClick={handlePrevPage} 
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default Home; 