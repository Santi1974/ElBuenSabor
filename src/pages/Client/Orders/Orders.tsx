import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import ClientLayout from '../../../components/ClientLayout/ClientLayout';
import './Orders.css';
import invoiceService from '../../../services/invoiceService';

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

interface InventoryDetail {
  id_key: number;
  quantity: number;
  subtotal: number;
  unit_price: number;
  inventory_item: {
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
  inventory_details: InventoryDetail[];
  id_key: number;
}

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  
  const [statusFilters, setStatusFilters] = useState({
    a_confirmar: false,
    en_cocina: false,
    listo: false,
    en_delivery: false,
    entregado: false,
    facturado: false
  });

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage, searchTerm, statusFilters]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Construir los parámetros de filtro
      const activeFilters = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status);
      
      const params = new URLSearchParams({
        offset: offset.toString(),
        limit: itemsPerPage.toString()
      });
      
      if (searchTerm) {
        params.append('search', searchTerm);
      }
      
      if (activeFilters.length > 0) {
        params.append('status', activeFilters.join(','));
      }
      
      const response = await api.get(`/order/user/token?${params.toString()}`);
      
      if (response.data && response.data.items !== undefined) {
        setOrders(response.data.items);
        setTotalItems(response.data.total);
        setHasNext((response.data.offset + response.data.limit) < response.data.total);
      } else {
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

  const handleFilterChange = (filterName: string) => {
    setStatusFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName as keyof typeof prev]
    }));
    setCurrentPage(1); // Resetear a la primera página cuando cambian los filtros
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

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
      case 'en_cocina':
        return 'En cocina';
      case 'listo':
        return 'Listo';
      case 'en_delivery':
        return 'En camino';
      case 'entregado':
        return 'Entregado';
      case 'facturado':
        return 'Facturado';
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
      case 'credit_card':
        return 'Tarjeta de crédito';
      case 'cash':
        return 'Efectivo';
      case 'transfer':
        return 'Transferencia';
      default:
        return method;
    }
  };

  // Get Bootstrap badge class for status
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'success';
      case 'en_cocina':
        return 'warning';
      case 'listo':
        return 'success';
      case 'en_delivery':
        return 'info';
      case 'a_confirmar':
        return 'secondary';
      case 'facturado':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  return (
    <ClientLayout
      title="Mis Pedidos"
      showBackButton={true}
      showSearchBar={true}
      searchValue={searchTerm}
      onSearchChange={(value) => {
        setSearchTerm(value);
        setCurrentPage(1); // Resetear a la primera página cuando cambia la búsqueda
      }}
      searchPlaceholder="Buscar"
    >
      <div className="container-fluid py-4">
        <div className="row gap-3">
          {/* Filters Section */}
          <div className="col-12 col-lg-3">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">
                  <i className="bi bi-funnel me-2"></i>
                  Filtros
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-column gap-2">
                  <div className="form-check">
              <input 
                      className="form-check-input" 
                type="checkbox" 
                id="pending" 
                checked={statusFilters.a_confirmar}
                onChange={() => handleFilterChange('a_confirmar')}
              />
                    <label className="form-check-label" htmlFor="pending">
                      A confirmar
                    </label>
            </div>
                  <div className="form-check">
              <input 
                      className="form-check-input" 
                type="checkbox" 
                id="preparing" 
                checked={statusFilters.en_cocina}
                onChange={() => handleFilterChange('en_cocina')}
              />
                    <label className="form-check-label" htmlFor="preparing">
                      En preparación
                    </label>
            </div>
                  <div className="form-check">
              <input 
                      className="form-check-input" 
                type="checkbox" 
                id="on-way" 
                checked={statusFilters.en_delivery}
                onChange={() => handleFilterChange('en_delivery')}
              />
                    <label className="form-check-label" htmlFor="on-way">
                      En camino
                    </label>
            </div>
                  <div className="form-check">
              <input 
                      className="form-check-input" 
                type="checkbox" 
                id="delivered" 
                checked={statusFilters.entregado}
                onChange={() => handleFilterChange('entregado')}
              />
                    <label className="form-check-label" htmlFor="delivered">
                      Entregado
                    </label>
            </div>
                  <div className="form-check">
              <input 
                      className="form-check-input" 
                type="checkbox" 
                id="listo" 
                checked={statusFilters.listo}
                onChange={() => handleFilterChange('listo')}
              />
                    <label className="form-check-label" htmlFor="listo">
                      Listo
                    </label>
                  </div>
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      id="facturado" 
                      checked={statusFilters.facturado}
                      onChange={() => handleFilterChange('facturado')}
                    />
                    <label className="form-check-label" htmlFor="facturado">
                      Facturado
                    </label>
                  </div>
                </div>
            </div>
          </div>
        </div>

          {/* Orders List Section */}
          <div className="col-12 col-lg-8">
        {/* Pagination Info and Controls */}
            <div className="card mb-3" style={{ padding: '5px 10px' }}>
              <div className="card-body p-1">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="text-muted">
                    Mostrando {orders.length} de {totalItems} pedidos
                  </span>
                  <div className="d-flex align-items-center gap-2">
                    <label className="text-muted mb-0">Mostrar:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                      className="form-select form-select-sm"
                      style={{ width: 'auto' }}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
                  </div>
                </div>
          </div>
        </div>

            {/* Orders List */}
            <div className="d-flex flex-column gap-3">
          {loading ? (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status">
                      <span className="visually-hidden">Cargando...</span>
                    </div>
                    <p className="text-muted mb-0">Cargando pedidos...</p>
                  </div>
                </div>
          ) : error ? (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
          ) : orders.length === 0 ? (
                <div className="card">
                  <div className="card-body text-center py-5">
                    <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                    <p className="text-muted mb-0">No se encontraron pedidos</p>
                  </div>
                </div>
          ) : (
            orders.map(order => (
              <div 
                key={order.id_key} 
                    className="card order-card-hover"
                onClick={() => handleOrderClick(order)}
                    style={{ cursor: 'pointer' }}
              >
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-receipt me-2"></i>
                          Pedido #{order.id_key}
                        </h5>
                        <span className={`badge bg-${getStatusClass(order.status)}`}>
                    {translateStatus(order.status)}
                        </span>
                      </div>
                      
                      <div className="row g-3 mb-3">
                        <div className="col-sm-6">
                          <small className="text-muted">Fecha:</small>
                          <div>{formatDate(order.date)}</div>
                        </div>
                        <div className="col-sm-6">
                          <small className="text-muted">Método de pago:</small>
                          <div>{translatePaymentMethod(order.payment_method)}</div>
                  </div>
                </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <small className="text-muted">Total:</small>
                          <div className="h5 mb-0 text-success">${order.final_total.toFixed(2)}</div>
                  </div>
                        <div className="text-end">
                          <small className="text-muted">
                            {((order.details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0) + 
                              (order.inventory_details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0))} productos
                          </small>
                          <div>
                            <i className="bi bi-chevron-right text-muted"></i>
                  </div>
                  </div>
                </div>
                  </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination Controls */}
        {totalItems > 0 && (
              <div className="card mt-3" style={{ padding: '5px 10px' }}>
                <div className="card-body p-1">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <small className="text-muted">
                Página {currentPage} de {totalPages} - Mostrando {orders.length} de {totalItems} elementos
                    </small>
            <nav aria-label="Page navigation">
                      <ul className="pagination pagination-sm mb-0">
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
                </div>
          </div>
        )}
          </div>
        </div>
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
                    <i className="bi bi-receipt me-2"></i>
                    Detalle del Pedido #{selectedOrder.id_key}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={closeDetailModal}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <span className={`badge bg-${getStatusClass(selectedOrder.status)} fs-6`}>
                      {translateStatus(selectedOrder.status)}
                    </span>
                    <small className="text-muted">
                      {formatDate(selectedOrder.date)}
                    </small>
                  </div>

                  <div className="row mb-4">
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="card-title mb-0">
                            <i className="bi bi-info-circle me-2"></i>
                            Información General
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-2"><strong>Fecha:</strong> {formatDate(selectedOrder.date)}</p>
                          <p className="mb-2">
                            <strong>Estado:</strong> 
                            <span className={`badge bg-${getStatusClass(selectedOrder.status)} ms-2`}>
                              {translateStatus(selectedOrder.status)}
                            </span>
                          </p>
                          <p className="mb-2"><strong>Método de entrega:</strong> {translateDeliveryMethod(selectedOrder.delivery_method)}</p>
                          <p className="mb-2"><strong>Tiempo estimado:</strong> {selectedOrder.estimated_time} minutos</p>
                          <p className="mb-0"><strong>Notas:</strong> {selectedOrder.notes || 'Sin notas'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card">
                        <div className="card-header">
                          <h6 className="card-title mb-0">
                            <i className="bi bi-credit-card me-2"></i>
                            Información de Pago
                          </h6>
                        </div>
                        <div className="card-body">
                          <p className="mb-2"><strong>Método de pago:</strong> {translatePaymentMethod(selectedOrder.payment_method)}</p>
                          <p className="mb-2">
                            <strong>Estado de pago:</strong> 
                            <span className={`badge ${selectedOrder.is_paid ? 'bg-success' : 'bg-warning'} ms-2`}>
                              {selectedOrder.is_paid ? 'Pagado' : 'Pendiente'}
                            </span>
                          </p>
                          <p className="mb-2"><strong>Subtotal:</strong> ${selectedOrder.total.toFixed(2)}</p>
                          <p className="mb-2"><strong>Descuento:</strong> ${selectedOrder.discount.toFixed(2)}</p>
                          <p className="mb-0 fw-bold text-success">
                            <strong>Total final:</strong> ${selectedOrder.final_total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.delivery_method === 'delivery' && selectedOrder.address && (
                    <div className="card mb-4">
                      <div className="card-header">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          Dirección de Entrega
                        </h6>
                      </div>
                      <div className="card-body">
                        <p className="mb-2"><strong>Calle:</strong> {selectedOrder.address.street}</p>
                        <p className="mb-2"><strong>Número:</strong> {selectedOrder.address.street_number}</p>
                        <p className="mb-2"><strong>Código Postal:</strong> {selectedOrder.address.zip_code}</p>
                        <p className="mb-2"><strong>Nombre/Referencia:</strong> {selectedOrder.address.name}</p>
                        {selectedOrder.address.locality && (
                          <p className="mb-0"><strong>Localidad:</strong> {selectedOrder.address.locality.name}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="card">
                    <div className="card-header">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-basket me-2"></i>
                        Productos
                      </h6>
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
                            {/* Productos Manufacturados */}
                            {selectedOrder.details?.map((detail, index) => (
                              <tr key={`manufactured-${index}`}>
                                  <td>{detail.manufactured_item?.name || 'Producto'}</td>
                                  <td className="text-center">{detail.quantity}</td>
                                  <td className="text-center">
                                    ${(detail.subtotal / detail.quantity).toFixed(2)}
                                  </td>
                                  <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                                </tr>
                            ))}
                            
                            {/* Productos de Inventario */}
                            {selectedOrder.inventory_details?.map((detail, index) => (
                              <tr key={`inventory-${index}`}>
                                <td>{detail.inventory_item?.name || 'Producto'}</td>
                                <td className="text-center">{detail.quantity}</td>
                                <td className="text-center">
                                  ${detail.unit_price?.toFixed(2) || (detail.subtotal / detail.quantity).toFixed(2)}
                                </td>
                                <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                              </tr>
                            ))}
                            
                            {/* Mensaje si no hay productos */}
                            {(!selectedOrder.details?.length && !selectedOrder.inventory_details?.length) && (
                              <tr>
                                <td colSpan={4} className="text-center text-muted py-4">No hay productos en este pedido</td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan={3} className="text-end"><strong>Subtotal:</strong></td>
                              <td className="text-end">${selectedOrder.total.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="text-end"><strong>Descuento:</strong></td>
                              <td className="text-end">-${selectedOrder.discount.toFixed(2)}</td>
                            </tr>
                            <tr>
                              <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                              <td className="text-end fw-bold text-success">${selectedOrder.final_total.toFixed(2)}</td>
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
                    className="btn btn-primary"
                    onClick={() => invoiceService.downloadInvoiceByOrderId(selectedOrder.id_key)}
                  >
                    <i className="bi bi-download me-2"></i>
                    Descargar Factura
                  </button>
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
    </ClientLayout>
  );
};

export default Orders; 