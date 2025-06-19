import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useABMData } from '../../hooks/useABMData';
import type { ABMType } from '../../hooks/useABMData';
import { useFormData } from '../../hooks/useFormData';
import { useCategories } from '../../hooks/useCategories';
import DataTable from './DataTable';
import PaginationControls from './PaginationControls';
import FormFields from './FormFields';
import InventoryFormFields from './InventoryFormFields';
import IngredientFormFields from './IngredientFormFields';
import CategoryFormFields from './CategoryFormFields';
import PromotionFormFields from './PromotionFormFields';
import ViewModal from './ViewModal';
import AddInventoryModal from '../AddInventoryModal';
import { authService } from '../../services/api';

interface GenericABMProps {
  title: string;
  columns: {
    field: string;
    headerName: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'select' | 'password';
    options?: { value: string; label: string }[];
  }[];
  type?: ABMType;
  onViewOrders?: (item: any) => void;
  filterType?: string;
}

const GenericABM: React.FC<GenericABMProps> = ({
  title,
  columns,
  type = 'employee',
  onViewOrders,
  filterType
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isFormValid, setIsFormValid] = useState(true);
  const [searchInput, setSearchInput] = useState<string>('');

  const {
    categories,
    selectedCategory,
    availableSubcategories,
    parentCategories,
    availableIngredients,
    measurementUnits,
    loadCategoriesForProduct,
    reloadCategoriesAfterCRUD,
    handleCategorySelection,
    handleSubcategorySelection,
    resetCategorySelection,
    findCategoryForItem
  } = useCategories(type);

  const {
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
  } = useABMData(type, reloadCategoriesAfterCRUD, filterType);

  const {
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
  } = useFormData(type, () => {
    loadData();
    handleCloseModal();
    setFormError(null);
  }, reloadCategoriesAfterCRUD);

  const handleOpenModal = async (item?: any) => {
    resetCategorySelection();
    initializeFormData(item);
    
    // Para inventario, cargar las categorías correctas ANTES de buscar la categoría del item
    if (type === 'inventario' && item) {
      if (item.product_type) {
        const loadedCategories = await loadCategoriesForProduct(item.product_type);
        findCategoryForItem(item, loadedCategories);
      } else if (item.type) {
        const loadedCategories = await loadCategoriesForProduct(item.type);
        findCategoryForItem(item, loadedCategories);
      } else {
        findCategoryForItem(item);
      }
    } else if (item && (type === 'inventario' || type === 'ingrediente')) {
      // Para ingredientes o inventario sin product_type específico
      findCategoryForItem(item);
    }
    
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    resetCategorySelection();
    setFormError(null);
    setIsFormValid(true);
  };

  const handleOpenViewModal = (item: any) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewItem(null);
  };

  const handleOpenAddInventoryModal = (item?: any) => {
    setSelectedStockItem(item);
    setIsAddInventoryModalOpen(true);
  };

  const handleCloseAddInventoryModal = () => {
    setIsAddInventoryModalOpen(false);
    setSelectedStockItem(null);
  };

  const handleInventorySuccess = () => {
    loadData(); // Recargar datos después de agregar inventario
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await handleSubmit();
    } catch (err) {
      setFormError('Error al guardar los datos');
    }
  };

  const handleProductTypeChange = async (productType: string) => {
    handleInputChange('product_type', productType);
    if (type === 'inventario' && productType) {
      await loadCategoriesForProduct(productType);
      resetCategorySelection();
    }
  };

  const addIngredient = () => {
    const newDetail = {
      inventory_item_id: '',
      quantity: 1,
      temp_id: Date.now()
    };
    setSelectedDetails([...selectedDetails, newDetail]);
  };

  const removeIngredient = (index: number) => {
    const updatedDetails = selectedDetails.filter((_, i) => i !== index);
    setSelectedDetails(updatedDetails);
  };

  const updateIngredientDetail = (index: number, field: string, value: any) => {
    const updatedDetails = [...selectedDetails];
    updatedDetails[index] = { ...updatedDetails[index], [field]: value };
    setSelectedDetails(updatedDetails);
  };

  // Category handlers with form data binding
  const handleCategorySelectionWithForm = (categoryId: string) => {
    handleCategorySelection(categoryId, formData, (data) => {
      Object.keys(data).forEach(key => {
        handleInputChange(key, data[key]);
      });
    });
  };

  const handleSubcategorySelectionWithForm = (subcategoryId: string) => {
    handleSubcategorySelection(subcategoryId, formData, (data) => {
      Object.keys(data).forEach(key => {
        handleInputChange(key, data[key]);
      });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    clearSearch();
  };

  // Sincronizar searchInput con searchTerm cuando se limpia externamente
  useEffect(() => {
    if (!searchTerm) {
      setSearchInput('');
    }
  }, [searchTerm]);

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{title}</h2>
        <div>
          {(type === 'inventario' || type === 'ingrediente') && (
            <button
              className="btn btn-success me-2"
              onClick={handleOpenAddInventoryModal}
            >
              <i className="bi bi-box-arrow-in-down me-2"></i>
              Modificar Inventario
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
            disabled={type === 'client'}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Agregar
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {/* Search Bar - Para ingredientes, rubros, inventario, promociones, clientes y empleados */}
      {(type === 'ingrediente' || type === 'rubro' || type === 'inventario' || type === 'promotion' || type === 'client' || type === 'employee') && (
        <div className="row mb-3">
          <div className="col-md-6">
            <form onSubmit={handleSearchSubmit} className="d-flex">
              <input
                type="text"
                className="form-control me-2"
                placeholder={
                  type === 'ingrediente' ? "Buscar ingredientes..." : 
                  type === 'rubro' ? "Buscar rubros..." : 
                  type === 'promotion' ? "Buscar promociones..." :
                  type === 'client' ? "Buscar clientes..." :
                  type === 'employee' ? "Buscar empleados..." :
                  "Buscar productos..."
                }
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button 
                type="submit" 
                className="btn btn-outline-primary me-2"
                disabled={!searchInput.trim()}
              >
                <i className="bi bi-search"></i>
              </button>
              {searchTerm && (
                <button 
                  type="button" 
                  className="btn btn-outline-secondary"
                  onClick={handleClearSearch}
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </form>
          </div>
          {searchTerm && (
            <div className="col-md-6">
              <div className="alert alert-info mb-0 py-2">
                <small>Buscando: "{searchTerm}" - {totalItems} resultado(s) encontrado(s)</small>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onEdit={(item) => handleOpenModal(item)}
        onDelete={handleDelete}
        onView={handleOpenViewModal}
        onAddStock={handleOpenAddInventoryModal}
        onViewOrders={onViewOrders}
        type={type}
      />

      {/* Pagination */}
      <PaginationControls
        currentPage={currentPage}
        totalItems={totalItems}
        hasNext={hasNext}
        dataLength={data.length}
        getTotalPages={getTotalPages}
        onPageChange={handlePageChange}
        onNextPage={handleNextPage}
        onPrevPage={handlePrevPage}
      />

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
                {formError && (
                  <div className="alert alert-danger" role="alert">
                    {formError}
                  </div>
                )}
                <form onSubmit={handleFormSubmit}>
                  {/* Basic Form Fields */}
                  {type === 'inventario' ? (
                    <InventoryFormFields
                      formData={formData}
                      selectedItem={selectedItem}
                      selectedDetails={selectedDetails}
                      availableIngredients={availableIngredients}
                      measurementUnits={measurementUnits}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      availableSubcategories={availableSubcategories}
                      imagePreview={imagePreview}
                      onInputChange={handleInputChange}
                      onProductTypeChange={handleProductTypeChange}
                      onCategorySelection={handleCategorySelectionWithForm}
                      onSubcategorySelection={handleSubcategorySelectionWithForm}
                      onImageChange={handleImageChange}
                      onRemoveImage={removeImage}
                      onAddIngredient={addIngredient}
                      onRemoveIngredient={removeIngredient}
                      onUpdateIngredientDetail={updateIngredientDetail}
                    />
                  ) : type === 'ingrediente' ? (
                    <IngredientFormFields
                      formData={formData}
                      selectedItem={selectedItem}
                      measurementUnits={measurementUnits}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      availableSubcategories={availableSubcategories}
                      imagePreview={imagePreview}
                      onInputChange={handleInputChange}
                      onCategorySelection={handleCategorySelectionWithForm}
                      onSubcategorySelection={handleSubcategorySelectionWithForm}
                      onImageChange={handleImageChange}
                      onRemoveImage={removeImage}
                    />
                  ) : type === 'rubro' ? (
                    <CategoryFormFields
                      type={type}
                      formData={formData}
                      selectedItem={selectedItem}
                      categories={categories}
                      selectedCategory={selectedCategory}
                      availableSubcategories={availableSubcategories}
                      parentCategories={parentCategories}
                      measurementUnits={measurementUnits}
                      imagePreview={imagePreview}
                      onInputChange={handleInputChange}
                      onCategorySelection={handleCategorySelectionWithForm}
                      onSubcategorySelection={handleSubcategorySelectionWithForm}
                      onImageChange={handleImageChange}
                      onRemoveImage={removeImage}
                    />
                  ) : type === 'promotion' ? (
                    <PromotionFormFields
                      formData={formData}
                      selectedItem={selectedItem}
                      onInputChange={handleInputChange}
                    />
                  ) : (
                    <FormFields
                      columns={columns}
                      formData={formData}
                      onInputChange={handleInputChange}
                      type={type}
                      isEditing={!!selectedItem}
                      onValidationChange={setIsFormValid}
                    />
                  )}
                  
                  <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={handleCloseModal}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={type === 'employee' && !selectedItem && !isFormValid}
                    >
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
        <ViewModal
          title={title}
          type={type}
          columns={columns}
          viewItem={viewItem}
          onClose={handleCloseViewModal}
        />
      )}

      {/* Add Inventory Modal */}
      <AddInventoryModal
        isOpen={isAddInventoryModalOpen}
        onClose={handleCloseAddInventoryModal}
        onSuccess={handleInventorySuccess}
        inventoryItemId={selectedStockItem?.id_key}
        inventoryItemName={selectedStockItem?.name}
        userRole={authService.getCurrentUser()?.role === 'cocinero' ? 'cocinero' : 'administrador'}
      />
    </div>
  );
};

export default GenericABM; 