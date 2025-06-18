import React from 'react';
import type { Order } from './ClientOrdersModal';

interface OrderCardProps {
  order: Order;
  onClick: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onClick }) => {
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
      default:
        return status;
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

  // Get Bootstrap badge class for status
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado':
        return 'success';
      case 'en_cocina':
        return 'warning';
      case 'listo':
        return 'info';
      case 'en_delivery':
        return 'primary';
      case 'a_confirmar':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  return (
    <div 
      className="card order-card-hover"
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h6 className="card-title mb-0">
            <i className="bi bi-receipt me-2"></i>
            Pedido #{order.id_key}
          </h6>
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
            <div className="h6 mb-0 text-success">${order.final_total.toFixed(2)}</div>
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
  );
};

export default OrderCard; 