import type { Order } from './order';

export interface Invoice {
  id_key: number;
  number: string;
  date: string;
  total: number;
  type: string;
  pdf_url: string | null;
  order: Order;
  original_invoice_id: number | null;
}

export interface InvoiceFilters {
  orderId?: number;
  userId?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface InvoiceResponse {
  total: number;
  offset: number;
  limit: number;
  items: Invoice[];
} 