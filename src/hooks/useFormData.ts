import { useState } from 'react';
import type { ABMType } from './useABMData';
import employeeService from '../services/employeeService';
import clientService from '../services/clientService';
import inventoryService from '../services/inventoryService';
import categoryService from '../services/categoryService';
import ingredientService from '../services/ingredientService';
import inventoryPurchaseService from '../services/inventoryPurchaseService';
import { handleError, ERROR_MESSAGES } from '../utils/errorHandler';

interface FormDataState {
  formData: any;
  selectedItem: any;
  selectedDetails: any[];
  imagePreview: string | null;
  passwordConfirm?: string;
  passwordError?: string;
}

export const useFormData = (type: ABMType, onSuccess: () => void, reloadCategories?: () => Promise<void>) => {
  const [state, setState] = useState<FormDataState>({
    formData: {},
    selectedItem: null,
    selectedDetails: [],
    imagePreview: null,
    passwordConfirm: '',
    passwordError: ''
  });

  const initializeFormData = (item?: any) => {
    if (item) {
      setState(prev => ({
        ...prev,
        selectedItem: item,
        formData: type === 'inventario' && item.category
          ? {
              ...item,
              category_id: item.category.id_key,
              details: item.details || [],
              measurement_unit_id: item.measurement_unit?.id_key || 0
            }
          : type === 'ingrediente' && item.category
          ? {
              ...item,
              category_id: item.category.id_key,
              measurement_unit_id: item.measurement_unit?.id_key
            }
          : type === 'employee' || type === 'client'
          ? {
              ...item,
              password: '' // Keep password empty for security when editing
            }
          : item,
        selectedDetails: type === 'inventario' && item.category
          ? (item.details || []).map((detail: any) => ({
              inventory_item_id: detail.inventory_item?.id_key || detail.inventory_item_id || '',
              quantity: detail.quantity || 0,
              temp_id: detail.id_key || Date.now() + Math.random()
            }))
          : [],
        passwordConfirm: '',
        passwordError: ''
      }));
    } else {
      setState(prev => ({
        ...prev,
        selectedItem: null,
        selectedDetails: [],
        formData: type === 'inventario'
          ? {
              name: '',
              description: '',
              preparation_time: 0,
              price: 0,
              image_url: '',
              recipe: '',
              active: true,
              category_id: 0,
              details: [],
              product_type: '',
              current_stock: 0,
              minimum_stock: 0,
              purchase_cost: 0,
              measurement_unit_id: 0,
              is_ingredient: false
            }
          : type === 'ingrediente'
          ? {
              name: '',
              current_stock: 0,
              minimum_stock: 0,
              price: 0,
              purchase_cost: 0,
              image_url: '',
              active: true,
              is_ingredient: true,
              category_id: 0,
              measurement_unit_id: 0
            }
          : type === 'employee'
          ? {
              full_name: '',
              email: '',
              role: '',
              phone_number: '',
              password: '',
              active: true
            }
          : type === 'client'
          ? {
              full_name: '',
              email: '',
              role: 'cliente',
              phone_number: '',
              password: '',
              active: true
            }
          : {
              name: '',
              description: '',
              active: true,
              parent_id: 0
            },
        passwordConfirm: '',
        passwordError: ''
      }));
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setState(prev => {
      // Si es un campo de contraseña, validar coincidencia
      if (field === 'password' && type === 'employee' && !prev.selectedItem) {
        const error = value !== prev.passwordConfirm ? 'Las contraseñas no coinciden' : '';
        return {
          ...prev,
          formData: { ...prev.formData, [field]: value },
          passwordError: error
        };
      }
      return {
        ...prev,
        formData: { ...prev.formData, [field]: value }
      };
    });
  };

  const handlePasswordConfirmChange = (value: string) => {
    setState(prev => ({
      ...prev,
      passwordConfirm: value,
      passwordError: value !== prev.formData.password ? 'Las contraseñas no coinciden' : ''
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setState(prev => ({
          ...prev,
          imagePreview: result,
          formData: { ...prev.formData, image_url: result }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setState(prev => ({
      ...prev,
      imagePreview: null,
      formData: { ...prev.formData, image_url: '' }
    }));
  };

  const handleSubmit = async () => {
    try {
      // Validar coincidencia de contraseñas para empleados nuevos
      if (type === 'employee' && !state.selectedItem && state.formData.password !== state.passwordConfirm) {
        throw new Error('Las contraseñas no coinciden');
      }

      if (state.selectedItem) {
        switch (type) {
          case 'employee':
            await employeeService.update(state.selectedItem.id_key, state.formData);
            break;
          case 'client':
            await clientService.update(state.selectedItem.id_key, state.formData);
            break;
          case 'inventario':
            const { category: invCategory, product_type: invProdType, type_label: invProdLabel, ...invData } = state.formData;
            const invFormattedData = {
              ...invData,
              details: state.selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            
            const isInventoryProduct = state.selectedItem.product_type === 'inventory' || state.selectedItem.type === 'inventory';
            
            if (isInventoryProduct) {
              await inventoryService.updateInventoryProduct(state.selectedItem.id_key, invFormattedData);
              
              if (state.formData.current_stock > state.selectedItem.current_stock) {
                const stockDifference = state.formData.current_stock - state.selectedItem.current_stock;
                const inventoryPurchase = {
                  inventory_item_id: state.selectedItem.id_key,
                  quantity: stockDifference,
                  unit_cost: state.formData.purchase_cost || 0,
                  total_cost: stockDifference * (state.formData.purchase_cost || 0),
                  notes: `Actualización de stock - Incremento: ${stockDifference} unidades`,
                  purchase_date: new Date().toISOString()
                };
                
                try {
                  await inventoryPurchaseService.create(inventoryPurchase);
                  console.log('Inventory purchase created for inventory product stock update:', state.selectedItem.id_key);
                } catch (purchaseError) {
                  console.error('Error creating inventory purchase for inventory product stock update:', purchaseError);
                }
              }
            } else {
              await inventoryService.update(state.selectedItem.id_key, invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = state.formData;
            const ingredientUpdateData = {
              ...ingredientData,
              current_stock: state.selectedItem.current_stock
            };
            await ingredientService.update(state.selectedItem.id_key, ingredientUpdateData);
            break;
          case 'rubro':
            await categoryService.update(state.selectedItem.id_key, state.formData);
            break;
        }
      } else {
        switch (type) {
          case 'employee':
            try {
              await employeeService.create(state.formData);
              alert(`Empleado creado exitosamente!\n\nCredenciales de acceso:\nEmail: ${state.formData.email}\nContraseña: ${state.formData.password}\n\nEl empleado deberá cambiar su contraseña en el primer login.`);
            } catch (err: any) {
              if (err.message && err.message.includes('contraseña')) {
                throw new Error(err.message);
              }
              throw new Error(handleError(err, 'create employee'));
            }
            break;
          case 'client':
            await clientService.create(state.formData);
            break;
          case 'inventario':
            const { category: invCategory, product_type: invProdType, type_label: invProdLabel, ...invData } = state.formData;
            const invFormattedData = {
              ...invData,
              details: state.selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            
            let createdInventoryItem;
            if (state.formData.product_type === 'inventory') {
              createdInventoryItem = await inventoryService.createInventoryProduct(invFormattedData);
              
              if (state.formData.current_stock > 0) {
                const inventoryPurchase = {
                  inventory_item_id: createdInventoryItem.id_key,
                  quantity: state.formData.current_stock,
                  unit_cost: state.formData.purchase_cost || 0,
                  total_cost: state.formData.current_stock * (state.formData.purchase_cost || 0),
                  notes: `Stock inicial - ${state.formData.current_stock} unidades`,
                  purchase_date: new Date().toISOString()
                };
                
                try {
                  await inventoryPurchaseService.create(inventoryPurchase);
                  console.log('Inventory purchase created for new inventory product:', createdInventoryItem.id_key);
                } catch (purchaseError) {
                  console.error('Error creating inventory purchase for new inventory product:', purchaseError);
                }
              }
            } else {
              createdInventoryItem = await inventoryService.create(invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = state.formData;
            await ingredientService.create(ingredientData);
            break;
          case 'rubro':
            await categoryService.create(state.formData);
            break;
        }
      }
      onSuccess();
    } catch (err: any) {
      console.error('Error in handleSubmit:', err);
      throw err;
    }
  };

  const resetForm = () => {
    setState({
      formData: {},
      selectedItem: null,
      selectedDetails: [],
      imagePreview: null,
      passwordConfirm: '',
      passwordError: ''
    });
  };

  return {
    formData: state.formData,
    selectedItem: state.selectedItem,
    selectedDetails: state.selectedDetails,
    imagePreview: state.imagePreview,
    passwordConfirm: state.passwordConfirm,
    passwordError: state.passwordError,
    initializeFormData,
    handleInputChange,
    handlePasswordConfirmChange,
    handleImageChange,
    removeImage,
    handleSubmit,
    resetForm
  };
};

export default useFormData; 