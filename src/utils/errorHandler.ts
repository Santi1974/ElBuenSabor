/**
 * Utilidad para el manejo centralizado de errores de API
 */

export interface ApiError {
  response?: {
    data?: {
      detail?: string;
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

/**
 * Extrae el mensaje de error de una respuesta de API
 * @param error - Error capturado en catch
 * @param fallbackMessage - Mensaje por defecto si no se encuentra detail
 * @returns Mensaje de error formateado
 */
export const getErrorMessage = (error: any, fallbackMessage?: string): string => {
  // Si el error viene con detail como string
  if (typeof error?.response?.data?.detail === 'string') {
    return error.response.data.detail;
  }

  // Si el error viene con detail como array de mensajes
  if (Array.isArray(error?.response?.data?.detail)) {
    return error.response.data.detail[0]?.msg || error.response.data.detail[0] || fallbackMessage || ERROR_MESSAGES.GENERIC;
  }

  // Si el error viene con detail como objeto
  if (error?.response?.data?.detail && typeof error.response.data.detail === 'object') {
    return error.response.data.detail.message || fallbackMessage || ERROR_MESSAGES.GENERIC;
  }

  // Si el error tiene un mensaje directo
  if (error?.message) {
    return error.message;
  }

  // Si hay un mensaje de fallback, usarlo
  if (fallbackMessage) {
    return fallbackMessage;
  }

  // Mensaje genérico por defecto
  return ERROR_MESSAGES.GENERIC;
};

/**
 * Mensajes de error genéricos por categoría
 */
export const ERROR_MESSAGES = {
  // Autenticación
  LOGIN: 'Error al iniciar sesión. Verifique sus credenciales.',
  REGISTER: 'Error al registrar usuario. Intente nuevamente.',
  LOGOUT: 'Error al cerrar sesión.',
  CHANGE_PASSWORD: 'Error al cambiar la contraseña.',
  
  // CRUD Genérico
  CREATE: 'Error al crear el registro.',
  UPDATE: 'Error al actualizar el registro.',
  DELETE: 'Error al eliminar el registro.',
  FETCH: 'Error al cargar los datos.',
  
  // Específicos
  LOAD_PROFILE: 'Error al cargar el perfil de usuario.',
  UPDATE_PROFILE: 'Error al actualizar el perfil.',
  LOAD_ADDRESSES: 'Error al cargar las direcciones.',
  SAVE_ADDRESS: 'Error al guardar la dirección.',
  DELETE_ADDRESS: 'Error al eliminar la dirección.',
  
  // Inventario
  LOAD_INVENTORY: 'Error al cargar el inventario.',
  UPDATE_STOCK: 'Error al actualizar el stock.',
  
  // Órdenes
  LOAD_ORDERS: 'Error al cargar las órdenes.',
  UPDATE_ORDER: 'Error al actualizar la orden.',
  CREATE_ORDER: 'Error al crear la orden.',
  
  // Reportes
  LOAD_REPORTS: 'Error al cargar los reportes.',
  
  // Facturas
  LOAD_INVOICES: 'Error al cargar las facturas.',
  CREATE_INVOICE: 'Error al crear la factura.',
  
  // Ingredientes
  LOAD_INGREDIENTS: 'Error al cargar los ingredientes.',
  
  // Categorías
  LOAD_CATEGORIES: 'Error al cargar las categorías.',
  
  // Empleados
  LOAD_EMPLOYEES: 'Error al cargar los empleados.',
  
  // Clientes
  LOAD_CLIENTS: 'Error al cargar los clientes.',

  // Productos
  LOAD_PRODUCTS: 'Error al cargar los productos.',
  ADD_TO_CART: 'Error al agregar el producto al carrito.',

  // Genérico
  GENERIC: 'Ha ocurrido un error inesperado. Por favor, intente nuevamente.',
  NETWORK: 'Error de conexión. Verifique su conexión a internet.',
  SERVER: 'Error del servidor. Intente nuevamente más tarde.'
};

/**
 * Determina el tipo de error basado en el código de estado HTTP
 * @param error - Error capturado
 * @returns Mensaje específico según el tipo de error
 */
export const getErrorByStatus = (error: any): string => {
  const status = error?.response?.status;

  switch (status) {
    case 400:
      return getErrorMessage(error, 'Solicitud inválida. Verifique los datos ingresados.');
    case 401:
      return getErrorMessage(error, 'No autorizado. Por favor, inicie sesión nuevamente.');
    case 403:
      return getErrorMessage(error, 'No tiene permisos para realizar esta acción.');
    case 404:
      return getErrorMessage(error, 'El recurso solicitado no fue encontrado.');
    case 409:
      return getErrorMessage(error, 'Conflicto con el estado actual del recurso.');
    case 422:
      return getErrorMessage(error, 'Los datos proporcionados no son válidos.');
    case 500:
      return getErrorMessage(error, ERROR_MESSAGES.SERVER);
    case 502:
    case 503:
    case 504:
      return getErrorMessage(error, ERROR_MESSAGES.NETWORK);
    default:
      return getErrorMessage(error, ERROR_MESSAGES.GENERIC);
  }
};

/**
 * Función helper para manejo de errores en try-catch
 * @param error - Error capturado
 * @param context - Contexto o acción que falló
 * @returns Mensaje de error formateado
 */
export const handleError = (error: any, context?: string): string => {
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // Si no hay conexión a internet
  if (!navigator.onLine) {
    return 'Sin conexión a internet. Verifique su conexión.';
  }

  // Si es un error de red
  if (error?.code === 'NETWORK_ERROR' || error?.name === 'NetworkError') {
    return ERROR_MESSAGES.NETWORK;
  }

  // Usar el manejo por status HTTP
  return getErrorByStatus(error);
};

export default {
  getErrorMessage,
  getErrorByStatus,
  handleError,
  ERROR_MESSAGES
}; 