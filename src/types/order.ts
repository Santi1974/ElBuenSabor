import type { User } from './user';
import type { Address } from './address';
import type { ManufacturedItem, InventoryItem } from './product';

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'mercado_pago';

export interface OrderDetail {
  quantity: number;
  subtotal: number;
  manufactured_item: ManufacturedItem;
  id_key: number;
}

export interface InventoryDetail {
  quantity: number;
  subtotal: number;
  inventory_item: InventoryItem;
  id_key: number;
}

export interface PromotionDetail {
  quantity: number;
  subtotal: number;
  promotion_id: number;
  id_key: number;
}

export interface Order {
  id_key: number;
  date: string;
  total: number;
  discount: number;
  final_total: number;
  status: string;
  estimated_time: number;
  delivery_method: DeliveryMethod;
  payment_method: PaymentMethod;
  payment_id: string;
  is_paid: boolean;
  notes: string;
  user: User;
  address: Address | null;
  details: OrderDetail[];
  inventory_details: InventoryDetail[];
  promotion_details: PromotionDetail[];
}

export interface OrderResponse {
  data: Order[];
  total: number;
  hasNext: boolean;
} 