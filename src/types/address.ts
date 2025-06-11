export interface Address {
  id_key: number;
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
  locality_name?: string;
  user_id?: number;
}

export interface AddressFormData {
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
} 