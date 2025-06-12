import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import ClientLayout from '../../../components/ClientLayout/ClientLayout';
import './OrderDetail.css';

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

const OrderDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchOrderDetail(id);
    }
  }, [id]);

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/order/${orderId}`);
      setOrder(response.data);
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Error al cargar el pedido. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const handleGoToOrders = () => {
    navigate('/orders');
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

  if (loading) {
    return (
      <ClientLayout title="Detalle del pedido" showSearchBar={false}>
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="spinner-border text-primary mb-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="text-muted">Cargando pedido...</p>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (error) {
    return (
      <ClientLayout title="Detalle del pedido" showSearchBar={false}>
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="alert alert-danger d-inline-block" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!order) {
    return (
      <ClientLayout title="Detalle del pedido" showSearchBar={false}>
        <div className="container-fluid py-4">
          <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
            <div className="text-center">
              <div className="alert alert-warning d-inline-block" role="alert">
                <i className="bi bi-info-circle me-2"></i>
                No se encontró el pedido
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  const totalItems = (order.details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0) + 
                     (order.inventory_details?.reduce((sum, detail) => sum + detail.quantity, 0) || 0);

  return (
    <ClientLayout title="Detalle del pedido" showSearchBar={false}>
      <div className="container-fluid py-3" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="row">
          {/* Products List - Left Column */}
          <div className="col-12 col-lg-8 mb-4">
            <div className="order-products-container">
              {/* Productos Manufacturados */}
              {order.details?.map((detail, index) => (
                <div key={`manufactured-${index}`} className="card mb-3 product-card" style={{padding: '0px'}}>
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col-8">
                        <h6 className="mb-1 fw-bold">{detail.manufactured_item?.name || 'Producto'}</h6>
                        <p className="text-muted mb-0 small">
                          ${detail.manufactured_item?.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="col-4 text-end">
                        <span className="badge bg-secondary rounded-pill fs-6 me-2">
                          {detail.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Productos de Inventario */}
              {order.inventory_details?.map((detail, index) => (
                <div key={`inventory-${index}`} className="card mb-3 product-card" style={{padding: '0px'}}>
                  <div className="card-body p-3">
                    <div className="row align-items-center">
                      <div className="col-8">
                        <h6 className="mb-1 fw-bold">{detail.inventory_item?.name || 'Producto'}</h6>
                        <p className="text-muted mb-0 small">
                          ${detail.unit_price?.toFixed(2) || detail.inventory_item?.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div className="col-4 text-end">
                        <span className="badge bg-secondary rounded-pill fs-6 me-2">
                          {detail.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Mensaje si no hay productos */}
              {(!order.details?.length && !order.inventory_details?.length) && (
                <div className="text-center py-4">
                  <p className="text-muted">No hay productos en este pedido</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Panel - Right Column */}
          <div className="col-12 col-lg-4">
            <div className="card summary-card" style={{ padding: '16px 32px' }}>
              <div className="card-body p-1">
                {/* Items Summary */}
                <div className="text-center mb-4">
                  <h5 className="fw-bold text-dark">{totalItems} artículo{totalItems !== 1 ? 's' : ''}</h5>
                </div>

                {/* Total */}
                <div className="total-section mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Subtotal:</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-success">Descuento:</span>
                      <span className="text-success">-${order.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="fw-bold mb-0">Total</h5>
                    <h5 className="fw-bold mb-0 text-primary">${order.final_total.toFixed(2)}</h5>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="delivery-options mb-4">
                  
                  <div className="form-check mb-3">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="delivery" 
                      id="pickup" 
                      checked={order.delivery_method === 'pickup'} 
                      readOnly
                    />
                    <label className="form-check-label" htmlFor="pickup">
                      Retiro por el local
                    </label>
                  </div>
                  
                  <div className="form-check mb-4">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="delivery" 
                      id="delivery" 
                      checked={order.delivery_method === 'delivery'} 
                      readOnly
                    />
                    <label className="form-check-label" htmlFor="delivery">
                      Envío a domicilio
                    </label>
                  </div>

                  {/* Payment Options */}
                  <h6 className="fw-bold mb-3">Forma de pago:</h6>
                  
                  <div className="form-check mb-3">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="payment" 
                      id="cash" 
                      checked={order.payment_method === 'cash'} 
                      readOnly
                    />
                    <label className="form-check-label" htmlFor="cash">
                      Efectivo
                    </label>
                  </div>
                  
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      name="payment" 
                      id="mercado_pago" 
                      checked={order.payment_method === 'mercado_pago'} 
                      readOnly
                    />
                    <label className="form-check-label" htmlFor="mercado_pago">
                      Mercado Pago
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status Section */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card status-card">
              <div className="card-body text-center py-4">
                <h4 className="fw-bold mb-3">Estado del Pedido</h4>
                <button 
                  className={`btn btn-lg px-5 ${getStatusButtonClass(order.status)}`}
                  disabled
                >
                  {translateStatus(order.status)}
                </button>
                
                {/* Order Info */}
                <div className="mt-4 pt-3 border-top">
                  <div className="row text-center">
                    <div className="col-md-4 mb-2">
                      <small className="text-muted d-block">Pedido #</small>
                      <span className="fw-bold">{order.id_key}</span>
                    </div>
                    <div className="col-md-4 mb-2">
                      <small className="text-muted d-block">Realizado</small>
                      <span className="fw-bold">{formatDate(order.date)}</span>
                    </div>
                    {order.estimated_time > 0 && (
                      <div className="col-md-4 mb-2">
                        <small className="text-muted d-block">Tiempo estimado</small>
                        <span className="fw-bold">{order.estimated_time} min</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 pt-3 border-top">
                  <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                    <button
                      className="btn btn-primary btn-lg px-4 me-md-2"
                      onClick={handleGoToOrders}
                    >
                      Ver todos mis pedidos
                    </button>
                    <button
                      className="btn btn-outline-primary btn-lg px-4"
                      onClick={handleGoBack}
                    >
                      Seguir comprando
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

// Helper function for status button classes
const getStatusButtonClass = (status: string) => {
  switch (status.toLowerCase()) {
    case 'entregado':
      return 'btn-success';
    case 'en_preparacion':
      return 'btn-warning';
    case 'en_delivery':
      return 'btn-info';
    case 'a_confirmar':
      return 'btn-secondary';
    case 'cancelado':
      return 'btn-danger';
    default:
      return 'btn-secondary';
  }
};

export default OrderDetail; 