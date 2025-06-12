import type { User } from './user';
import type { Address } from './address';
import type { ManufacturedItem, InventoryItem } from './product';

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

export interface Order {
  id_key: number;
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
}

export interface OrderResponse {
  data: Order[];
  total: number;
  hasNext: boolean;
} 