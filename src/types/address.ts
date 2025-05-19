export interface Address {
  id: number;
  street: string;
  number: string;
  apartment?: string;
  city: string;
  province: string;
  notes?: string;
}

export interface AddressFormData {
  street: string;
  number: string;
  apartment?: string;
  city: string;
  province: string;
  notes?: string;
} 