import { useState } from 'react';
import type { ABMType } from './useABMData';
import employeeService from '../services/employeeService';
import clientService from '../services/clientService';
import inventoryService from '../services/inventoryService';
import categoryService from '../services/categoryService';
import ingredientService from '../services/ingredientService';

export const useFormData = (type: ABMType, onSuccess: () => void) => {
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
            
            if (formData.product_type === 'inventory') {
              await inventoryService.updateInventoryProduct(selectedItem.id_key, invFormattedData);
            } else {
              await inventoryService.update(selectedItem.id_key, invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = formData;
            await ingredientService.update(selectedItem.id_key, ingredientData);
            break;
          case 'rubro':
            const { category_type: updateCategoryType, type_label: updateTypeLabel, ...updateCategoryData } = formData;
            const cleanUpdateCategoryData = {
              name: updateCategoryData.name,
              description: updateCategoryData.description || '',
              active: updateCategoryData.active !== false,
              parent_id: updateCategoryData.parent_id || null
            };
            
            if (selectedItem.category_type === 'inventory') {
              await categoryService.updateInventoryCategory(selectedItem.id_key, cleanUpdateCategoryData);
            } else {
              await categoryService.update(selectedItem.id_key, cleanUpdateCategoryData);
            }
            break;
        }
      } else {
        switch (type) {
          case 'employee':
            await employeeService.create(formData);
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
            
            if (formData.product_type === 'inventory') {
              await inventoryService.createInventoryProduct(invFormattedData);
            } else {
              await inventoryService.create(invFormattedData);
            }
            break;
          case 'ingrediente':
            const { category: ingCategory, measurement_unit, ...ingredientData } = formData;
            await ingredientService.create(ingredientData);
            break;
          case 'rubro':
            const { category_type, type_label, ...categoryData } = formData;
            const cleanCategoryData = {
              name: categoryData.name,
              description: categoryData.description || '',
              active: categoryData.active !== false,
              parent_id: categoryData.parent_id || null
            };
            
            if (formData.category_type === 'inventory') {
              await categoryService.createInventoryCategory(cleanCategoryData);
            } else {
              await categoryService.create(cleanCategoryData);
            }
            break;
        }
      }
      onSuccess();
    } catch (err) {
      console.error('Error saving data:', err);
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