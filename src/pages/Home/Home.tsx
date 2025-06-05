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

const PRODUCTS_PER_PAGE = 10;

const Home = () => {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [products, setProducts] = useState<ManufacturedItem[]>([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, itemsPerPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await api.get(`/manufactured_item/?offset=${offset}&limit=${itemsPerPage}`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        // New format with pagination
        setProducts(response.data.items);
        setTotalItems(response.data.total);
        setHasNext((response.data.offset + response.data.limit) < response.data.total);
      } else {
        // Old format - direct array (backward compatibility)
        console.warn('API returned old format, converting to new format');
        setProducts(response.data);
        setTotalItems(response.data.length);
        setHasNext(false);
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos. Por favor, intente nuevamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

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

  // Pagination functions
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

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
            placeholder="Buscar productos..."
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

      <div className="home-content">
        {/* Pagination Info and Controls */}
        <div className="products-pagination-header">
          <div className="products-count">
            <span>Mostrando {filteredProducts.length} de {totalItems} productos</span>
          </div>
          <div className="items-per-page">
            <label>Mostrar: </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="items-select"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={48}>48</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {loading ? (
            <div className="loading-message">Cargando productos...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-products-message">
              {search ? 'No se encontraron productos que coincidan con la búsqueda' : 'No hay productos disponibles'}
            </div>
          ) : (
            filteredProducts.map(product => (
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
                  <span className="product-price">${product.price.toFixed(2)}</span>
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

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="products-pagination">
            <div className="pagination-info">
              <span>
                Página {currentPage} de {totalPages} - Mostrando {products.length} de {totalItems} elementos
              </span>
            </div>
            <nav aria-label="Page navigation">
              <ul className="pagination">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button 
                    className="page-link" 
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </button>
                </li>
                
                {totalPages > 1 && (
                  <>
                    {currentPage > 2 && (
                      <>
                        <li className="page-item">
                          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                        </li>
                        {currentPage > 3 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                      </>
                    )}
                    
                    {currentPage > 1 && (
                      <li className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                          {currentPage - 1}
                        </button>
                      </li>
                    )}
                    
                    <li className="page-item active">
                      <span className="page-link">{currentPage}</span>
                    </li>
                    
                    {hasNext && (
                      <li className="page-item">
                        <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
                          {currentPage + 1}
                        </button>
                      </li>
                    )}
                    
                    {hasNext && currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                        <li className="page-item">
                          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
                            {totalPages}
                          </button>
                        </li>
                      </>
                    )}
                  </>
                )}
                
                {hasNext && (
                  <li className="page-item">
                    <button 
                      className="page-link" 
                      onClick={handleNextPage}
                    >
                      Siguiente
                    </button>
                  </li>
                )}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home; 