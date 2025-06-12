import { Category } from './category';

export interface BaseProduct {
  id_key: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  active: boolean;
  category_id: number;
  category?: Category;
}

export interface ManufacturedItem extends BaseProduct {
  preparation_time: number;
  recipe: string;
  details: any[];
}

export interface InventoryItem extends BaseProduct {
  current_stock: number;
  minimum_stock: number;
  measurement_unit: string;
  is_ingredient?: boolean;
}

export interface ProductResponse {
  data: (ManufacturedItem | InventoryItem)[];
  total: number;
  hasNext: boolean;
} 