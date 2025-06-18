import { useState, useEffect } from 'react';
import deliveryService, { type Order } from '../../../services/deliveryService';
import 'bootstrap/dist/css/bootstrap.min.css';

const DeliveryOrders = () => {
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

  // Calculate total pages for pagination
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  useEffect(() => {
    fetchOrders();
  }, [currentPage, itemsPerPage]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await deliveryService.getDeliveryOrders(offset, itemsPerPage);
      
      setOrders(response.data);
      setTotalItems(response.total);
      setHasNext(response.hasNext);
    } catch (err) {
      console.error('Error fetching delivery orders:', err);
      setError('Error al cargar los pedidos. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedOrder(null);
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    return (
      order.id_key.toString().includes(searchTerm) ||
      order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.phone_number.includes(searchTerm) ||
      (order.address?.street.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.payment_method.toLowerCase().includes(searchTerm.toLowerCase())
    );
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

  // Translate payment method to Spanish
  const translatePaymentMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'mercado_pago':
        return 'Mercado Pago';
      case 'cash':
        return 'Efectivo';
      default:
        return method;
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

  const handleMarkAsDelivered = async (orderId: number) => {
    try {
      setLoading(true);
      await deliveryService.markAsDelivered(orderId);
      
      // Refresh the orders list to remove the delivered order
      await fetchOrders();
      
      // Close the modal
      closeDetailModal();
      
      // Show success message
      alert('Pedido marcado como entregado exitosamente');
    } catch (err) {
      console.error('Error marking order as delivered:', err);
      alert('Error al marcar el pedido como entregado. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 text-dark fw-bold">
          <i className="bi bi-truck me-2"></i>
          Pedidos en Delivery
        </h2>
        <div className="badge bg-secondary fs-6">
          {totalItems} pedido{totalItems !== 1 ? 's' : ''} pendiente{totalItems !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Buscar por ID, cliente, teléfono, dirección..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-6 d-flex justify-content-end align-items-center">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">Mostrar:</span>
            <select 
              className="form-select form-select-sm" 
              style={{width: 'auto'}}
              value={itemsPerPage}
              onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-muted small">por página</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

              {/* Loading State */}
      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <div className="spinner-border text-secondary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Orders Table */}
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Pedido</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Cliente</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Dirección</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Teléfono</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Total</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Fecha</th>
                      <th className="border-0 fw-semibold text-muted px-4 py-3">Pago</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-5 text-muted">
                          <i className="bi bi-inbox fs-1 d-block mb-3"></i>
                          {searchTerm ? 'No se encontraron pedidos que coincidan con la búsqueda' : 'No hay pedidos en delivery'}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr 
                          key={order.id_key} 
                          className="cursor-pointer"
                          onClick={() => handleOrderClick(order)}
                          style={{cursor: 'pointer'}}
                        >
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold text-primary">#{order.id_key}</span>
                              <small className="text-muted">
                                {order.estimated_time} min estimado
                              </small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">{order.user.full_name}</span>
                              <small className="text-muted">{order.user.email}</small>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {order.address ? (
                              <div className="d-flex flex-column">
                                <span>{order.address.street} {order.address.street_number}</span>
                                <small className="text-muted">
                                  {order.address.locality.name} - CP: {order.address.zip_code}
                                </small>
                              </div>
                            ) : (
                              <span className="text-muted">Retiro en local</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className="fw-medium">{order.user.phone_number}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="fw-semibold">${order.final_total.toFixed(2)}</span>
                              {order.discount > 0 && (
                                <small className="text-success">
                                  Desc: ${order.discount.toFixed(2)}
                                </small>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-muted small">{formatDate(order.date)}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="d-flex flex-column">
                              <span className="small">{translatePaymentMethod(order.payment_method)}</span>
                              <span className={`badge ${order.is_paid ? 'bg-success' : 'bg-warning'} small`}>
                                {order.is_paid ? 'Pagado' : 'Pendiente'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <div className="text-muted small">
                Mostrando {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} a {Math.min(currentPage * itemsPerPage, totalItems)} de {totalItems} resultados
              </div>
              <nav>
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
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={handleNextPage}
                      disabled={!hasNext}
                    >
                      Siguiente
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
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
                <div className="row">
                  {/* Customer Info */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Información del Cliente
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Nombre:</strong> {selectedOrder.user.full_name}
                        </div>
                        <div className="mb-2">
                          <strong>Email:</strong> {selectedOrder.user.email}
                        </div>
                        <div className="mb-2">
                          <strong>Teléfono:</strong> {selectedOrder.user.phone_number}
                        </div>
                        <div className="mb-2">
                          <strong>Fecha del pedido:</strong> {formatDate(selectedOrder.date)}
                        </div>
                        <div className="mb-2">
                          <strong>Tiempo estimado:</strong> {selectedOrder.estimated_time} minutos
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Info */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-truck me-2"></i>
                          Información de Entrega
                        </h6>
                      </div>
                      <div className="card-body">
                        {selectedOrder.address ? (
                          <>
                            <div className="mb-2">
                              <strong>Dirección:</strong> {selectedOrder.address.street} {selectedOrder.address.street_number}
                            </div>
                            <div className="mb-2">
                              <strong>Localidad:</strong> {selectedOrder.address.locality.name}
                            </div>
                            <div className="mb-2">
                              <strong>Código Postal:</strong> {selectedOrder.address.zip_code}
                            </div>
                            <div className="mb-2">
                              <strong>Referencia:</strong> {selectedOrder.address.name || 'Sin referencia'}
                            </div>
                          </>
                        ) : (
                          <div className="text-muted">Retiro en local</div>
                        )}
                        <div className="mb-2">
                          <strong>Método de pago:</strong> {translatePaymentMethod(selectedOrder.payment_method)}
                        </div>
                        <div className="mb-2">
                          <strong>Estado del pago:</strong> 
                          <span className={`badge ms-2 ${selectedOrder.is_paid ? 'bg-success' : 'bg-warning'}`}>
                            {selectedOrder.is_paid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                        {selectedOrder.notes && (
                          <div className="mb-2">
                            <strong>Notas:</strong> {selectedOrder.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="card">
                  <div className="card-header bg-light">
                    <h6 className="mb-0">
                      <i className="bi bi-list-ul me-2"></i>
                      Productos del Pedido
                    </h6>
                  </div>
                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="table table-borderless mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Producto</th>
                            <th className="text-center">Cantidad</th>
                            <th className="text-end">Precio Unit.</th>
                            <th className="text-end">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Manufactured Items */}
                          {selectedOrder.details.map((detail) => (
                            <tr key={`manufactured-${detail.id_key}`}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-box-seam me-2 text-primary"></i>
                                  <span>{detail.manufactured_item.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{detail.quantity}</td>
                              <td className="text-end">${detail.manufactured_item.price.toFixed(2)}</td>
                              <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                          
                          {/* Inventory Items */}
                          {selectedOrder.inventory_details.map((detail) => (
                            <tr key={`inventory-${detail.id_key}`}>
                              <td>
                                <div className="d-flex align-items-center">
                                  <i className="bi bi-archive me-2 text-info"></i>
                                  <span>{detail.inventory_item.name}</span>
                                </div>
                              </td>
                              <td className="text-center">{detail.quantity}</td>
                              <td className="text-end">${detail.unit_price.toFixed(2)}</td>
                              <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={3} className="text-end fw-semibold">Subtotal:</td>
                            <td className="text-end fw-semibold">${selectedOrder.total.toFixed(2)}</td>
                          </tr>
                          {selectedOrder.discount > 0 && (
                            <tr>
                              <td colSpan={3} className="text-end fw-semibold text-success">Descuento:</td>
                              <td className="text-end fw-semibold text-success">-${selectedOrder.discount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={3} className="text-end fw-bold">Total Final:</td>
                            <td className="text-end fw-bold">${selectedOrder.final_total.toFixed(2)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDetailModal}>
                  Cerrar
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleMarkAsDelivered(selectedOrder.id_key)}
                  disabled={loading}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {loading ? 'Procesando...' : 'Pasar a Entregado'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryOrders; 