import React from 'react';
import type { Order } from './ClientOrdersModal';
import invoiceService from '../../../../services/invoiceService';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose }) => {
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
    <>
      <div className="modal-backdrop show" style={{ zIndex: 1060 }}></div>
      <div className="modal d-block" tabIndex={-1} style={{ zIndex: 1061 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-receipt me-2"></i>
                Detalle del Pedido #{order.id_key}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className={`badge bg-${getStatusClass(order.status)} fs-6`}>
                  {translateStatus(order.status)}
                </span>
                <small className="text-muted">
                  {formatDate(order.date)}
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
                      <p className="mb-2"><strong>Cliente:</strong> {order.user?.full_name}</p>
                      <p className="mb-2"><strong>Email:</strong> {order.user?.email}</p>
                      <p className="mb-2"><strong>Fecha:</strong> {formatDate(order.date)}</p>
                      <p className="mb-2">
                        <strong>Estado:</strong> 
                        <span className={`badge bg-${getStatusClass(order.status)} ms-2`}>
                          {translateStatus(order.status)}
                        </span>
                      </p>
                      <p className="mb-2"><strong>Método de entrega:</strong> {translateDeliveryMethod(order.delivery_method)}</p>
                      <p className="mb-2"><strong>Tiempo estimado:</strong> {order.estimated_time} minutos</p>
                      <p className="mb-0"><strong>Notas:</strong> {order.notes || 'Sin notas'}</p>
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
                      <p className="mb-2"><strong>Método de pago:</strong> {translatePaymentMethod(order.payment_method)}</p>
                      <p className="mb-2">
                        <strong>Estado de pago:</strong> 
                        <span className={`badge ${order.is_paid ? 'bg-success' : 'bg-warning'} ms-2`}>
                          {order.is_paid ? 'Pagado' : 'Pendiente'}
                        </span>
                      </p>
                      <p className="mb-2"><strong>Subtotal:</strong> ${order.total.toFixed(2)}</p>
                      <p className="mb-2"><strong>Descuento:</strong> ${order.discount.toFixed(2)}</p>
                      <p className="mb-0 fw-bold text-success">
                        <strong>Total final:</strong> ${order.final_total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {order.delivery_method === 'delivery' && order.address && (
                <div className="card mb-4">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-geo-alt me-2"></i>
                      Dirección de Entrega
                    </h6>
                  </div>
                  <div className="card-body">
                    <p className="mb-2"><strong>Calle:</strong> {order.address.street}</p>
                    <p className="mb-2"><strong>Número:</strong> {order.address.street_number}</p>
                    <p className="mb-2"><strong>Código Postal:</strong> {order.address.zip_code}</p>
                    <p className="mb-2"><strong>Nombre/Referencia:</strong> {order.address.name}</p>
                    {order.address.locality && (
                      <p className="mb-0"><strong>Localidad:</strong> {order.address.locality.name}</p>
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
                        {order.details?.map((detail, index) => (
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
                        {order.inventory_details?.map((detail, index) => (
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
                        {(!order.details?.length && !order.inventory_details?.length) && (
                          <tr>
                            <td colSpan={4} className="text-center text-muted py-4">No hay productos en este pedido</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan={3} className="text-end"><strong>Subtotal:</strong></td>
                          <td className="text-end">${order.total.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-end"><strong>Descuento:</strong></td>
                          <td className="text-end">-${order.discount.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td colSpan={3} className="text-end"><strong>Total:</strong></td>
                          <td className="text-end fw-bold text-success">${order.final_total.toFixed(2)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
            {order.invoice_id && (
                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => invoiceService.downloadPDFId(order.invoice_id)}
                >
                    <i className="bi bi-download me-2"></i>
                    Descargar Factura
                </button>
              )}
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderDetailModal; 