export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'mercadopago';

export interface OrderDetails {
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
} 