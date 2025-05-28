import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import employeeService from '../../services/employeeService';
import clientService from '../../services/clientService';
import inventoryService from '../../services/inventoryService';
import categoryService from '../../services/categoryService';

interface GenericABMProps {
  title: string;
  columns: {
    field: string;
    headerName: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: { value: string; label: string }[];
  }[];
  onRowClick?: (item: any) => void;
  type?: 'employee' | 'client' | 'rubro' | 'inventario';
}

const GenericABM: React.FC<GenericABMProps> = ({
  title,
  columns,
  onRowClick,
  type = 'employee'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [parentCategories, setParentCategories] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Image handling for inventory
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Ingredients handling for inventory
  const [availableIngredients, setAvailableIngredients] = useState<any[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (type === 'inventario') {
      loadData();
    }
  }, [currentPage]);

  const loadCategories = async () => {
    if (type === 'inventario') {
      try {
        const categoriesData = await categoryService.getTopLevelAll();
        setCategories(categoriesData);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
  };

  const loadParentCategories = async () => {
    if (type === 'rubro') {
      try {
        const categoriesData = await categoryService.getAll();
        setParentCategories(categoriesData);
      } catch (err) {
        console.error('Error loading parent categories:', err);
      }
    }
  };

  const loadIngredients = async () => {
    if (type === 'inventario') {
      try {
        const ingredientsData = await inventoryService.getIngredients();
        setAvailableIngredients(ingredientsData);
      } catch (err) {
        console.error('Error loading ingredients:', err);
      }
    }
  };

  const loadData = async () => {
    try {
      let response: any;
      switch (type) {
        case 'employee':
          response = await employeeService.getAll();
          break;
        case 'client':
          response = await clientService.getAll();
          break;
        case 'inventario':
          const offset = (currentPage - 1) * itemsPerPage;
          response = await inventoryService.getAll(offset, itemsPerPage);
          const hasMorePages = response.length === itemsPerPage;
          setTotalItems(hasMorePages ? (currentPage * itemsPerPage) + 1 : (currentPage - 1) * itemsPerPage + response.length);
          break;
        case 'rubro':
          response = await categoryService.getAll();
          // Add parent category name for display
          const categoriesWithParent = response.map((category: any) => {
            let parentCategoryName = 'Sin categoría padre';
            if (category.parent_id) {
              const parentCategory = response.find((cat: any) => cat.id_key === category.parent_id);
              parentCategoryName = parentCategory ? parentCategory.name : 'Categoría padre no encontrada';
            }
            return {
              ...category,
              parent_category_name: parentCategoryName
            };
          });
          response = categoriesWithParent;
          break;
        default:
          response = [];
      }
      setData(response);
      setError(null);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error loading data:', err);
    }
  };

  const handleOpenModal = (item?: any) => {
    // Reset category selection first
    resetCategorySelection();
    
    if (item) {
      setSelectedItem(item);
      if (type === 'inventario' && item.category) {
        setFormData({
          ...item,
          category_id: item.category.id_key,
          details: item.details || []
        });
        
        // Transform existing details to match the expected format
        const transformedDetails = (item.details || []).map((detail: any) => ({
          inventory_item_id: detail.inventory_item?.id_key || detail.inventory_item_id || '',
          quantity: detail.quantity || 0,
          temp_id: detail.id_key || Date.now() + Math.random() // Use existing id or generate temp id
        }));
        setSelectedDetails(transformedDetails);
        
        // Find the parent category for existing item
        const parentCategory = categories.find(cat => 
          cat.id_key === item.category.id_key || 
          (cat.subcategories && cat.subcategories.some((sub: any) => sub.id_key === item.category.id_key))
        );
        
        if (parentCategory) {
          if (parentCategory.subcategories && parentCategory.subcategories.length > 0) {
            // If the current category is a subcategory
            const isSubcategory = parentCategory.subcategories.some((sub: any) => sub.id_key === item.category.id_key);
            if (isSubcategory) {
              setSelectedCategory(parentCategory);
              setAvailableSubcategories(parentCategory.subcategories);
            } else {
              setSelectedCategory(item.category);
            }
          }
        }
      } else {
        setFormData(item);
      }
    } else {
      setSelectedItem(null);
      setSelectedDetails([]); // Clear details for new item
      if (type === 'inventario') {
        setFormData({
          name: '',
          description: '',
          preparation_time: 0,
          price: 0,
          image_url: '',
          recipe: '',
          active: true,
          category_id: 0,
          details: []
        });
      } else {
        setFormData({
          name: '',
          description: '',
          active: true,
          parent_id: 0
        });
      }
    }
    
    // Load categories for inventory items
    if (type === 'inventario') {
      loadCategories();
      loadIngredients(); // Load ingredients as well
    }
    
    // Load parent categories for rubro items
    if (type === 'rubro') {
      loadParentCategories();
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
    resetCategorySelection();
    // Clear image state
    setImageFile(null);
    setImagePreview(null);
    // Clear ingredients state
    setSelectedDetails([]);
  };

  const handleOpenViewModal = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewItem(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
            const { category, ...inventoryData } = formData;
            const formattedData = {
              ...inventoryData,
              details: selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            await inventoryService.update(selectedItem.id_key, formattedData);
            break;
          case 'rubro':
            await categoryService.update(selectedItem.id_key, formData);
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
            const { category, ...inventoryData } = formData;
            const formattedData = {
              ...inventoryData,
              details: selectedDetails.map((detail: any) => ({
                inventory_item_id: detail.inventory_item_id || 0,
                quantity: detail.quantity || 0
              }))
            };
            await inventoryService.create(formattedData);
            break;
          case 'rubro':
            await categoryService.create(formData);
            break;
        }
      }
      await loadData();
      handleCloseModal();
      setError(null);
    } catch (err) {
      setError('Error al guardar los datos');
      console.error('Error saving data:', err);
    }
  };

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
            await inventoryService.delete(id);
            break;
          case 'rubro':
            await categoryService.delete(id);
            break;
        }
        await loadData();
        setError(null);
      } catch (err) {
        setError('Error al eliminar el registro');
        console.error('Error deleting data:', err);
      }
    }
  };

  const handleNextPage = () => {
    // Only allow next page if current page has full results (indicating more data might exist)
    if (data.length === itemsPerPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getTotalPages = () => {
    // Since we don't have exact total, we'll estimate based on current data
    if (data.length < itemsPerPage) {
      return currentPage; // This is the last page
    }
    return currentPage + 1; // There might be more pages
  };

  const hasNextPage = () => {
    return data.length === itemsPerPage;
  };

  const handleCategorySelection = (categoryId: string) => {
    const category = categories.find(cat => cat.id_key.toString() === categoryId);
    setSelectedCategory(category);
    
    if (category && category.subcategories && category.subcategories.length > 0) {
      // If category has subcategories, show them for selection
      setAvailableSubcategories(category.subcategories);
      // Don't set category_id yet, wait for subcategory selection
      setFormData((prev: any) => ({ ...prev, category_id: '' }));
    } else {
      // If no subcategories, use this category directly
      setAvailableSubcategories([]);
      setFormData((prev: any) => ({ ...prev, category_id: parseInt(categoryId) }));
    }
  };

  const handleSubcategorySelection = (subcategoryId: string) => {
    setFormData((prev: any) => ({ ...prev, category_id: parseInt(subcategoryId) }));
  };

  const resetCategorySelection = () => {
    setSelectedCategory(null);
    setAvailableSubcategories([]);
    setFormData((prev: any) => ({ ...prev, category_id: '' }));
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // Store base64 in form data
        setFormData((prev: any) => ({ ...prev, image_url: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData((prev: any) => ({ ...prev, image_url: '' }));
  };

  const addIngredient = () => {
    const newDetail = {
      inventory_item_id: '',
      quantity: 1,
      temp_id: Date.now() // Temporary ID for React key
    };
    setSelectedDetails([...selectedDetails, newDetail]);
  };

  const removeIngredient = (index: number) => {
    const updatedDetails = selectedDetails.filter((_, i) => i !== index);
    setSelectedDetails(updatedDetails);
    setFormData((prev: any) => ({ ...prev, details: updatedDetails }));
  };

  const updateIngredientDetail = (index: number, field: string, value: any) => {
    const updatedDetails = [...selectedDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setSelectedDetails(updatedDetails);
    setFormData((prev: any) => ({ ...prev, details: updatedDetails }));
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{title}</h2>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.field} style={{ width: column.width }}>
                  {column.headerName}
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index}
                onClick={() => handleOpenViewModal(item)}
                style={{ cursor: 'pointer' }}
              >
                {columns.map((column) => (
                  <td key={column.field}>
                    {column.type === 'select' && column.field === 'active' 
                      ? (item[column.field] ? 'Sí' : 'No')
                      : column.field === 'image_url' && item[column.field]
                        ? (
                          <img 
                            src={item[column.field]} 
                            alt="Product" 
                            style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                            className="img-thumbnail"
                          />
                        )
                        : column.field === 'description' || column.field === 'recipe'
                          ? (item[column.field] ? 
                              (item[column.field].length > 50 ? 
                                item[column.field].substring(0, 50) + '...' : 
                                item[column.field]
                              ) : ''
                            )
                          : column.field.includes('.')
                            ? column.field.split('.').reduce((obj, key) => obj?.[key], item)
                            : item[column.field]}
                  </td>
                ))}
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id_key);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls for inventory */}
      {type === 'inventario' && (currentPage > 1 || hasNextPage()) && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <div>
            <span className="text-muted">
              Página {currentPage} - Mostrando {data.length} elementos
            </span>
          </div>
          <nav aria-label="Page navigation">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                >
                  Anterior
                </button>
              </li>
              
              <li className="page-item active">
                <span className="page-link">{currentPage}</span>
              </li>
              
              {hasNextPage() && (
                <li className="page-item">
                  <button 
                    className="page-link" 
                    onClick={handleNextPage}
                  >
                    Siguiente
                  </button>
                </li>
              )}
            </ul>
          </nav>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {selectedItem ? 'Editar' : 'Agregar'} {title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {columns
                    .filter(column => 
                      column.field !== 'category.name' && 
                      column.field !== 'parent_category_name' &&
                      (type !== 'inventario' || (
                        column.field !== 'description' && 
                        column.field !== 'recipe' && 
                        column.field !== 'image_url'
                      ))
                    )
                    .map((column) => (
                    <div className="mb-3" key={column.field}>
                      <label className="form-label">{column.headerName}</label>
                      {column.type === 'select' ? (
                        <select
                          className="form-select"
                          value={formData[column.field]?.toString() || ''}
                          onChange={(e) =>
                            handleInputChange(column.field, e.target.value === 'true')
                          }
                        >
                          <option value="">Seleccione...</option>
                          {column.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={column.type || 'text'}
                          className="form-control"
                          value={formData[column.field] || ''}
                          onChange={(e) =>
                            handleInputChange(column.field, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
                  
                  {/* Custom fields for inventory items */}
                  {type === 'inventario' && (
                    <>
                      {/* Description field */}
                      <div className="mb-3">
                        <label className="form-label">Descripción</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={formData.description || ''}
                          onChange={(e) => handleInputChange('description', e.target.value)}
                          placeholder="Describe el producto..."
                        />
                      </div>

                      {/* Recipe field */}
                      <div className="mb-3">
                        <label className="form-label">Receta</label>
                        <textarea
                          className="form-control"
                          rows={4}
                          value={formData.recipe || ''}
                          onChange={(e) => handleInputChange('recipe', e.target.value)}
                          placeholder="Ingredientes y pasos de preparación..."
                        />
                      </div>

                      {/* Image field */}
                      <div className="mb-3">
                        <label className="form-label">Imagen del Producto</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        {imagePreview && (
                          <div className="mt-2">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                              className="img-thumbnail"
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger ms-2"
                              onClick={removeImage}
                            >
                              Eliminar imagen
                            </button>
                          </div>
                        )}
                        {formData.image_url && !imagePreview && (
                          <div className="mt-2">
                            <small className="text-muted">Imagen actual guardada</small>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Category select field for inventory items */}
                  {type === 'inventario' && (
                    <div className="mb-3">
                      <label className="form-label">
                        Categoría {selectedCategory && availableSubcategories.length > 0 && '(Seleccione subcategoría abajo)'}
                      </label>
                      <select
                        className="form-select"
                        value={selectedCategory ? selectedCategory.id_key : ''}
                        onChange={(e) => handleCategorySelection(e.target.value)}
                        required={availableSubcategories.length === 0}
                      >
                        <option value="">Seleccione una categoría...</option>
                        {categories.map((category) => (
                          <option key={category.id_key} value={category.id_key}>
                            {category.name}
                            {category.subcategories && category.subcategories.length > 0 && ' (tiene subcategorías)'}
                          </option>
                        ))}
                      </select>
                      {selectedCategory && availableSubcategories.length === 0 && (
                        <div className="form-text text-success">
                          ✓ Categoría seleccionada: {selectedCategory.name}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Subcategory select field for inventory items */}
                  {type === 'inventario' && selectedCategory && availableSubcategories.length > 0 && (
                    <div className="mb-3">
                      <label className="form-label">
                        Subcategoría de "{selectedCategory.name}"
                      </label>
                      <select
                        className="form-select"
                        value={formData.category_id || ''}
                        onChange={(e) => handleSubcategorySelection(e.target.value)}
                        required
                      >
                        <option value="">Seleccione una subcategoría...</option>
                        {availableSubcategories.map((subcategory) => (
                          <option key={subcategory.id_key} value={subcategory.id_key}>
                            {subcategory.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  {/* Ingredients management for inventory items */}
                  {type === 'inventario' && (
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <label className="form-label mb-0">
                          <strong>Ingredientes del Producto</strong>
                        </label>
                        <button
                          type="button"
                          className="btn btn-sm btn-success"
                          onClick={addIngredient}
                        >
                          <i className="bi bi-plus"></i> Agregar Ingrediente
                        </button>
                      </div>
                      
                      {selectedDetails.length === 0 ? (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle"></i> No hay ingredientes agregados. 
                          Haga clic en "Agregar Ingrediente" para comenzar.
                        </div>
                      ) : (
                        <div className="border rounded p-3">
                          {selectedDetails.map((detail, index) => (
                            <div key={detail.temp_id || detail.id_key || index} className="row g-2 mb-3 align-items-end">
                              <div className="col-6">
                                <label className="form-label small">Ingrediente</label>
                                <select
                                  className="form-select form-select-sm"
                                  value={detail.inventory_item_id || ''}
                                  onChange={(e) => 
                                    updateIngredientDetail(index, 'inventory_item_id', parseInt(e.target.value))
                                  }
                                  required
                                >
                                  <option value="">Seleccione un ingrediente...</option>
                                  {availableIngredients.map((ingredient) => (
                                    <option key={ingredient.id_key} value={ingredient.id_key}>
                                      {ingredient.name} ({ingredient.measurement_unit?.name || 'unidad'})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-4">
                                <label className="form-label small">Cantidad</label>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  min="0"
                                  step="0.1"
                                  value={detail.quantity || ''}
                                  onChange={(e) => 
                                    updateIngredientDetail(index, 'quantity', parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="0"
                                  required
                                />
                              </div>
                              <div className="col-2">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm w-100"
                                  onClick={() => removeIngredient(index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Parent category select field for rubro items */}
                  {type === 'rubro' && (
                    <div className="mb-3">
                      <label className="form-label">Categoría Padre (opcional)</label>
                      <select
                        className="form-select"
                        value={formData.parent_id || ''}
                        onChange={(e) =>
                          handleInputChange('parent_id', e.target.value ? parseInt(e.target.value) : null)
                        }
                      >
                        <option value="">Sin categoría padre</option>
                        {parentCategories
                          .filter(cat => cat.id_key !== formData.id_key) // Don't allow selecting itself as parent
                          .map((category) => (
                          <option key={category.id_key} value={category.id_key}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                      <div className="form-text">
                        Seleccione una categoría padre si esta es una subcategoría
                      </div>
                    </div>
                  )}
                  
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {selectedItem ? 'Guardar' : 'Agregar'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {isViewModalOpen && viewItem && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-eye me-2"></i>
                  Detalles de {title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseViewModal}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-12">
                    {/* Basic Information */}
                    <div className="card mb-3">
                      <div className="card-header">
                        <h6 className="mb-0">
                          <i className="bi bi-info-circle me-2"></i>
                          Información Básica
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row">
                          {columns
                            .filter(column => 
                              !['category.name', 'parent_category_name', 'image_url'].includes(column.field)
                            )
                            .map((column) => (
                            <div key={column.field} className="col-md-6 mb-3">
                              <label className="fw-bold text-muted small">{column.headerName}:</label>
                              <div className="ms-2">
                                {column.type === 'select' && column.field === 'active' 
                                  ? (
                                    <span className={`badge ${viewItem[column.field] ? 'bg-success' : 'bg-danger'}`}>
                                      {viewItem[column.field] ? 'Activo' : 'Inactivo'}
                                    </span>
                                  )
                                  : column.field === 'description' || column.field === 'recipe'
                                    ? (
                                      <div className="p-2 bg-light rounded">
                                        {viewItem[column.field] || 'No especificado'}
                                      </div>
                                    )
                                    : column.field === 'price'
                                      ? `$${viewItem[column.field] || 0}`
                                      : column.field === 'preparation_time'
                                        ? `${viewItem[column.field] || 0} minutos`
                                        : column.field.includes('.')
                                          ? column.field.split('.').reduce((obj, key) => obj?.[key], viewItem) || 'No especificado'
                                          : viewItem[column.field] || 'No especificado'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Image section for inventory items */}
                    {type === 'inventario' && viewItem.image_url && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-image me-2"></i>
                            Imagen del Producto
                          </h6>
                        </div>
                        <div className="card-body text-center">
                          <img 
                            src={viewItem.image_url} 
                            alt={viewItem.name} 
                            style={{ maxWidth: '300px', maxHeight: '300px', objectFit: 'cover' }}
                            className="img-thumbnail"
                          />
                        </div>
                      </div>
                    )}

                    {/* Category information */}
                    {(type === 'inventario' || type === 'rubro') && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-bookmark me-2"></i>
                            Información de Categoría
                          </h6>
                        </div>
                        <div className="card-body">
                          {type === 'inventario' && viewItem.category && (
                            <div>
                              <label className="fw-bold text-muted small">Categoría:</label>
                              <div className="ms-2">
                                <span className="badge bg-primary">{viewItem.category.name}</span>
                              </div>
                            </div>
                          )}
                          {type === 'rubro' && (
                            <div>
                              <label className="fw-bold text-muted small">Categoría Padre:</label>
                              <div className="ms-2">
                                {viewItem.parent_category_name === 'Sin categoría padre' ? (
                                  <span className="badge bg-secondary">Sin categoría padre</span>
                                ) : (
                                  <span className="badge bg-info">{viewItem.parent_category_name}</span>
                                )}
                              </div>
                              {viewItem.subcategories && viewItem.subcategories.length > 0 && (
                                <div className="mt-3">
                                  <label className="fw-bold text-muted small">Subcategorías:</label>
                                  <div className="ms-2 mt-1">
                                    {viewItem.subcategories.map((subcategory: any, index: number) => (
                                      <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                        {subcategory.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ingredients section for inventory items */}
                    {type === 'inventario' && viewItem.details && viewItem.details.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-list-ul me-2"></i>
                            Ingredientes
                          </h6>
                        </div>
                        <div className="card-body">
                          <div className="table-responsive">
                            <table className="table table-sm">
                              <thead>
                                <tr>
                                  <th>Ingrediente</th>
                                  <th>Cantidad</th>
                                  <th>Unidad</th>
                                </tr>
                              </thead>
                              <tbody>
                                {viewItem.details.map((detail: any, index: number) => (
                                  <tr key={index}>
                                    <td>{detail.inventory_item?.name || 'Ingrediente no especificado'}</td>
                                    <td>{detail.quantity}</td>
                                    <td>{detail.inventory_item?.measurement_unit?.name || 'unidad'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Addresses for employees and clients */}
                    {(type === 'employee' || type === 'client') && viewItem.addresses && viewItem.addresses.length > 0 && (
                      <div className="card mb-3">
                        <div className="card-header">
                          <h6 className="mb-0">
                            <i className="bi bi-geo-alt me-2"></i>
                            Direcciones
                          </h6>
                        </div>
                        <div className="card-body">
                          {viewItem.addresses.map((address: any, index: number) => (
                            <div key={index} className="mb-2 p-2 bg-light rounded">
                              <div className="fw-bold">{address.name || 'Dirección'}</div>
                              <div className="text-muted">
                                {address.street} {address.street_number}
                                {address.city && `, ${address.city}`}
                                {address.state && `, ${address.state}`}
                                {address.zip_code && ` - ${address.zip_code}`}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseViewModal}
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenericABM; 