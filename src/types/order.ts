import type { User } from './user';
import type { Address } from './address';
import type { ManufacturedItem, InventoryItem } from './product';

export type DeliveryMethod = 'pickup' | 'delivery';
export type PaymentMethod = 'cash' | 'mercado_pago';
export type OrderStatus = 'pending' | 'confirmed' | 'in_preparation' | 'ready' | 'delivered' | 'cancelled';

export interface OrderItem {
  id_key: number;
  quantity: number;
  subtotal: number;
  manufactured_item?: ManufacturedItem;
  inventory_item?: InventoryItem;
}

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

export interface OrderFilters {
  status?: OrderStatus;
  date_from?: string;
  date_to?: string;
  user_id?: number;
  delivery_method?: DeliveryMethod;
  payment_method?: PaymentMethod;
  userId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
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
}

export interface OrderResponse {
  data: Order[];
  total: number;
  hasNext: boolean;
} 