import { useState } from 'react';
import type { ABMType } from './useABMData';
import employeeService from '../services/employeeService';
import clientService from '../services/clientService';
import inventoryService from '../services/inventoryService';
import categoryService from '../services/categoryService';
import ingredientService from '../services/ingredientService';
import inventoryPurchaseService from '../services/inventoryPurchaseService';
import { handleError, ERROR_MESSAGES } from '../utils/errorHandler';

export const useFormData = (type: ABMType, onSuccess: () => void, reloadCategories?: () => Promise<void>) => {
  const [formData, setFormData] = useState<any>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [selectedDetails, setSelectedDetails] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const initializeFormData = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      if (type === 'inventario' && item.category) {
        const transformedDetails = (item.details || []).map((detail: any) => ({
          inventory_item_id: detail.inventory_item?.id_key || detail.inventory_item_id || '',
          quantity: detail.quantity || 0,
          temp_id: detail.id_key || Date.now() + Math.random()
        }));
        setSelectedDetails(transformedDetails);
        setFormData({
          ...item,
          category_id: item.category.id_key,
          details: item.details || [],
          measurement_unit_id: item.measurement_unit?.id_key || 0
        });
      } else if (type === 'ingrediente' && item.category) {
        setFormData({
          ...item,
          category_id: item.category.id_key,
          measurement_unit_id: item.measurement_unit?.id_key
        });
      } else if (type === 'employee' || type === 'client') {
        setFormData({
          ...item,
          password: '' // Keep password empty for security when editing
        });
      } else {
        setFormData(item);
      }
    } else {
      setSelectedItem(null);
      setSelectedDetails([]);
      switch (type) {
        case 'inventario':
          setFormData({
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
          });
          break;
        case 'ingrediente':
          setFormData({
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
          });
          break;

        case 'employee':
          setFormData({
            full_name: '',
            email: '',
            role: '',
            phone_number: '',
            password: '',
            active: true
          });
          break;
        case 'client':
          setFormData({
            full_name: '',
            email: '',
            role: 'cliente',
            phone_number: '',
            password: '',
            active: true
          });
          break;
        default:
          setFormData({
            name: '',
            description: '',
            active: true,
            parent_id: 0
          });
      }
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData((prev: any) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev: any) => ({ ...prev, image_url: '' }));
    setImagePreview(null);
  };

  const handleSubmit = async () => {
    try {
      if (selectedItem) {
        switch (type) {
          case 'employee':
            await employeeService.update(selectedItem.id_key, formData);
            break;
          case 'client':
            await clientService.update(selectedItem.id_key, formData);
            break;
          case 'inventario':
            const { category: invCategory, product_type: invProdType, type_label: invProdLabel, ...invData } = formData;
            const invFormattedData = {
              ...invData,
              details: selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            
            // Verificar el tipo del producto existente (selectedItem) no el formData
            // selectedItem.product_type o selectedItem.type indica si es 'inventory' o 'manufactured'
            const isInventoryProduct = selectedItem.product_type === 'inventory' || selectedItem.type === 'inventory';
            
            if (isInventoryProduct) {
              await inventoryService.updateInventoryProduct(selectedItem.id_key, invFormattedData);
              
              // Si se incrementó el stock, crear un registro de compra por la diferencia
              if (formData.current_stock > selectedItem.current_stock) {
                const stockDifference = formData.current_stock - selectedItem.current_stock;
                const inventoryPurchase = {
                  inventory_item_id: selectedItem.id_key,
                  quantity: stockDifference,
                  unit_cost: formData.purchase_cost || 0,
                  total_cost: stockDifference * (formData.purchase_cost || 0),
                  notes: `Actualización de stock - Incremento: ${stockDifference} unidades`,
                  purchase_date: new Date().toISOString()
                };
                
                try {
                  await inventoryPurchaseService.create(inventoryPurchase);
                  console.log('Inventory purchase created for inventory product stock update:', selectedItem.id_key);
                } catch (purchaseError) {
                  console.error('Error creating inventory purchase for inventory product stock update:', purchaseError);
                  // No interrumpir el proceso si falla la creación de la compra
                }
              }
            } else {
              // Es un producto manufacturado, usar el endpoint correcto
              await inventoryService.update(selectedItem.id_key, invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = formData;
            // Incluir el current_stock original para mantener la integridad de los datos
            const ingredientUpdateData = {
              ...ingredientData,
              current_stock: selectedItem.current_stock // Mantener el stock actual sin cambios
            };
            await ingredientService.update(selectedItem.id_key, ingredientUpdateData);
            break;
          case 'rubro':
            await categoryService.update(selectedItem.id_key, formData);
            break;
        }
      } else {
        switch (type) {
          case 'employee':
            try {
              await employeeService.create(formData);
              // Mostrar mensaje con las credenciales
              alert(`Empleado creado exitosamente!\n\nCredenciales de acceso:\nEmail: ${formData.email}\nContraseña: ${formData.password}\n\nEl empleado deberá cambiar su contraseña en el primer login.`);
            } catch (err: any) {
              // Si es un error de validación de contraseña, mostrarlo
              if (err.message && err.message.includes('contraseña')) {
                throw new Error(err.message);
              }
              // Si es otro tipo de error, usar el mensaje genérico
              throw new Error(handleError(err, 'create employee'));
            }
            break;
          case 'client':
            await clientService.create(formData);
            break;
          case 'inventario':
            const { category: invCategory, product_type: invProdType, type_label: invProdLabel, ...invData } = formData;
            const invFormattedData = {
              ...invData,
              details: selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            
            let createdInventoryItem;
            if (formData.product_type === 'inventory') {
              createdInventoryItem = await inventoryService.createInventoryProduct(invFormattedData);
              
              // Si hay stock inicial, crear un registro de compra
              if (formData.current_stock > 0) {
                const inventoryPurchase = {
                  inventory_item_id: createdInventoryItem.id_key,
                  quantity: formData.current_stock,
                  unit_cost: formData.purchase_cost || 0,
                  total_cost: formData.current_stock * (formData.purchase_cost || 0),
                  notes: `Stock inicial - ${formData.current_stock} unidades`,
                  purchase_date: new Date().toISOString()
                };
                
                try {
                  await inventoryPurchaseService.create(inventoryPurchase);
                  console.log('Inventory purchase created for new inventory product:', createdInventoryItem.id_key);
                } catch (purchaseError) {
                  console.error('Error creating inventory purchase for new inventory product:', purchaseError);
                  // No interrumpir el proceso si falla la creación de la compra
                }
              }
            } else {
              createdInventoryItem = await inventoryService.create(invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = formData;
            await ingredientService.create(ingredientData);
            break;
          case 'rubro':
            await categoryService.create(formData);
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
    setFormData({});
    setSelectedItem(null);
    setSelectedDetails([]);
    setImagePreview(null);
  };

  return {
    formData,
    selectedItem,
    selectedDetails,
    setSelectedDetails,
    imagePreview,
    initializeFormData,
    handleInputChange,
    handleImageChange,
    removeImage,
    handleSubmit,
    resetForm
  };
}; 