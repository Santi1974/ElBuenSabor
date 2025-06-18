import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import type { DeliveryMethod, PaymentMethod } from '../../types/order';
import type { Address, AddressFormData } from '../../types/address';
import AddressModal from '../../components/AddressModal/AddressModal';
import ClientLayout from '../../components/ClientLayout/ClientLayout';
import api from '../../services/api';
import { handleError } from '../../utils/errorHandler';

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');

  const subtotal = items.reduce((sum, item) => {
    // For promotions, use the calculated discounted price
    const itemPrice = item.product.price || 0;
    return sum + (itemPrice * item.quantity);
  }, 0);
  const deliveryMethodDiscount = deliveryMethod === 'pickup' ? subtotal * 0.1 : 0; // 10% descuento en efectivo
  const total = subtotal - deliveryMethodDiscount;

  useEffect(() => {
    if (deliveryMethod === 'delivery') {
      setLoadingAddresses(true);
      api.get('/address/user/addresses')
        .then(res => {
          const mapped = res.data.items.map((addr: any) => ({
            id_key: addr.id_key,
            street: addr.street,
            street_number: addr.street_number,
            zip_code: addr.zip_code,
            name: addr.name,
            locality_id: addr.locality?.id_key,
            locality_name: addr.locality?.name,
            user_id: addr.user_id
          }));
          setAddresses(mapped);
        })
        .catch(() => setAddresses([]))
        .finally(() => setLoadingAddresses(false));
    }
  }, [deliveryMethod]);

  const handleQuantityChange = (id: number, newQuantity: number, type?: 'manufactured' | 'inventory' | 'promotion') => {
    if (newQuantity >= 0) {
      updateQuantity(id, newQuantity, type);
    }
  };

  const handleDeliveryMethodChange = (method: DeliveryMethod) => {
    setDeliveryMethod(method);
    if (method === 'delivery' && paymentMethod === 'cash') {
      setPaymentMethod('mercado_pago');
    }
    if (method === 'delivery' && !selectedAddress) {
      setShowAddressModal(true);
    }
  };

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setShowAddressModal(false);
  };

  const handleAddressSave = async (addressData: AddressFormData) => {
    try {
      setLoadingAddresses(true);
      
      // El AddressModal ya hizo el POST, solo necesitamos hacer GET para obtener las direcciones actualizadas
      const response = await api.get('/address/user/addresses');
      const mappedAddresses = response.data.items.map((addr: any) => ({
        id_key: addr.id_key,
        street: addr.street,
        street_number: addr.street_number,
        zip_code: addr.zip_code,
        name: addr.name,
        locality_id: addr.locality?.id_key,
        user_id: addr.user_id
      }));
      
      setAddresses(mappedAddresses);
      
      // Buscar la dirección recién creada (la que coincida con los datos enviados)
      const newAddress = mappedAddresses.find((addr: Address) => 
        addr.street === addressData.street && 
        addr.street_number === addressData.street_number &&
        addr.zip_code === addressData.zip_code &&
        addr.name === addressData.name
      );
      
      if (newAddress) {
        setSelectedAddress(newAddress);
      }
      
      setShowAddressModal(false);
    } catch (error) {
      console.error('Error fetching updated addresses:', error);
      // Mantener el modal abierto en caso de error
    } finally {
      setLoadingAddresses(false);
    }
  };

  const getUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id || payload.sub || null;
    } catch {
      return null;
    }
  };

  const buildOrderPayload = () => {
    const now = new Date().toISOString();
    const isDelivery = deliveryMethod === 'delivery';
    
    // Separar productos manufacturados, de inventario y promociones
    const manufacturedItems = items.filter(item => item.product.type === 'manufactured');
    const inventoryItems = items.filter(item => item.product.type === 'inventory');
    const promotionItems = items.filter(item => item.product.type === 'promotion');
    
    const payload: any = {
      date: now,
      delivery_method: deliveryMethod,
      payment_method: paymentMethod,
      notes: notes,
      details: manufacturedItems.map(item => ({
        quantity: item.quantity,
        manufactured_item_id: item.product.id_key
      })),
      inventory_details: inventoryItems.map(item => ({
        quantity: item.quantity,
        inventory_item_id: item.product.id_key
      })),
      promotion_details: promotionItems.map(item => ({
        quantity: item.quantity,
        promotion_id: item.product.id_key
      }))
    };
    
    if (isDelivery && selectedAddress) {
      payload.address_id = selectedAddress.id_key;
    }

    return payload;
  };

  const handlePayment = async () => {
    if (deliveryMethod === 'delivery' && !selectedAddress) {
      setShowAddressModal(true);
      return;
    }
    setLoadingOrder(true);
    setOrderError('');
    try {
      const orderPayload = buildOrderPayload();
      const response = await api.post('/order/generate', orderPayload);
      const order = response.data;
      
      // Clear the cart after successful order creation
      clearCart();
      
      if (paymentMethod === 'mercado_pago') {
        const mpResponse = await api.put(`/order/${order.id_key}/mp-payment`);
        window.location.href = mpResponse.data.payment_url;
        navigate(`/order/${order.id_key}`);
      } else {
        // Navigate to order detail page for cash payments
        navigate(`/order/${order.id_key}`);
      }
    } catch (err: any) {
      setOrderError(handleError(err, 'create order'));
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <ClientLayout title="Carrito de compras" showSearchBar={false}>
      <div className="container-fluid px-4 py-4 overflow-auto">
        <div className="row g-4">
          {/* Lista de productos */}
          <div className="col-12 col-lg-8">
            <div className="bg-white rounded-3 shadow-sm p-4">
              {items.map(item => (
                <div key={`${item.product.id_key}-${item.product.type}`} className="d-flex align-items-center mb-3 pb-3 border-bottom">
                  <div className="flex-grow-1">
                    <h3 className="h5 mb-1">
                      {item.product.name}
                      {item.product.type === 'promotion' && (
                        <span className="badge bg-warning text-dark ms-2">
                          <i className="bi bi-tag-fill me-1"></i>
                          {item.product.discount_percentage}% OFF
                        </span>
                      )}
                    </h3>
                    <div className="text-primary fw-bold">
                      {item.product.type === 'promotion' ? (
                        <div>
                          <div>${item.product.price.toFixed(2)}</div>
                          <small className="text-success">Con {item.product.discount_percentage}% descuento</small>
                        </div>
                      ) : (
                        `$${item.product.price.toFixed(2)}`
                      )}
                    </div>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <div className="input-group input-group-sm" style={{ width: '120px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id_key, item.quantity - 1, item.product.type)}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="form-control text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => handleQuantityChange(item.product.id_key, item.quantity + 1, item.product.type)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.product.id_key, item.product.type)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen y opciones */}
          <div className="col-12 col-lg-4">
            <div className="bg-white rounded-3 shadow-sm p-4">
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>{items.length} artículos</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="fw-bold">Total</span>
                  <span className="fw-bold">${subtotal}</span>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="h6 mb-3">Seleccionar:</h4>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryMethod"
                    id="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => handleDeliveryMethodChange('pickup')}
                  />
                  <label className="form-check-label" htmlFor="pickup">
                    Retiro por el local
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="deliveryMethod"
                    id="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={() => handleDeliveryMethodChange('delivery')}
                  />
                  <label className="form-check-label" htmlFor="delivery">
                    Envío a domicilio
                  </label>
                </div>

                {deliveryMethod === 'delivery' && (
                  <div className="mt-3">
                    {selectedAddress ? (
                      <div className="card">
                        <div className="card-body">
                          <h6 className="card-subtitle mb-2 text-muted">Dirección de entrega</h6>
                          <p className="card-text mb-1">
                            {selectedAddress.street} {selectedAddress.street_number}
                          </p>
                          <p className="card-text mb-1">
                            {selectedAddress.locality_name
                              ? `${selectedAddress.locality_name} (ID: ${selectedAddress.locality_id})`
                              : `ID Localidad: ${selectedAddress.locality_id}`}
                          </p>
                          <small className="text-muted d-block">{selectedAddress.zip_code} - {selectedAddress.name}</small>
                          <button
                            className="btn btn-outline-primary btn-sm mt-2"
                            onClick={() => setShowAddressModal(true)}
                          >
                            Cambiar dirección
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        className="btn btn-outline-primary w-100"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Agregar dirección de entrega
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h4 className="h6 mb-3">Forma de pago:</h4>
                <div className="form-check mb-2">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                    disabled={deliveryMethod === 'delivery'}
                  />
                  <label className={`form-check-label ${deliveryMethod === 'delivery' ? 'text-muted' : ''}`} htmlFor="cash">
                    Efectivo {deliveryMethod === 'delivery' && <small>(No disponible para envío a domicilio)</small>}
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    id="mercado_pago"
                    checked={paymentMethod === 'mercado_pago'}
                    onChange={() => setPaymentMethod('mercado_pago')}
                  />
                  <label className="form-check-label" htmlFor="mercado_pago">
                    Mercado Pago
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="h6 mb-3">Notas del pedido (opcional):</h4>
                <textarea
                  className="form-control"
                  rows={3}
                  placeholder="Agregar comentarios especiales para el pedido..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={500}
                />
                <div className="form-text">
                  {notes.length}/500 caracteres
                </div>
              </div>

              {deliveryMethod === 'pickup' && (
                <div className="alert alert-success mb-4">
                  <div className="d-flex justify-content-between">
                    <span>Descuento retiro en el local:</span>
                    <span>-${deliveryMethodDiscount}</span>
                  </div>
                </div>
              )}

              <div className="d-flex justify-content-between align-items-center mb-4">
                <span className="h5 mb-0">TOTAL:</span>
                <span className="h5 mb-0">${total}</span>
              </div>

              {orderError && (
                <div className="alert alert-danger mb-3">{orderError}</div>
              )}
              <button
                className="btn btn-primary w-100"
                onClick={handlePayment}
                disabled={items.length === 0 || (deliveryMethod === 'delivery' && !selectedAddress) || loadingOrder}
              >
                {loadingOrder ? 'Procesando...' : 'PAGAR'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        show={showAddressModal}
        onHide={() => setShowAddressModal(false)}
        onSave={handleAddressSave}
        addresses={addresses}
        onSelectAddress={handleAddressSelect}
      />
    </ClientLayout>
  );
};

export default Cart; 