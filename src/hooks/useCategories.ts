import { useState, useEffect } from 'react';
import type { ABMType } from './useABMData';
import categoryService from '../services/categoryService';
import inventoryService from '../services/inventoryService';
import ingredientService from '../services/ingredientService';

export const useCategories = (type: ABMType) => {
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [measurementUnits, setMeasurementUnits] = useState<any[]>([]);

  const loadCategories = async () => {
    if (type === 'inventario' || type === 'ingrediente') {
      try {
        // Para inventario, necesitamos cargar ambos tipos de categorías inicialmente
        // Para ingredientes, solo categorías de inventory
        const categoryType = type === 'ingrediente' ? 'inventory' : 'manufactured';
        const categoriesData = await categoryService.getTopLevelAll(categoryType);
        
        if (categoriesData && categoriesData.items !== undefined) {
          setCategories(Array.isArray(categoriesData.items) ? categoriesData.items : []);
        } else {
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        }
      } catch (err) {
        console.error('Error loading categories:', err);
        setCategories([]);
      }
    }
  };

  const loadCategoriesForProduct = async (productType: string): Promise<any[]> => {
    if (type === 'inventario') {
      try {
        // Limpiar el estado antes de cargar nuevas categorías
        setCategories([]);
        setSelectedCategory(null);
        setAvailableSubcategories([]);
        
        const categoryType = productType === 'inventory' ? 'inventory' : 'manufactured';
        const categoriesData = await categoryService.getTopLevelAll(categoryType);
        
        let newCategories: any[] = [];
        if (categoriesData && categoriesData.items !== undefined) {
          newCategories = Array.isArray(categoriesData.items) ? categoriesData.items : [];
        } else {
          newCategories = Array.isArray(categoriesData) ? categoriesData : [];
        }
        
        setCategories(newCategories);
        
        // Retornar las categorías cargadas
        return newCategories;
      } catch (err) {
        console.error('Error loading categories:', err);
        setCategories([]);
        return [];
      }
    }
    return [];
  };

  const loadParentCategories = async () => {
    if (type === 'rubro') {
      try {
        const [manufacturedCategoriesResponse, inventoryCategoriesResponse] = await Promise.all([
          categoryService.getAll(0, 100),
          categoryService.getInventoryCategories(0, 100)
        ]);
        
        const allCategories = [
          ...(Array.isArray(manufacturedCategoriesResponse.data) ? manufacturedCategoriesResponse.data : []).map((cat: any) => ({ ...cat, category_type: 'manufactured' })),
          ...(Array.isArray(inventoryCategoriesResponse.data) ? inventoryCategoriesResponse.data : []).map((cat: any) => ({ ...cat, category_type: 'inventory' }))
        ];
        
        setParentCategories(allCategories);
      } catch (err) {
        console.error('Error loading parent categories:', err);
        setParentCategories([]);
      }
    }
  };

  // Nueva función para recargar categorías después de operaciones CRUD
  const reloadCategoriesAfterCRUD = async () => {
    try {
      // Recargar categorías según el tipo
      if (type === 'inventario' || type === 'ingrediente') {
        await loadCategories();
      }
      
      // Siempre recargar categorías padre para rubros, ya que pueden ser usadas en otros tipos
      await loadParentCategories();
      
      console.log('Categories reloaded after CRUD operation');
    } catch (err) {
      console.error('Error reloading categories after CRUD:', err);
    }
  };

  const loadIngredients = async () => {
    if (type === 'inventario') {
      try {
        const ingredientsData = await inventoryService.getIngredients();
        setAvailableIngredients(Array.isArray(ingredientsData) ? ingredientsData : []);
      } catch (err) {
        console.error('Error loading ingredients:', err);
        setAvailableIngredients([]);
      }
    }
  };

  const loadMeasurementUnits = async () => {
    if (type === 'ingrediente' || type === 'inventario') {
      try {
        const unitsResponse = await ingredientService.getMeasurementUnits();
        
        if (unitsResponse && unitsResponse.items !== undefined) {
          setMeasurementUnits(Array.isArray(unitsResponse.items) ? unitsResponse.items : []);
        } else {
          setMeasurementUnits(Array.isArray(unitsResponse) ? unitsResponse : []);
        }
      } catch (err) {
        console.error('Error loading measurement units:', err);
        setMeasurementUnits([]);
      }
    }
  };

  const handleCategorySelection = (categoryId: string, formData: any, setFormData: (data: any) => void) => {
    const category = categories.find(cat => cat.id_key.toString() === categoryId);
    setSelectedCategory(category);
    
    if (category && category.subcategories && category.subcategories.length > 0) {
      setAvailableSubcategories(category.subcategories);
      setFormData({ ...formData, category_id: '' });
    } else {
      setAvailableSubcategories([]);
      setFormData({ ...formData, category_id: parseInt(categoryId) });
    }
  };

  const handleSubcategorySelection = (subcategoryId: string, formData: any, setFormData: (data: any) => void) => {
    setFormData({ ...formData, category_id: parseInt(subcategoryId) });
  };

  const resetCategorySelection = () => {
    setSelectedCategory(null);
    setAvailableSubcategories([]);
  };

  const findCategoryForItem = (item: any, categoriesToSearch?: any[]) => {
    if (!item.category) return;

    const searchCategories = categoriesToSearch || categories;

    const parentCategory = searchCategories.find(cat => 
      cat.id_key === item.category.id_key || 
      (cat.subcategories && cat.subcategories.some((sub: any) => sub.id_key === item.category.id_key))
    );
    
    if (parentCategory) {
      if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
        const isSubcategory = parentCategory.subcategories.some((sub: any) => sub.id_key === item.category.id_key);
        if (isSubcategory) {
          setSelectedCategory(parentCategory);
          setAvailableSubcategories(parentCategory.subcategories);
        } else {
          setSelectedCategory(item.category);
        }
      } else {
        setSelectedCategory(item.category);
      }
    }
  };

  // Load initial data based on type
  useEffect(() => {
    if (type === 'ingrediente') {
      loadCategories();
      loadMeasurementUnits();
    }
    
    if (type === 'inventario') {
      loadCategories();
      loadMeasurementUnits();
      loadIngredients();
    }

    if (type === 'rubro') {
      loadParentCategories();
    }
  }, [type]);

  return {
    categories,
    selectedCategory,
    availableSubcategories,
    parentCategories,
    availableIngredients,
    measurementUnits,
    loadCategories,
    loadCategoriesForProduct,
    loadParentCategories,
    loadIngredients,
    loadMeasurementUnits,
    reloadCategoriesAfterCRUD,
    handleCategorySelection,
    handleSubcategorySelection,
    resetCategorySelection,
    findCategoryForItem
  };
}; 