export interface Category {
  id_key: number;
  name: string;
  description: string;
  active: boolean;
  parent_id: number | null;
  subcategories?: Category[];
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  hasNext: boolean;
} 