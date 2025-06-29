import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import inventoryService from '../../services/inventoryService';
import categoryService from '../../services/categoryService';
import promotionService from '../../services/promotionService';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../hooks/useAuth';
import ClientLayout from '../../components/ClientLayout/ClientLayout';
import { handleError } from '../../utils/errorHandler';
import type { Category } from '../../types/category';
import type { Promotion } from '../../services/promotionService';
import './Home.css';
//import logo from '../../assets/logo.svg'; // Cambia por tu logo real si lo tienes

// Tipo de producto extendido para unificar manufactured items, inventory items y promociones
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
  
  // Estados de filtros de categorías
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showPromotionsOnly, setShowPromotionsOnly] = useState(false);
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);
  
  // Estados de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Aumentamos a 12 para mejor grid responsivo
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  // Verificar token en URL al montar el componente
  useEffect(() => {
    const checkURLToken = async () => {
      try {
        const tokenFound = await authService.checkForTokenInURL();
        if (tokenFound) {
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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Obtener productos y promociones en paralelo
      const [productsResponse, promotionsResponse] = await Promise.all([
        inventoryService.getAllProducts(0, 100),
        promotionService.getAll(0, 100)
      ]);
      
      // Transformar productos
      const productsWithType = (productsResponse.data || []).map(product => ({
        ...product,
        type: (product as any).type || ('preparation_time' in product ? 'manufactured' : 'inventory') as 'manufactured' | 'inventory'
      }));
      
      // Calcular precio de promoción
      const calculatePromotionPrice = (promo: any): number => {
        let totalPrice = 0;
        
        if (promo.manufactured_item_details) {
          promo.manufactured_item_details.forEach((detail: any) => {
            const productPrice = detail.manufactured_item?.price || 0;
            totalPrice += productPrice * detail.quantity;
          });
        }
        
        if (promo.inventory_item_details) {
          promo.inventory_item_details.forEach((detail: any) => {
            const productPrice = detail.inventory_item?.price || 0;
            totalPrice += productPrice * detail.quantity;
          });
        }
        
        const discountAmount = totalPrice * (promo.discount_percentage / 100);
        return Math.max(0, totalPrice - discountAmount);
      };

      // Transformar promociones activas
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
      
      const allItems = [...productsWithType, ...activePromotions];
      
      setProducts(allItems);
      setTotalItems(productsResponse.total + activePromotions.length);
      setHasNext(false);
      
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
      const publicSubcategories = await categoryService.getPublicSubcategories();
      
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
    if (!product?.id_key || !isAuthenticated || isPromotion(product)) {
      return;
    }
    if (isInventoryProduct(product) && (product.current_stock ?? 0) <= 0) {
      return;
    }
    const productType = isManufacturedItem(product) ? 'manufactured' : 'inventory';
    navigate(`/product/${product.id_key}?type=${productType}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    
    if (!product?.id_key) {
      console.warn('Invalid product for cart:', product);
      return;
    }
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const productType = product.type || ('preparation_time' in product ? 'manufactured' : 'inventory');
    const productPrice = product.price || 0;
    const discountPercentage = product.discount_percentage;
    
    addItem({ 
      id_key: product.id_key, 
      name: product.name || 'Producto sin nombre', 
      price: productPrice, 
      type: productType,
      discount_percentage: discountPercentage
    });
  };

  // Funciones de paginación
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

  // Funciones auxiliares para verificar tipos de producto
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
    if (!product || !isAuthenticated) {
      return 'No disponible';
    }
    
    if (product.is_available === false) {
      return 'Sin stock';
    }
    
    if (isInventoryProduct(product) && (product.current_stock ?? 0) <= 0) {
      return 'Sin stock';
    }
    
    return 'Agregar al carrito';
  };

  const isButtonDisabled = (product: Product) => {
    if (!product || !isAuthenticated || product.is_available === false) {
      return true;
    }
    
    return isInventoryProduct(product) && (product.current_stock ?? 0) <= 0;
  };

  // Filtrar productos según búsqueda y categoría seleccionada
  const filteredProducts = products.filter(product => {
    try {
      const name = product?.name || '';
      const description = product?.description || '';
      const searchTerm = search.toLowerCase();
      
      const matchesSearch = name.toLowerCase().includes(searchTerm) ||
             description.toLowerCase().includes(searchTerm);
             
      if (showPromotionsOnly) {
        return matchesSearch && isPromotion(product);
      }
      
      const matchesCategory = selectedCategoryId === null || 
        (!isPromotion(product) && product?.category?.id_key === selectedCategoryId);
      
      return matchesSearch && matchesCategory;
    } catch (error) {
      console.warn('Error filtering product:', error, product);
      return false;
    }
  });

  // Agrupar productos por categoría padre
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    let groupName = 'Promociones'; 
    
    if (!isPromotion(product) && product?.category?.id_key) {
      const categoryWithParent = categories.find(cat => cat.id_key === product.category!.id_key);
      
      if (categoryWithParent && categoryWithParent.parent?.name) {
        groupName = categoryWithParent.parent.name;
      } else {
        groupName = 'Otros'; 
      }
    } else if (!isPromotion(product)) {
      groupName = 'Otros'; 
    }
    
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(product);
    
    return groups;
  }, {} as Record<string, Product[]>);

  const sortedGroupNames = Object.keys(groupedProducts).sort();

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategoryId(categoryId);
    setShowPromotionsOnly(false);
    setCurrentPage(1);
  };

  const handlePromotionsFilter = () => {
    setShowPromotionsOnly(!showPromotionsOnly);
    setSelectedCategoryId(null);
    setCurrentPage(1);
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
      <div className="container-fluid px-3 px-md-4 main-content-fade">
        {/* Header con información de productos */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center bg-light rounded p-3 shadow-sm">
              <div>
                <h5 className="mb-1 text-primary">
                  <i className="bi bi-shop me-2"></i>
                  Bienvenido a El Buen Sabor
                </h5>
                <small className="text-muted">
                  Mostrando {filteredProducts.length} de {totalItems} productos
                </small>
              </div>
              <div className="d-none d-md-block">
                <span className="badge fs-6" style={{backgroundColor: '#d87d4d'}}>
                  Página {currentPage} de {currentPage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros de categoría */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm">
              <div className="card-header bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0 text-secondary">
                    <i className="bi bi-funnel me-2"></i>
                    Filtrar por Categoría
                  </h6>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                    aria-expanded={!filtersCollapsed}
                    aria-controls="filtersCollapse"
                  >
                    <i className={`bi bi-chevron-${filtersCollapsed ? 'down' : 'up'}`}></i>
                    <span className="d-none d-sm-inline ms-1">
                      {filtersCollapsed ? 'Mostrar' : 'Ocultar'}
                    </span>
                  </button>
                </div>
              </div>
              <div 
                className={`collapse ${!filtersCollapsed ? 'show' : ''}`} 
                id="filtersCollapse"
              >
                <div className="card-body">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      className={`btn ${selectedCategoryId === null && !showPromotionsOnly 
                        ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                      onClick={() => handleCategoryChange(null)}
                    >
                      <i className="bi bi-grid me-1"></i>
                      Todas
                    </button>
                    
                    <button
                      className={`btn ${showPromotionsOnly 
                        ? 'btn-success' : 'btn-outline-success'} btn-sm`}
                      onClick={handlePromotionsFilter}
                    >
                      <i className="bi bi-tag-fill me-1"></i>
                      Promociones
                    </button>
                    
                    {categoriesLoading ? (
                      <div className="spinner-border spinner-border-sm text-primary" role="status">
                        <span className="visually-hidden">Cargando...</span>
                      </div>
                    ) : (
                      categories.map(category => (
                        <button
                          key={category.id_key}
                          className={`btn ${selectedCategoryId === category.id_key 
                            ? 'btn-info' : 'btn-outline-info'} btn-sm`}
                          onClick={() => handleCategoryChange(category.id_key)}
                        >
                          {category.name}
                        </button>
                      ))
                    )}
                  </div>
                  
                  {!categoriesLoading && categories.length === 0 && (
                    <div className="text-muted small mt-2">
                      <i className="bi bi-info-circle me-1"></i>
                      No hay categorías disponibles
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenedor de productos */}
        <div className="row">
          <div className="col-12">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Cargando productos...</span>
                </div>
                <p className="mt-3 text-muted">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search display-1 text-muted"></i>
                <h4 className="mt-3 text-muted">
                  {search ? 'No se encontraron productos' : 'No hay productos disponibles'}
                </h4>
                <p className="text-muted">
                  {search ? 'Intenta con otros términos de búsqueda' : 'Vuelve más tarde'}
                </p>
              </div>
            ) : (
              // Secciones de productos agrupados por categoría
              sortedGroupNames.map(groupName => (
                <div key={groupName} className="mb-5">
                  <div className="row mb-3">
                    <div className="col-12">
                      <h5 className="text-dark border-bottom pb-2 mb-4">
                        <i className={`bi ${isPromotion(groupedProducts[groupName][0]) 
                          ? 'bi-tag-fill text-success' 
                          : 'bi-collection text-primary'} me-2`}></i>
                        {groupName}
                      </h5>
                    </div>
                  </div>
                  
                  <div className="row g-3">
                    {groupedProducts[groupName].map(product => {
                      const productName = product?.name || 'Producto sin nombre';
                      const productDescription = product?.description || 'Sin descripción';
                      const productPrice = product?.price || 0;
                      const productImageUrl = product?.image_url || 
                        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';

                      return (
                        <div key={product?.id_key || Math.random()} className="col-12 col-sm-6 col-lg-4 col-xl-3">
                          <div 
                            className={`card h-100 shadow-sm border-0 ${isAuthenticated && !isPromotion(product) ? 'product-card-clickable' : ''}`}
                            onClick={() => handleProductClick(product)}
                            style={{ 
                              cursor: isAuthenticated && !isPromotion(product) ? 'pointer' : 'default',
                              transition: 'all 0.2s ease-in-out'
                            }}
                            onMouseEnter={(e) => {
                              if (isAuthenticated && !isPromotion(product)) {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.classList.add('shadow');
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (isAuthenticated && !isPromotion(product)) {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.classList.remove('shadow');
                              }
                            }}
                          >
                            <div className="position-relative">
                              <img 
                                src={productImageUrl} 
                                alt={productName} 
                                className="card-img-top"
                                style={{ height: '200px', objectFit: 'cover' }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = 
                                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
                                }}
                              />
                              {isPromotion(product) && (
                                <span className="position-absolute top-0 end-0 badge bg-success m-2 discount-badge">
                                  <i className="bi bi-tag-fill me-1"></i>
                                  {product.discount_percentage}% OFF
                                </span>
                              )}
                              {product.is_available === false && (
                                <span className="position-absolute top-0 start-0 badge bg-danger m-2 stock-badge">
                                  Sin stock
                                </span>
                              )}
                            </div>
                            
                            <div className="card-body d-flex flex-column">
                              <h6 className="card-title text-truncate" title={productName}>
                                {productName}
                              </h6>
                              {isPromotion(product) && (
                                <p className="card-text text-muted small flex-grow-1" 
                                   style={{ 
                                     display: '-webkit-box',
                                     WebkitLineClamp: 2,
                                     WebkitBoxOrient: 'vertical',
                                     overflow: 'hidden',
                                     height: '60px'
                                   }}>
                                  {productDescription}
                                </p>
                              )}
                              {!isPromotion(product) && (
                              <p className="card-text text-muted small flex-grow-1" 
                                 style={{ 
                                   display: '-webkit-box',
                                   WebkitLineClamp: 2,
                                   WebkitBoxOrient: 'vertical',
                                   overflow: 'hidden'
                                 }}>
                                {productDescription}
                              </p>
                              )}
                              
                              <div className="mt-auto">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h5 className="text-primary mb-0">
                                    ${productPrice.toFixed(2)}
                                  </h5>
                                  {isPromotion(product) && product.is_available !== false && (
                                    <small className="text-success fw-bold">
                                      <i className="bi bi-tag-fill me-1"></i>
                                      ¡Oferta!
                                    </small>
                                  )}
                                </div>
                                
                                <button 
                                  className={`btn w-100 ${isButtonDisabled(product) 
                                    ? 'btn-outline-secondary' 
                                    : 'btn-primary'}`}
                                  onClick={(e) => handleAddToCart(e, product)}
                                  disabled={isButtonDisabled(product)}
                                >
                                  <i className={`bi ${isButtonDisabled(product) 
                                    ? 'bi-x-circle' 
                                    : 'bi-cart-plus'} me-1`}></i>
                                  {getButtonText(product)}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Controles de paginación */}
        {totalItems > 0 && (
          <div className="row mt-5">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center">
                    <div className="mb-3 mb-md-0">
                      <small className="text-muted">
                        Página {currentPage} de {currentPage} - 
                        Mostrando {filteredProducts.length} de {totalItems} elementos
                      </small>
                    </div>
                    
                    <nav aria-label="Navegación de páginas">
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i>
                            <span className="d-none d-sm-inline ms-1">Anterior</span>
                          </button>
                        </li>
                        
                        {totalPages > 1 && (
                          <>
                            {currentPage > 2 && (
                              <>
                                <li className="page-item">
                                  <button className="page-link" onClick={() => handlePageChange(1)}>
                                    1
                                  </button>
                                </li>
                                {currentPage > 3 && (
                                  <li className="page-item disabled">
                                    <span className="page-link">...</span>
                                  </li>
                                )}
                              </>
                            )}
                            
                            {currentPage > 1 && (
                              <li className="page-item">
                                <button 
                                  className="page-link" 
                                  onClick={() => handlePageChange(currentPage - 1)}
                                >
                                  {currentPage - 1}
                                </button>
                              </li>
                            )}
                            
                            <li className="page-item active">
                              <span className="page-link">{currentPage}</span>
                            </li>
                            
                            {hasNext && (
                              <li className="page-item">
                                <button 
                                  className="page-link" 
                                  onClick={() => handlePageChange(currentPage + 1)}
                                >
                                  {currentPage + 1}
                                </button>
                              </li>
                            )}
                            
                            {hasNext && currentPage < totalPages - 1 && (
                              <>
                                {currentPage < totalPages - 2 && (
                                  <li className="page-item disabled">
                                    <span className="page-link">...</span>
                                  </li>
                                )}
                                <li className="page-item">
                                  <button 
                                    className="page-link" 
                                    onClick={() => handlePageChange(totalPages)}
                                  >
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
                              <span className="d-none d-sm-inline me-1">Siguiente</span>
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </li>
                        )}
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
};

export default Home; 