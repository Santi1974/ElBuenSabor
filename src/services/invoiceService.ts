import api from './api';

// Interfaces for invoice data structure
export interface User {
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  password: string;
  google_sub: string | null;
  active: boolean;
  image_url: string | null;
  id_key: number;
}

export interface Category {
  name: string;
  description: string;
  active: boolean;
  parent_id: number | null;
  id_key: number;
  subcategories: Category[];
}

export interface ManufacturedItem {
  name: string;
  description: string;
  preparation_time: number;
  price: number;
  image_url: string;
  recipe: string;
  active: boolean;
  category: Category;
  details: any[];
  id_key: number;
}

export interface OrderDetail {
  quantity: number;
  unit_price: number;
  subtotal: number;
  order_id: number;
  manufactured_item: ManufacturedItem;
  id_key: number;
}

export interface Order {
  delivery_method: string;
  payment_method: string;
  notes: string;
  date: string;
  payment_id: string;
  estimated_time: number;
  final_total: number;
  discount: number;
  total: number;
  is_paid: boolean;
  status: string;
  user: User;
  address: any | null;
  details: OrderDetail[];
  inventory_details: any[];
  id_key: number;
}

export interface Invoice {
  number: string;
  date: string;
  total: number;
  type: string;
  pdf_url: string | null;
  order: Order;
  original_invoice_id: number | null;
  id_key: number;
}

export interface InvoicesResponse {
  total: number;
  offset: number;
  limit: number;
  items: Invoice[];
}

class InvoiceService {
  async getAll(offset = 0, limit = 10): Promise<{ data: Invoice[], total: number, hasNext: boolean }> {
    try {
      const response = await api.get<InvoicesResponse>(`/invoice/?offset=${offset}&limit=${limit}`);
      
      // Handle both paginated and direct array responses for backward compatibility
      if (response.data && typeof response.data === 'object' && 'items' in response.data) {
        // New paginated format
        const { total, items } = response.data;
        return {
          data: items,
          total: total,
          hasNext: offset + limit < total
        };
      } else {
        // Fallback for direct array response
        const items = Array.isArray(response.data) ? response.data : [];
        return {
          data: items,
          total: items.length,
          hasNext: false
        };
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  async getById(id: number): Promise<Invoice> {
    try {
      const response = await api.get<Invoice>(`/invoice/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Method to download PDF from API endpoint
  async downloadPDF(invoice: Invoice): Promise<void> {
    try {
      const response = await api.get(`/invoice/report/${invoice.id_key}`, {
        responseType: 'blob' // Important for binary data
      });
      
      // Create blob URL and download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create temporary download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `factura-${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      throw error;
    }
  }

  // Utility methods for formatting
  formatInvoiceNumber(number: string): string {
    return number;
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }

  getPaymentMethodDisplay(method: string): string {
    const methods: Record<string, string> = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'transfer': 'Transferencia',
      'mercadopago': 'MercadoPago'
    };
    return methods[method] || method;
  }

  getDeliveryMethodDisplay(method: string): string {
    const methods: Record<string, string> = {
      'pickup': 'Retiro en local',
      'delivery': 'Delivery',
      'table': 'Mesa'
    };
    return methods[method] || method;
  }

  getStatusDisplay(status: string): string {
    const statuses: Record<string, string> = {
      'facturado': 'Facturado',
      'pendiente': 'Pendiente',
      'cancelado': 'Cancelado'
    };
    return statuses[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'facturado': 'success',
      'pendiente': 'warning',
      'cancelado': 'danger'
    };
    return colors[status] || 'secondary';
  }
}

const invoiceService = new InvoiceService();
export default invoiceService; 