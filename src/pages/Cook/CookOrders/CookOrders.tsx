import { useState, useEffect } from 'react';
import cookService, { type Order } from '../../../services/cookService';
import 'bootstrap/dist/css/bootstrap.min.css';

const CookOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<{ name: string; recipe: string; preparation_time: number } | null>(null);
  const [delayMinutes, setDelayMinutes] = useState(0);
  const [processingOrderId, setProcessingOrderId] = useState<number | null>(null);
  
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
    setOrders([]);
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await cookService.getKitchenOrders(offset, itemsPerPage);
      
      setOrders(response.data);
      setTotalItems(response.total);
      setHasNext(response.hasNext);
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
      setError('Error al cargar los pedidos de cocina. Por favor, intente nuevamente.');
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

  const handleViewRecipe = (name: string, recipe: string, preparation_time: number) => {
    setSelectedRecipe({ name, recipe, preparation_time });
    setShowRecipeModal(true);
  };

  const closeRecipeModal = () => {
    setShowRecipeModal(false);
    setSelectedRecipe(null);
  };

  const handleAddDelay = (order: Order) => {
    setSelectedOrder(order);
    setDelayMinutes(0);
    setShowDelayModal(true);
  };

  const closeDelayModal = () => {
    setShowDelayModal(false);
    setSelectedOrder(null);
    setDelayMinutes(0);
  };

  const handleMoveToReady = async (orderId: number) => {
    try {
      setProcessingOrderId(orderId);
      await cookService.moveToReady(orderId);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Close the modal if it's open
      if (selectedOrder?.id_key === orderId) {
        closeDetailModal();
      }
      
      alert('Pedido marcado como listo exitosamente');
    } catch (err) {
      console.error('Error moving order to ready:', err);
      alert('Error al marcar el pedido como listo. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleSubmitDelay = async () => {
    if (!selectedOrder || delayMinutes <= 0) {
      alert('Por favor, ingrese un tiempo de retraso válido.');
      return;
    }

    try {
      setProcessingOrderId(selectedOrder.id_key);
      await cookService.addDelay(selectedOrder.id_key, delayMinutes);
      
      // Refresh the orders list
      await fetchOrders();
      
      // Close the modal
      closeDelayModal();
      
      alert(`Retraso de ${delayMinutes} minutos agregado exitosamente`);
    } catch (err) {
      console.error('Error adding delay:', err);
      alert('Error al agregar el retraso. Por favor, intente nuevamente.');
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    return (
      order.id_key.toString().includes(searchTerm) ||
      order.user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.phone_number.includes(searchTerm) ||
      order.delivery_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  // Translate delivery method to Spanish
  const translateDeliveryMethod = (method: string) => {
    switch (method.toLowerCase()) {
      case 'delivery':
        return 'Delivery';
      case 'pickup':
        return 'Retiro en local';
      default:
        return method;
    }
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

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h4 mb-0 text-dark fw-bold">
          <i className="bi bi-fire me-2"></i>
          Pedidos en Cocina
        </h2>
        <div className="badge bg-warning fs-6">
          {totalItems} pedido{totalItems !== 1 ? 's' : ''} en cocina
        </div>
      </div>

      {/* Search Bar */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por ID, cliente, teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={(e) => handleItemsPerPageChange(parseInt(e.target.value))}
          >
            <option value={5}>5 por página</option>
            <option value={10}>10 por página</option>
            <option value={20}>20 por página</option>
            <option value={50}>50 por página</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {/* Orders Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando pedidos en cocina...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-clipboard-x display-1"></i>
          <p className="mt-3">No hay pedidos en cocina</p>
        </div>
      ) : (
        <>
          <div className="row">
            {filteredOrders.map(order => (
              <div key={order.id_key} className="col-lg-6 col-xl-4 mb-4">
                <div className="card h-100 shadow-sm border-warning">
                  <div className="card-header bg-warning">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-receipt me-2"></i>
                        Pedido #{order.id_key}
                      </h6>
                      <span className="badge bg-dark">
                        <i className="bi bi-clock me-1"></i>
                        {order.estimated_time} min
                      </span>
                    </div>
                  </div>
                  <div 
                    className="card-body cursor-pointer" 
                    onClick={() => handleOrderClick(order)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="mb-1">{order.user.full_name}</h6>
                        <small className="text-muted">
                          <i className="bi bi-telephone me-1"></i>
                          {order.user.phone_number}
                        </small>
                      </div>
                      <div className="text-end">
                        <div className="h5 mb-0 text-success">${order.final_total.toFixed(2)}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="text-muted small">
                          <i className="bi bi-truck me-1"></i>
                          {translateDeliveryMethod(order.delivery_method)}
                        </span>
                        <span className="text-muted small">
                          <i className="bi bi-credit-card me-1"></i>
                          {translatePaymentMethod(order.payment_method)}
                        </span>
                      </div>
                      <div className="text-muted small">
                        <i className="bi bi-calendar me-1"></i>
                        {formatDate(order.date)}
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <small className="text-muted">Productos:</small>
                        <div className="small">
                          {((order.details?.length || 0) + (order.inventory_details?.length || 0))} items
                        </div>
                      </div>
                      <div className="text-end">
                        <i className="bi bi-chevron-right text-muted"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="card-footer bg-light">
                    <div className="d-flex gap-2">
                      <button 
                        className="btn btn-success btn-sm flex-fill"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveToReady(order.id_key);
                        }}
                        disabled={processingOrderId === order.id_key}
                      >
                        <i className="bi bi-check-circle me-1"></i>
                        {processingOrderId === order.id_key ? 'Procesando...' : 'Listo'}
                      </button>
                      <button 
                        className="btn btn-warning btn-sm flex-fill"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddDelay(order);
                        }}
                      >
                        <i className="bi bi-clock me-1"></i>
                        Retraso
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-4">
              <nav aria-label="Paginación de pedidos">
                <ul className="pagination mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handlePrevPage} disabled={currentPage === 1}>
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + index;
                    if (pageNumber <= totalPages) {
                      return (
                        <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                          <button className="page-link" onClick={() => handlePageChange(pageNumber)}>
                            {pageNumber}
                          </button>
                        </li>
                      );
                    }
                    return null;
                  })}
                  
                  <li className={`page-item ${!hasNext ? 'disabled' : ''}`}>
                    <button className="page-link" onClick={handleNextPage} disabled={!hasNext}>
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
              <div className="ms-3 text-muted small">
                Página {currentPage} de {totalPages} ({totalItems} total)
              </div>
            </div>
          )}
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
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
                        <div className="mb-2">
                          <strong>Estado:</strong> 
                          <span className="badge bg-warning ms-2">
                            En Cocina
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Info */}
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Información del Pedido
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="mb-2">
                          <strong>Método de entrega:</strong> {translateDeliveryMethod(selectedOrder.delivery_method)}
                        </div>
                        <div className="mb-2">
                          <strong>Método de pago:</strong> {translatePaymentMethod(selectedOrder.payment_method)}
                        </div>
                        <div className="mb-2">
                          <strong>Estado de pago:</strong> 
                          <span className={`badge ms-2 ${selectedOrder.is_paid ? 'bg-success' : 'bg-danger'}`}>
                            {selectedOrder.is_paid ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                        {selectedOrder.notes && (
                          <div className="mb-2">
                            <strong>Notas:</strong>
                            <div className="mt-1 p-2 bg-light rounded">
                              {selectedOrder.notes}
                            </div>
                          </div>
                        )}
                        {selectedOrder.address && (
                          <div className="mb-2">
                            <strong>Dirección:</strong>
                            <div className="mt-1">
                              {selectedOrder.address.street} {selectedOrder.address.number}, {selectedOrder.address.city}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="card">
                  <div className="card-header">
                    <h6 className="mb-0">
                      <i className="bi bi-box-seam me-2"></i>
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
                            <th className="text-center">Tiempo</th>
                            <th className="text-center">Acciones</th>
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
                              <td className="text-center">
                                <span className="badge bg-primary">{detail.quantity}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-info">{detail.manufactured_item.preparation_time} min</span>
                              </td>
                              <td className="text-center">
                                {detail.manufactured_item.recipe && (
                                  <button
                                    className="btn btn-outline-warning btn-sm"
                                    onClick={() => handleViewRecipe(
                                      detail.manufactured_item.name,
                                      detail.manufactured_item.recipe,
                                      detail.manufactured_item.preparation_time
                                    )}
                                  >
                                    <i className="bi bi-book me-1"></i>
                                    Receta
                                  </button>
                                )}
                              </td>
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
                              <td className="text-center">
                                <span className="badge bg-info">{detail.quantity}</span>
                              </td>
                              <td className="text-center">
                                <span className="badge bg-secondary">-</span>
                              </td>
                              <td className="text-center">
                                <span className="text-muted small">Sin preparación</span>
                              </td>
                              <td className="text-end">${detail.subtotal.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={4} className="text-end fw-semibold">Subtotal:</td>
                            <td className="text-end fw-semibold">${selectedOrder.total.toFixed(2)}</td>
                          </tr>
                          {selectedOrder.discount > 0 && (
                            <tr>
                              <td colSpan={4} className="text-end fw-semibold text-success">Descuento:</td>
                              <td className="text-end fw-semibold text-success">-${selectedOrder.discount.toFixed(2)}</td>
                            </tr>
                          )}
                          <tr>
                            <td colSpan={4} className="text-end fw-bold">Total Final:</td>
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
                  className="btn btn-warning"
                  onClick={() => {
                    closeDetailModal();
                    handleAddDelay(selectedOrder);
                  }}
                >
                  <i className="bi bi-clock me-2"></i>
                  Agregar Retraso
                </button>
                <button 
                  type="button" 
                  className="btn btn-success"
                  onClick={() => handleMoveToReady(selectedOrder.id_key)}
                  disabled={processingOrderId === selectedOrder.id_key}
                >
                  <i className="bi bi-check-circle me-2"></i>
                  {processingOrderId === selectedOrder.id_key ? 'Procesando...' : 'Marcar como Listo'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-book me-2"></i>
                  Receta: {selectedRecipe.name}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeRecipeModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="card">
                  <div className="card-header bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-0">Instrucciones de Preparación</h6>
                      <span className="badge bg-info">
                        <i className="bi bi-clock me-1"></i>
                        {selectedRecipe.preparation_time} minutos
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <div className="recipe-content" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {selectedRecipe.recipe}
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeRecipeModal}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && selectedOrder && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-clock me-2"></i>
                  Agregar Retraso - Pedido #{selectedOrder.id_key}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeDelayModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Se agregará tiempo adicional al pedido y se notificará al cliente.
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Tiempo de retraso (minutos)</label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    max="120"
                    value={delayMinutes}
                    onChange={(e) => setDelayMinutes(parseInt(e.target.value) || 0)}
                    placeholder="Ingrese los minutos de retraso"
                  />
                  <div className="form-text">
                    Tiempo estimado actual: {selectedOrder.estimated_time} minutos
                  </div>
                </div>
                
                {delayMinutes > 0 && (
                  <div className="alert alert-info">
                    <strong>Nuevo tiempo estimado:</strong> {selectedOrder.estimated_time + delayMinutes} minutos
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeDelayModal}>
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning"
                  onClick={handleSubmitDelay}
                  disabled={delayMinutes <= 0 || processingOrderId === selectedOrder.id_key}
                >
                  <i className="bi bi-clock me-2"></i>
                  {processingOrderId === selectedOrder.id_key ? 'Procesando...' : `Agregar ${delayMinutes} min`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CookOrders;
