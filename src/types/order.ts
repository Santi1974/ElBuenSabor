export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'mercado_pago';

export interface OrderDetails {
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
} 