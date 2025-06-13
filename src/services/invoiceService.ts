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

export interface InventoryDetail {
  id_key: number;
  quantity: number;
  subtotal: number;
  unit_price: number;
  inventory_item: {
    id_key: number;
    name: string;
    price: number;
  };
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
  inventory_details: InventoryDetail[];
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
      link.download = `${invoice.type === 'factura' ? 'factura' : 'nota-credito'}-${invoice.number}.pdf`;
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

  // Method to cancel invoice (create credit note)
  async cancelInvoice(invoiceId: number): Promise<Invoice> {
    try {
      const response = await api.post<Invoice>(`/invoice/credit-note/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error canceling invoice:', error);
      throw error;
    }
  }

  // Method to find and download invoice PDF by order ID
  async downloadInvoiceByOrderId(orderId: number): Promise<{ success: boolean; message: string }> {
    try {
      let offset = 0;
      const limit = 100;
      let foundInvoice: Invoice | null = null;

      while (!foundInvoice) {
        const result = await this.getAll(offset, limit);
        
        foundInvoice = result.data.find(invoice => invoice.order.id_key === orderId) || null;
        
        if (!foundInvoice && !result.hasNext) {
          return {
            success: false,
            message: `No se encontró factura para la orden ${orderId}`
          };
        }
        
        if (!foundInvoice && result.hasNext) {
          offset += limit;
        }
      }

      if (foundInvoice) {
        await this.downloadPDF(foundInvoice);
        return {
          success: true,
          message: `Factura ${foundInvoice.number} descargada exitosamente para la orden ${orderId}`
        };
      }

      return {
        success: false,
        message: `No se encontró factura para la orden ${orderId}`
      };

    } catch (error) {
      console.error('Error searching and downloading invoice by order ID:', error);
      return {
        success: false,
        message: `Error al buscar factura para la orden ${orderId}: ${error instanceof Error ? error.message : 'Error desconocido'}`
      };
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
      'cancelado': 'Cancelado',
      'a_confirmar': 'A confirmar',
      'en_preparacion': 'En preparación',
      'en_delivery': 'En delivery',
      'entregado': 'Entregado'
    };
    return statuses[status] || status;
  }

  getInvoiceTypeDisplay(type: string): string {
    const types: Record<string, string> = {
      'factura': 'Factura',
      'nota_credito': 'Nota de Crédito'
    };
    return types[type] || type;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      'facturado': 'success',
      'pendiente': 'warning',
      'cancelado': 'danger',
      'a_confirmar': 'secondary',
      'en_preparacion': 'info',
      'en_delivery': 'primary',
      'entregado': 'success'
    };
    return colors[status] || 'secondary';
  }
}

const invoiceService = new InvoiceService();
export default invoiceService; 