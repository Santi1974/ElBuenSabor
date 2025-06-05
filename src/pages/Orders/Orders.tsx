import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import CartPreview from '../../components/CartPreview/CartPreview';
import './Orders.css';

interface OrderDetail {
  id_key: number;
  quantity: number;
  subtotal: number;
  manufactured_item: {
    id_key: number;
    name: string;
    price: number;
  };
}

interface Address {
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality: {
    name: string;
    province_id: number;
    id_key: number;
  };
  id_key: number;
  user_id: number;
}

interface User {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub: string;
  active: boolean;
  id_key: number;
  addresses: Address[];
}

interface Order {
  date: string;
  total: number;
  discount: number;
  final_total: number;
  status: string;
  estimated_time: number;
  delivery_method: string;
  payment_method: string;
  payment_id: string;
  is_paid: boolean;
  notes: string;
  user: User;
  address: Address | null;
  details: OrderDetail[];
  id_key: number;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  
  const [statusFilters, setStatusFilters] = useState({
    a_confirmar: false,
    en_preparacion: false,
    en_delivery: false,
    entregado: false,
    cancelado: false
  });
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await api.get(`/order/user/token?offset=${offset}&limit=${itemsPerPage}`);
      
      // Handle both old and new response formats
      if (response.data && response.data.items !== undefined) {
        // New format with pagination
        setOrders(response.data.items);
        setTotalItems(response.data.total);
        setHasNext((response.data.offset + response.data.limit) < response.data.total);
      } else {
        // Old format - direct array (backward compatibility)
        console.warn('API returned old format, converting to new format');
        setOrders(response.data);
        setTotalItems(response.data.length);
        setHasNext(false);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Error al cargar los pedidos. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleFilterChange = (filterName: string) => {
    setStatusFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Filter orders based on search term and status filters
  const filteredOrders = orders.filter(order => {
    // First filter by search term
    const matchesSearch = 
      order.id_key.toString().includes(searchTerm) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_method.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;
    
    // Then filter by status if any filter is active
    const anyFilterActive = Object.values(statusFilters).some(value => value);
    
    if (!anyFilterActive) return true;
    
    if (statusFilters.a_confirmar && order.status.toLowerCase() === 'a_confirmar') return true;
    if (statusFilters.en_preparacion && order.status.toLowerCase() === 'en_preparacion') return true;
    if (statusFilters.en_delivery && order.status.toLowerCase() === 'en_delivery') return true;
    if (statusFilters.entregado && order.status.toLowerCase() === 'entregado') return true;
    if (statusFilters.cancelado && order.status.toLowerCase() === 'cancelado') return true;
    
    return false;
  });

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Translate status to Spanish
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'a_confirmar':
        return 'A confirmar';
      case 'en_preparacion':
        return 'En preparación';
      case 'en_delivery':
        return 'En camino';
      case 'entregado':
        return 'Entregado';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  // Translate delivery method to Spanish
  const translateDeliveryMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'delivery':
        return 'Envío a domicilio';
      case 'pickup':
        return 'Retiro en local';
      default:
        return method;
    }
  };

  // Translate payment method to Spanish
  const translatePaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'cash':
        return 'Efectivo';
      case 'mercado_pago':
        return 'Mercado Pago';
      default:
        return method;
    }
  };

  // Get status class for styling
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'status-delivered';
      case 'en_preparacion':
        return 'status-preparing';
      case 'en_delivery':
        return 'status-on-way';
      case 'a_confirmar':
        return 'status-pending';
      case 'cancelado':
        return 'status-cancelled';
      default:
        return '';
    }
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

  return (
    <div className="orders-container">
      <header className="orders-header">
        <button onClick={handleGoBack} className="back-button">
          <span className="back-arrow">←</span>
          Volver
        </button>
        <h1 className="orders-title">Mis Pedidos</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Buscar"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="header-icons">
          <CartPreview />
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              className="btn btn-outline-secondary rounded-circle header-icon"
              style={{ width: 40, height: 40, padding: 0, background: 'transparent', border: '1px solid white' }}
              onClick={() => setUserMenuOpen((open) => !open)}
            >
              <i className="bi bi-person fs-4 text-white"></i>
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

      <div className="orders-content">
        <div className="filters-section">
          <h3>Filtros</h3>
          <div className="filter-options">
            <div className="filter-option">
              <input 
                type="checkbox" 
                id="pending" 
                checked={statusFilters.a_confirmar}
                onChange={() => handleFilterChange('a_confirmar')}
              />
              <label htmlFor="pending">A confirmar</label>
            </div>
            <div className="filter-option">
              <input 
                type="checkbox" 
                id="preparing" 
                checked={statusFilters.en_preparacion}
                onChange={() => handleFilterChange('en_preparacion')}
              />
              <label htmlFor="preparing">En preparación</label>
            </div>
            <div className="filter-option">
              <input 
                type="checkbox" 
                id="on-way" 
                checked={statusFilters.en_delivery}
                onChange={() => handleFilterChange('en_delivery')}
              />
              <label htmlFor="on-way">En camino</label>
            </div>
            <div className="filter-option">
              <input 
                type="checkbox" 
                id="delivered" 
                checked={statusFilters.entregado}
                onChange={() => handleFilterChange('entregado')}
              />
              <label htmlFor="delivered">Entregado</label>
            </div>
            <div className="filter-option">
              <input 
                type="checkbox" 
                id="cancelled" 
                checked={statusFilters.cancelado}
                onChange={() => handleFilterChange('cancelado')}
              />
              <label htmlFor="cancelled">Cancelado</label>
            </div>
          </div>
        </div>

        {/* Pagination Info and Controls */}
        <div className="orders-pagination-header">
          <div className="orders-count">
            <span>Mostrando {orders.length} de {totalItems} pedidos</span>
          </div>
          <div className="items-per-page">
            <label>Mostrar: </label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
              className="items-select"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        <div className="orders-list">
          {loading ? (
            <div className="loading-message">Cargando pedidos...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : filteredOrders.length === 0 ? (
            <div className="no-orders-message">No se encontraron pedidos</div>
          ) : (
            filteredOrders.map(order => (
              <div 
                key={order.id_key} 
                className="order-card"
                onClick={() => handleOrderClick(order)}
              >
                <div className="order-header">
                  <div className="order-id">Pedido #{order.id_key}</div>
                  <div className={`order-status ${getStatusClass(order.status)}`}>
                    {translateStatus(order.status)}
                  </div>
                </div>
                <div className="order-details">
                  <div className="order-date">
                    <strong>Fecha:</strong> {formatDate(order.date)}
                  </div>
                  <div className="order-payment">
                    <strong>Método de pago:</strong> {translatePaymentMethod(order.payment_method)}
                  </div>
                  <div className="order-total">
                    <strong>Total:</strong> ${order.final_total.toFixed(2)}
                  </div>
                </div>
                {order.details && order.details.length > 0 ? (
                  <div className="order-items">
                    <h4>Productos:</h4>
                    <ul>
                      {order.details.map((detail, index) => (
                        <li key={index} className="order-item">
                          <span className="item-name">{detail.manufactured_item?.name || 'Producto'}</span>
                          <span className="item-quantity">x{detail.quantity}</span>
                          <span className="item-price">${detail.subtotal.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="order-items">
                    <p>No hay productos en este pedido</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="orders-pagination">
            <div className="pagination-info">
              <span>
                Página {currentPage} de {totalPages} - Mostrando {orders.length} de {totalItems} elementos
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

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <>
          <div className="modal-backdrop show"></div>
          <div className="modal d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Detalle del Pedido #{selectedOrder.id_key}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDetailModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="order-detail-header mb-4">
                    <div className={`order-status-badge ${getStatusClass(selectedOrder.status)}`}>
                      {translateStatus(selectedOrder.status)}
                    </div>
                    <div className="order-date-badge">
                      {formatDate(selectedOrder.date)}
                    </div>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">Información General</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Fecha:</strong> {formatDate(selectedOrder.date)}</p>
                          <p>
                            <strong>Estado:</strong> 
                            <span className={`badge ${getStatusClass(selectedOrder.status)}-badge ms-2`}>
                              {translateStatus(selectedOrder.status)}
                            </span>
                          </p>
                          <p><strong>Método de entrega:</strong> {translateDeliveryMethod(selectedOrder.delivery_method)}</p>
                          <p><strong>Tiempo estimado:</strong> {selectedOrder.estimated_time} minutos</p>
                          <p><strong>Notas:</strong> {selectedOrder.notes || 'Sin notas'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h5 className="card-title mb-0">Información de Pago</h5>
                        </div>
                        <div className="card-body">
                          <p><strong>Método de pago:</strong> {translatePaymentMethod(selectedOrder.payment_method)}</p>
                          <p><strong>Estado de pago:</strong> {selectedOrder.is_paid ? 'Pagado' : 'Pendiente'}</p>
                          <p><strong>Subtotal:</strong> ${selectedOrder.total.toFixed(2)}</p>
                          <p><strong>Descuento:</strong> ${selectedOrder.discount.toFixed(2)}</p>
                          <p className="fw-bold"><strong>Total final:</strong> ${selectedOrder.final_total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.delivery_method === 'delivery' && selectedOrder.address && (
                    <div className="card mb-4">
                      <div className="card-header">
                        <h5 className="card-title mb-0">Dirección de Entrega</h5>
                      </div>
                      <div className="card-body">
                        <p><strong>Calle:</strong> {selectedOrder.address.street}</p>
                        <p><strong>Número:</strong> {selectedOrder.address.street_number}</p>
                        <p><strong>Código Postal:</strong> {selectedOrder.address.zip_code}</p>
                        <p><strong>Nombre/Referencia:</strong> {selectedOrder.address.name}</p>
                        {selectedOrder.address.locality && (
                          <p><strong>Localidad:</strong> {selectedOrder.address.locality.name}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title mb-0">Productos</h5>
                    </div>
                    <div className="card-body p-0">
                      <div className="table-responsive">
                        <table className="table table-hover mb-0">
                          <thead className="table-light">
                            <tr>
                              <th>Producto</th>
                              <th className="text-center">Cantidad</th>
                              <th className="text-center">Precio Unitario</th>
                              <th className="text-end">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.details.length > 0 ? (
                              selectedOrder.details.map((detail, index) => (
                                <tr key={index}>
                                  <td>{detail.manufactured_item?.name || 'Producto'}</td>
                                  <td className="text-center">{detail.quantity}</td>
                                  <td className="text-center">
                                    ${(detail.subtotal / detail.quantity).toFixed(2)}
                                  </td>
                                  <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="text-center">No hay productos en este pedido</td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan={2}></td>
                              <td className="text-end"><strong>Subtotal:</strong></td>
                              <td className="text-end">${selectedOrder.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="text-end"><strong>Descuento:</strong></td>
                              <td className="text-end">-${selectedOrder.discount.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td colSpan={2}></td>
                              <td className="text-end"><strong>Total:</strong></td>
                              <td className="text-end fw-bold">${selectedOrder.final_total.toFixed(2)}</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeDetailModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Orders; 