import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import inventoryService from '../../services/inventoryService';
import categoryService from '../../services/categoryService';
import promotionService from '../../services/promotionService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import ClientLayout from '../../components/ClientLayout/ClientLayout';
import { handleError, ERROR_MESSAGES } from '../../utils/errorHandler';
import type { ManufacturedItem, InventoryItem } from '../../types/product';
import type { Category } from '../../types/category';
import type { Promotion } from '../../services/promotionService';
import './Home.css';
//import logo from '../../assets/logo.svg'; // Cambia por tu logo real si lo tienes

// Union type for all products with extended properties
type Product = {
  id_key: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  type: 'manufactured' | 'inventory' | 'promotion';
  is_available?: boolean;
  current_stock?: number;
  category?: Category;
  discount_percentage?: number;
  active?: boolean;
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
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false);
  
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
      
      // Fetch products and promotions in parallel
      const [productsResponse, promotionsResponse] = await Promise.all([
        inventoryService.getAllProducts(offset, itemsPerPage),
        promotionService.getAll(0, 100) // Get active promotions
      ]);
      
      // Transform products
      const productsWithType = (productsResponse.data || []).map(product => ({
        ...product,
        type: (product as any).type || ('preparation_time' in product ? 'manufactured' : 'inventory') as 'manufactured' | 'inventory'
      }));
      
      // Helper function to calculate promotion price
      const calculatePromotionPrice = (promo: any): number => {
        let totalPrice = 0;
        
        // Calculate price from manufactured items
        if (promo.manufactured_item_details) {
          promo.manufactured_item_details.forEach((detail: any) => {
            const productPrice = detail.manufactured_item?.price || 0;
            totalPrice += productPrice * detail.quantity;
          });
        }
        
        // Calculate price from inventory items
        if (promo.inventory_item_details) {
          promo.inventory_item_details.forEach((detail: any) => {
            const productPrice = detail.inventory_item?.price || 0;
            totalPrice += productPrice * detail.quantity;
          });
        }
        
        // Apply discount
        const discountAmount = totalPrice * (promo.discount_percentage / 100);
        return Math.max(0, totalPrice - discountAmount);
      };

      // Transform active promotions to look like products
      const activePromotions = (promotionsResponse.data || [])
        .filter(promo => promo.active && promo.id_key)
        .map(promo => ({
          id_key: promo.id_key!,
          name: promo.name,
          description: promo.description,
          price: calculatePromotionPrice(promo),
          image_url: 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=400&q=80',
          type: 'promotion' as const,
          is_available: promo.is_available,
          discount_percentage: promo.discount_percentage,
          active: promo.active
        }));
      
      // Combine products and promotions
      const allItems = [...productsWithType, ...activePromotions];
      
      setProducts(allItems);
      setTotalItems(productsResponse.total + activePromotions.length);
      setHasNext(productsResponse.hasNext);
      
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
    if(isPromotion(product)){
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

    const productType = product.type || ('preparation_time' in product ? 'manufactured' : 'inventory');
    const productPrice = 'price' in product ? product.price || 0 : 0;
    const discountPercentage = 'discount_percentage' in product ? product.discount_percentage : undefined;
    
    addItem({ 
      id_key: product.id_key, 
      name: product.name || 'Producto sin nombre', 
      price: productPrice, 
      type: productType,
      discount_percentage: discountPercentage
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

  // Helper functions to check product types
  const isManufacturedItem = (product: Product): boolean => {
    return product.type === 'manufactured';
  };

  const isInventoryProduct = (product: Product): boolean => {
    return product.type === 'inventory' && product.current_stock !== undefined;
  };

  const isPromotion = (product: Product): boolean => {
    return product.type === 'promotion';
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
    if (isInventoryProduct(product) && (product.current_stock ?? 0) <= 0) {
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
    return isInventoryProduct(product) && (product.current_stock ?? 0) <= 0;
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
      
      if (showPromotionsOnly) {
        return matchesSearch && isPromotion(product);
      }
      
      const matchesCategory = selectedCategoryId === null || 
        isPromotion(product) ||
        product?.category?.id_key === selectedCategoryId;
      
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.warn('Error filtering product:', error, product);
      return false; // Exclude problematic products from results
    }
  });

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setShowPromotionsOnly(false); // Reset promotions filter when selecting category
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const handlePromotionsFilter = () => {
    setShowPromotionsOnly(!showPromotionsOnly);
    setSelectedCategoryId(null); // Reset category filter when selecting promotions
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
                className={`category-btn ${selectedCategoryId === null && !showPromotionsOnly ? 'active' : ''}`}
                onClick={() => handleCategoryChange(null)}
              >
                Todas las categorías
              </button>
              <button
                className={`category-btn ${showPromotionsOnly ? 'active' : ''}`}
                onClick={handlePromotionsFilter}
                style={{ 
                  backgroundColor: showPromotionsOnly ? '#28a745' : '', 
                  color: showPromotionsOnly ? 'white' : '',
                  borderColor: showPromotionsOnly ? '#28a745' : ''
                }}
              >
                <i className="bi bi-tag-fill me-2"></i>
                Promociones
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
              const productPrice = product?.price || 0;
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
                    {isPromotion(product) ? (
                      <div>
                        <span className="product-price">${productPrice.toFixed(2)}</span>
                        <div className="text-success fw-bold">
                          <i className="bi bi-tag-fill me-1"></i>
                          {product.is_available === false ? 'No disponible' : `${product.discount_percentage}% OFF`}
                        </div>
                      </div>
                    ) : (
                      <span className="product-price">${productPrice.toFixed(2)}</span>
                    )}
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