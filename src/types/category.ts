export interface Category {
  id_key: number;
  name: string;
  description: string;
  active: boolean;
  parent_id: number | null;
  subcategories?: Category[];
  public?: boolean;
  parent?: {
    id_key: number;
    name: string;
    description: string;
    active: boolean;
    public?: boolean | null;
  };
}

export interface CategoryResponse {
  data: Category[];
  total: number;
  hasNext: boolean;
} 