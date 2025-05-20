export interface Address {
  id: number;
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
  locality_name?: string;
}

export interface AddressFormData {
  street: string;
  street_number: number;
  zip_code: string;
  name: string;
  locality_id: number;
} 