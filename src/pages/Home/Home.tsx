import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { authService } from '../../services/api';
import inventoryService from '../../services/inventoryService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import ClientLayout from '../../components/ClientLayout/ClientLayout';
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
  type?: 'manufactured';
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
  type?: 'inventory';
}

// Union type for all products
type Product = ManufacturedItem | InventoryItem;

const PRODUCTS_PER_PAGE = 10;

const Home = () => {
  const navigate = useNavigate();
  const { addItem, isAuthenticated } = useCart();
  const { refreshAuth } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Fixed items per page
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Check for token in URL on component mount
  useEffect(() => {
    const checkURLToken = async () => {
      try {
        const tokenFound = await authService.checkForTokenInURL();
        if (tokenFound) {
          // Refresh authentication state
          refreshAuth();
        }
      } catch (error) {
        console.error('Error checking URL token:', error);
      }
    };

    checkURLToken();
  }, [refreshAuth]);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Use the unified service instead of separate calls
      const response = await inventoryService.getAllProducts(offset, itemsPerPage);
      
      setProducts(response.data || []);
      setTotalItems(response.total || 0);
      setHasNext(response.hasNext || false);
      
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos. Por favor, intente nuevamente.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    if (!isAuthenticated) {
      return;
    }
    const productType = isManufacturedItem(product) ? 'manufactured' : 'inventory';
    navigate(`/product/${product.id_key}?type=${productType}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const productType = 'type' in product && product.type ? product.type : 
                       ('preparation_time' in product ? 'manufactured' : 'inventory');
    addItem({ id_key: product.id_key, name: product.name, price: product.price, type: productType });
  };

  // Pagination functions
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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

  // Helper function to check if product is manufactured
  const isManufacturedItem = (product: Product): product is ManufacturedItem => {
    return 'preparation_time' in product;
  };

  const getButtonText = (product: Product) => {
    if (!isAuthenticated) {
      return 'No disponible';
    }
    if (!isManufacturedItem(product) && product.current_stock <= 0) {
      return 'Sin stock';
    }
    return 'Agregar al carrito';
  };

  const isButtonDisabled = (product: Product) => {
    if (!isAuthenticated) {
      return true; // Deshabilitar botón cuando no está autenticado
    }
    return !isManufacturedItem(product) && product.current_stock <= 0;
  };

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <ClientLayout
      title="El Buen Sabor"
      showBackButton={false}
      showSearchBar={true}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Buscar productos..."
    >
      <div className="home-content">

        {/* Pagination Info */}
        <div className="products-pagination-header">
          <div className="products-count">
            <span>Mostrando {filteredProducts.length} de {totalItems} productos</span>
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
                //Si no esta logeado no se puede ver el detalle
                onClick={() => handleProductClick(product)}
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
                    disabled={isButtonDisabled(product)}
                  >
                    {getButtonText(product)}
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
    </ClientLayout>
  );
};

export default Home; 