import React, { useState, useEffect } from 'react';
import api from '../../../../services/api';
import OrderCard from './OrderCard';
import OrderDetailModal from './OrderDetailModal';
import OrderFilters from './OrderFilters';

// Types for orders functionality
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

export interface Order {
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
  invoice_id: number;
}

interface ClientOrdersModalProps {
  isOpen: boolean;
  client: any;
  onClose: () => void;
}

const ClientOrdersModal: React.FC<ClientOrdersModalProps> = ({
  isOpen,
  client,
  onClose
}) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilters, setStatusFilters] = useState({
    a_confirmar: false,
    en_cocina: false,
    listo: false,
    en_delivery: false,
    entregado: false,
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  // Fetch client orders
  const fetchClientOrders = async () => {
    if (!client) return;
    
    try {
      setLoading(true);
      setError('');
      const offset = (currentPage - 1) * itemsPerPage;
      
      // Build filter parameters
      const activeFilters = Object.entries(statusFilters)
        .filter(([_, isActive]) => isActive)
        .map(([status]) => status);
      
      const params = new URLSearchParams({
        user_id: client.id_key.toString(),
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
      console.error('Error fetching client orders:', err);
      setError('Error al cargar los pedidos del cliente. Por favor, intente nuevamente.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Effect to fetch orders when modal opens or filters change
  useEffect(() => {
    if (isOpen && client) {
      fetchClientOrders();
    }
  }, [isOpen, client, currentPage, itemsPerPage, searchTerm, statusFilters]);

  // Reset filters when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setSearchTerm('');
      setStatusFilters({
        a_confirmar: false,
        en_cocina: false,
        listo: false,
        en_delivery: false,
        entregado: false,
      });
    }
  }, [isOpen]);

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const handleCloseOrderDetail = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Pagination handlers
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

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex={-1} style={{ zIndex: 1050 }}>
        <div className="modal-dialog modal-fullscreen">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-receipt me-2"></i>
                Pedidos de {client.full_name}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body p-0">
              <div className="container-fluid py-4">
                <div className="row gap-3">
                  {/* Filters Section */}
                  <div className="col-12 col-lg-3">
                    <OrderFilters
                      searchTerm={searchTerm}
                      onSearchChange={(value) => {
                        setSearchTerm(value);
                        setCurrentPage(1);
                      }}
                      statusFilters={statusFilters}
                      onFilterChange={(filterName) => {
                        const currentValue = statusFilters[filterName as keyof typeof statusFilters];
                        
                        if (currentValue) {
                          setStatusFilters({
                            a_confirmar: false,
                            en_cocina: false,
                            listo: false,
                            en_delivery: false,
                            entregado: false,
                          });
                        } else {
                          setStatusFilters({
                            a_confirmar: filterName === 'a_confirmar',
                            en_cocina: filterName === 'en_cocina',
                            listo: filterName === 'listo',
                            en_delivery: filterName === 'en_delivery',
                            entregado: filterName === 'entregado',
                          });
                        }
                        setCurrentPage(1);
                      }}
                    />
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
                            <p className="text-muted mb-0">No se encontraron pedidos para este cliente</p>
                          </div>
                        </div>
                      ) : (
                        orders.map(order => (
                          <OrderCard
                            key={order.id_key}
                            order={order}
                            onClick={() => handleOrderClick(order)}
                          />
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
            </div>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleCloseOrderDetail}
        />
      )}
    </>
  );
};

export default ClientOrdersModal; 