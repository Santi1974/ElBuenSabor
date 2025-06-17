import { useState, useEffect } from 'react';
import employeeService from '../services/employeeService';
import clientService from '../services/clientService';
import inventoryService from '../services/inventoryService';
import categoryService from '../services/categoryService';
import ingredientService from '../services/ingredientService';
import promotionService from '../services/promotionService';
import { handleError, ERROR_MESSAGES } from '../utils/errorHandler';
export type ABMType = 'employee' | 'client' | 'rubro' | 'inventario' | 'ingrediente' | 'promotion';

export const useABMData = (type: ABMType, reloadCategories?: () => Promise<void>, filterType?: string) => {
  const [data, setData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      let response: any;
      const offset = (currentPage - 1) * itemsPerPage;
      
      switch (type) {
        case 'employee':
          response = await employeeService.getAll(offset, itemsPerPage);
          setData(response.data);
          setTotalItems(response.total);
          setHasNext(response.hasNext);
          break;
        case 'client':
          response = await clientService.getAll(offset, itemsPerPage);
          setData(response.data);
          setTotalItems(response.total);
          setHasNext(response.hasNext);
          break;
        case 'inventario':
          const inventoryResponse = await inventoryService.getAllProducts(offset, itemsPerPage);
          let filteredData = inventoryResponse.data;
          
          // Filtrar por tipo si se especifica
          if (filterType) {
            filteredData = inventoryResponse.data.filter((item: any) => {
              if (filterType === 'manufactured') {
                return item.product_type === 'manufactured' || item.type === 'manufactured';
              } else if (filterType === 'inventory') {
                return item.product_type === 'inventory' || item.type === 'inventory';
              }
              return true;
            });
          }
          
          setData(filteredData);
          setTotalItems(filteredData.length);
          setHasNext(false); // Ya que estamos filtrando localmente
          break;
        case 'ingrediente':
          const ingredientResponse = await ingredientService.getAll(offset, itemsPerPage);
          setData(ingredientResponse.data);
          setTotalItems(ingredientResponse.total);
          setHasNext(ingredientResponse.hasNext);
          break;

        case 'rubro':
          const [manufacturedCatsResponse, inventoryCatsResponse] = await Promise.all([
            categoryService.getAll(offset, itemsPerPage),
            categoryService.getInventoryCategories(offset, itemsPerPage)
          ]);
          
          const allCats = [
            ...(Array.isArray(manufacturedCatsResponse.data) ? manufacturedCatsResponse.data : []).map((cat: any) => ({ ...cat, category_type: 'manufactured' })),
            ...(Array.isArray(inventoryCatsResponse.data) ? inventoryCatsResponse.data : []).map((cat: any) => ({ ...cat, category_type: 'inventory' }))
          ];
          
          const categoriesWithParent = allCats.map((category: any) => {
            let parentCategoryName = 'Sin categoría padre';
            if (category.parent_id) {
              const parentCategory = allCats.find((cat: any) => cat.id_key === category.parent_id);
              parentCategoryName = parentCategory ? parentCategory.name : 'Categoría padre no encontrada';
            }
            return {
              ...category,
              parent_category_name: parentCategoryName,
              type_label: category.category_type === 'manufactured' ? 'Producto' : 'Ingrediente'
            };
          });
          
          // Filtrar por tipo si se especifica
          let filteredCategories = categoriesWithParent;
          if (filterType) {
            filteredCategories = categoriesWithParent.filter((category: any) => {
              return category.category_type === filterType;
            });
          }
          
          setData(filteredCategories);
          setTotalItems(filteredCategories.length);
          setHasNext(false); // Ya que estamos filtrando localmente
          break;
        case 'promotion':
          response = await promotionService.getAll(offset, itemsPerPage);
          setData(response.data);
          setTotalItems(response.total);
          setHasNext(response.hasNext);
          break;
        default:
          setData([]);
          setTotalItems(0);
          setHasNext(false);
      }
      setError(null);
    } catch (err) {
      setError(handleError(err, 'load data'));
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentPage, type, filterType]);

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este registro?')) {
      try {
        switch (type) {
          case 'employee':
            await employeeService.delete(id);
            break;
          case 'client':
            await clientService.delete(id);
            break;
          case 'inventario':
            const inventoryItemToDelete = data.find(item => item.id_key === id);
            if (inventoryItemToDelete && inventoryItemToDelete.product_type === 'inventory') {
              await inventoryService.deleteInventoryProduct(id);
            } else {
              await inventoryService.delete(id);
            }
            break;
          case 'ingrediente':
            await ingredientService.delete(id);
            break;

          case 'rubro':
            const itemToDelete = data.find(item => item.id_key === id);
            if (itemToDelete && itemToDelete.category_type === 'inventory') {
              await categoryService.deleteInventoryCategory(id);
            } else {
              await categoryService.delete(id);
            }
            
            if (reloadCategories) {
              await reloadCategories();
            }
            break;
          case 'promotion':
            await promotionService.delete(id);
            break;
        }
        await loadData();
        setError(null);
      } catch (err) {
        setError(handleError(err, 'delete record'));
        console.error('Error deleting data:', err);
      }
    }
  };

  const getTotalPages = () => {
    return Math.ceil(totalItems / itemsPerPage);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    data,
    currentPage,
    totalItems,
    hasNext,
    error,
    loadData,
    handleDelete,
    getTotalPages,
    handlePageChange,
    handleNextPage,
    handlePrevPage
  };
}; 