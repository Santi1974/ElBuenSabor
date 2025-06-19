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
  const [searchTerm, setSearchTerm] = useState<string>('');

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
          if (filterType === 'manufactured') {
            if (searchTerm && searchTerm.trim() !== '') {
              response = await inventoryService.searchManufactured(searchTerm.trim(), offset, itemsPerPage);
            } else {
              response = await inventoryService.getAll(offset, itemsPerPage);
            }
            setData(response.data);
            setTotalItems(response.total);
            setHasNext(response.hasNext);
          } else if (filterType === 'inventory') {
            if (searchTerm && searchTerm.trim() !== '') {
              response = await inventoryService.searchInventoryProducts(searchTerm.trim(), offset, itemsPerPage);
            } else {
              response = await inventoryService.getInventoryProducts(offset, itemsPerPage);
            }
            // Agregar el tipo 'inventory' a cada item para que el DataTable pueda aplicar los indicadores de stock
            const dataWithType = response.data.map((item: any) => ({ ...item, type: 'inventory' }));
            setData(dataWithType);
            setTotalItems(response.total);
            setHasNext(response.hasNext);
          } else {
            // Sin filtro, obtener todos los productos con paginación
            response = await inventoryService.getAllProducts(offset, itemsPerPage);
            setData(response.data);
            setTotalItems(response.total);
            setHasNext(response.hasNext);
          }
          break;
        case 'ingrediente':
          let ingredientResponse;
          if (searchTerm && searchTerm.trim() !== '') {
            ingredientResponse = await ingredientService.search(searchTerm.trim(), offset, itemsPerPage);
          } else {
            ingredientResponse = await ingredientService.getAll(offset, itemsPerPage);
          }
          setData(ingredientResponse.data);
          setTotalItems(ingredientResponse.total);
          setHasNext(ingredientResponse.hasNext);
          break;

        case 'rubro':
          if (filterType === 'manufactured') {
            if (searchTerm && searchTerm.trim() !== '') {
              response = await categoryService.searchManufactured(searchTerm.trim(), offset, itemsPerPage);
            } else {
              response = await categoryService.getAll(offset, itemsPerPage);
            }
            const allManufacturedResponse = await categoryService.getAll(0, 100);
            
            const categoriesWithParent = response.data.map((category: any) => {
              let parentCategoryName = 'Sin categoría padre';
              if (category.parent_id) {
                if (category.parent && category.parent.name) {
                  parentCategoryName = category.parent.name;
                } else {
                  // Buscar en todas las categorías manufactured, no solo en la página actual
                  const parentCategory = allManufacturedResponse.data.find((cat: any) => cat.id_key === category.parent_id);
                  parentCategoryName = parentCategory ? parentCategory.name : 'Categoría padre no encontrada';
                }
              }
              return {
                ...category,
                parent_category_name: parentCategoryName,
                category_type: 'manufactured',
                type_label: 'Producto'
              };
            });
            setData(categoriesWithParent);
            setTotalItems(response.total);
            setHasNext(response.hasNext);
          } else if (filterType === 'inventory') {
            if (searchTerm && searchTerm.trim() !== '') {
              response = await categoryService.searchInventory(searchTerm.trim(), offset, itemsPerPage);
            } else {
              response = await categoryService.getInventoryCategories(offset, itemsPerPage);
            }
            const allInventoryResponse = await categoryService.getInventoryCategories(0, 100);
            
            const categoriesWithParent = response.data.map((category: any) => {
              let parentCategoryName = 'Sin categoría padre';
              if (category.parent_id) {
                if (category.parent && category.parent.name) {
                  parentCategoryName = category.parent.name;
                } else {
                  // Buscar en todas las categorías inventory, no solo en la página actual
                  const parentCategory = allInventoryResponse.data.find((cat: any) => cat.id_key === category.parent_id);
                  parentCategoryName = parentCategory ? parentCategory.name : 'Categoría padre no encontrada';
                }
              }
              return {
                ...category,
                parent_category_name: parentCategoryName,
                category_type: 'inventory',
                type_label: 'Ingrediente'
              };
            });
            setData(categoriesWithParent);
            setTotalItems(response.total);
            setHasNext(response.hasNext);
          } else {
            // Sin filtro, necesitamos hacer ambas llamadas y combinar
            const [manufacturedResponse, inventoryResponse] = await Promise.all([
              categoryService.getAll(offset, itemsPerPage),
              categoryService.getInventoryCategories(offset, itemsPerPage)
            ]);
            
            const allCats = [
              ...manufacturedResponse.data.map((cat: any) => ({ ...cat, category_type: 'manufactured' })),
              ...inventoryResponse.data.map((cat: any) => ({ ...cat, category_type: 'inventory' }))
            ];
            
            const categoriesWithParent = allCats.map((category: any) => {
              let parentCategoryName = 'Sin categoría padre';
              if (category.parent_id && category.parent) {
                parentCategoryName = category.parent.name;
              } else if (category.parent_id) {
                const parentCategory = allCats.find((cat: any) => cat.id_key === category.parent_id);
                parentCategoryName = parentCategory ? parentCategory.name : 'Categoría padre no encontrada';
              }
              return {
                ...category,
                parent_category_name: parentCategoryName,
                type_label: category.category_type === 'manufactured' ? 'Producto' : 'Ingrediente'
              };
            });
            
            setData(categoriesWithParent);
            setTotalItems(manufacturedResponse.total + inventoryResponse.total);
            setHasNext(manufacturedResponse.hasNext || inventoryResponse.hasNext);
          }
          break;
        case 'promotion':
          if (searchTerm && searchTerm.trim() !== '') {
            response = await promotionService.search(searchTerm.trim(), offset, itemsPerPage);
          } else {
            response = await promotionService.getAll(offset, itemsPerPage);
          }
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
  }, [currentPage, type, filterType, searchTerm]);

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
            if (inventoryItemToDelete && (inventoryItemToDelete.product_type === 'inventory' || inventoryItemToDelete.type === 'inventory')) {
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

  const handleSearch = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Reset to first page when searching
  };

  const clearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return {
    data,
    currentPage,
    totalItems,
    hasNext,
    error,
    searchTerm,
    loadData,
    handleDelete,
    handleSearch,
    clearSearch,
    getTotalPages,
    handlePageChange,
    handleNextPage,
    handlePrevPage
  };
}; 