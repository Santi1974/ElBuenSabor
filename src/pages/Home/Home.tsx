import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import inventoryService from '../../services/inventoryService';
import categoryService from '../../services/categoryService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import ClientLayout from '../../components/ClientLayout/ClientLayout';
import { handleError, ERROR_MESSAGES } from '../../utils/errorHandler';
import type { ManufacturedItem, InventoryItem } from '../../types/product';
import type { Category } from '../../types/category';
import './Home.css';
//import logo from '../../assets/logo.svg'; // Cambia por tu logo real si lo tienes

// Union type for all products with extended properties
type Product = (ManufacturedItem | InventoryItem) & { 
  type?: 'manufactured' | 'inventory';
  is_available?: boolean;
};



const Home = () => {
  const navigate = useNavigate();
  const { addItem, isAuthenticated } = useCart();
  const { refreshAuth } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Categories filter states
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  
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

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

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
      setError(handleError(err, 'load products'));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      
      // Get all public subcategories using the new endpoint
      const publicSubcategories = await categoryService.getPublicSubcategories();
      
      // Ensure we always have an array
      if (Array.isArray(publicSubcategories)) {
        setCategories(publicSubcategories);
      } else {
        console.warn('Public subcategories is not an array:', publicSubcategories);
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching public subcategories:', err);
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const handleProductClick = (product: Product) => {
    if (!product || !product.id_key) {
      console.warn('Invalid product clicked:', product);
      return;
    }
    if (!isAuthenticated) {
      return;
    }
    const productType = isManufacturedItem(product) ? 'manufactured' : 'inventory';
    navigate(`/product/${product.id_key}?type=${productType}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!product || !product.id_key) {
      console.warn('Invalid product for cart:', product);
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const productType = 'type' in product && product.type ? product.type : 
                       ('preparation_time' in product ? 'manufactured' : 'inventory');
    addItem({ 
      id_key: product.id_key, 
      name: product.name || 'Producto sin nombre', 
      price: product.price || 0, 
      type: productType 
    });
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
    if (!product) {
      return 'No disponible';
    }
    if (!isAuthenticated) {
      return 'No disponible';
    }
    // Verificar si el producto está marcado como no disponible
    if (product.is_available === false) {
      return 'Sin stock';
    }
    if (!isManufacturedItem(product) && (product.current_stock ?? 0) <= 0) {
      return 'Sin stock';
    }
    return 'Agregar al carrito';
  };

  const isButtonDisabled = (product: Product) => {
    if (!product) {
      return true; // Deshabilitar botón cuando el producto es nulo
    }
    if (!isAuthenticated) {
      return true; // Deshabilitar botón cuando no está autenticado
    }
    // Verificar si el producto está marcado como no disponible
    if (product.is_available === false) {
      return true;
    }
    return !isManufacturedItem(product) && (product.current_stock ?? 0) <= 0;
  };

  // Filter products based on search term and selected category
  const filteredProducts = products.filter(product => {
    try {
      // Safely access properties with null/undefined checks
      const name = product?.name || '';
      const description = product?.description || '';
      const searchTerm = search.toLowerCase();
      
      // Search filter
      const matchesSearch = name.toLowerCase().includes(searchTerm) ||
             description.toLowerCase().includes(searchTerm);
      
      // Category filter
      const matchesCategory = selectedCategoryId === null || 
                             product?.category?.id_key === selectedCategoryId;
      
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.warn('Error filtering product:', error, product);
      return false; // Exclude problematic products from results
    }
  });

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setCurrentPage(1); // Reset to first page when filter changes
  };

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

        {/* Category Filters */}
        <div className="category-filters">
          <div className="filter-section">
            <h5 className="filter-title">
              <i className="bi bi-funnel me-2"></i>
              Filtrar por Categoría
            </h5>
            <div className="category-buttons">
              <button
                className={`category-btn ${selectedCategoryId === null ? 'active' : ''}`}
                onClick={() => handleCategoryChange(null)}
              >
                Todas las categorías
              </button>
              {categoriesLoading ? (
                <div className="categories-loading">Cargando categorías...</div>
              ) : (
                Array.isArray(categories) && categories.length > 0 ? (
                  categories.map(category => (
                    <button
                      key={category.id_key}
                      className={`category-btn ${selectedCategoryId === category.id_key ? 'active' : ''}`}
                      onClick={() => handleCategoryChange(category.id_key)}
                    >
                      {category.name}
                    </button>
                  ))
                ) : (
                  <div className="no-categories">No hay categorías disponibles</div>
                )
              )}
            </div>
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
            filteredProducts.map(product => {
              // Safe rendering with null checks
              const productName = product?.name || 'Producto sin nombre';
              const productDescription = product?.description || 'Sin descripción';
              const productPrice = typeof product?.price === 'number' ? product.price : 0;
              const productImageUrl = product?.image_url || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
              
              return (
                <div 
                  className="product-card" 
                  key={product?.id_key || Math.random()}
                  //Si no esta logeado no se puede ver el detalle
                  onClick={() => handleProductClick(product)}
                >
                  <img 
                    src={productImageUrl} 
                    alt={productName} 
                    className="product-image" 
                    onError={(e) => {
                      // Fallback if image fails to load
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <div className="product-info">
                    <h3 className="product-title">{productName}</h3>
                    <p className="product-description">{productDescription}</p>
                    <span className="product-price">${productPrice.toFixed(2)}</span>
                    <button 
                      className="add-button"
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={isButtonDisabled(product)}
                    >
                      {getButtonText(product)}
                    </button>
                  </div>
                </div>
              );
            })
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