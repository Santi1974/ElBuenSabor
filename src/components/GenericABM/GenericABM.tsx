import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useABMData } from '../../hooks/useABMData';
import type { ABMType } from '../../hooks/useABMData';
import { useFormData } from '../../hooks/useFormData';
import { useCategories } from '../../hooks/useCategories';
import DataTable from './DataTable';
import PaginationControls from './PaginationControls';
import FormFields from './FormFields';
import InventoryFormFields from './InventoryFormFields';
import CategoryFormFields from './CategoryFormFields';
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
}

const GenericABM: React.FC<GenericABMProps> = ({
  title,
  columns,
  type = 'employee'
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddInventoryModalOpen, setIsAddInventoryModalOpen] = useState(false);
  const [selectedStockItem, setSelectedStockItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

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
    loadData,
    handleDelete,
    getTotalPages,
    handlePageChange,
    handleNextPage,
    handlePrevPage
  } = useABMData(type, reloadCategoriesAfterCRUD);

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
              Agregar Inventario
            </button>
          )}
          <button
            className="btn btn-primary"
            onClick={() => handleOpenModal()}
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

      {/* Table */}
      <DataTable
        columns={columns}
        data={data}
        onEdit={(item) => handleOpenModal(item)}
        onDelete={handleDelete}
        onView={handleOpenViewModal}
        onAddStock={handleOpenAddInventoryModal}
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
                      imagePreview={imagePreview}
                      onInputChange={handleInputChange}
                      onProductTypeChange={handleProductTypeChange}
                      onImageChange={handleImageChange}
                      onRemoveImage={removeImage}
                      onAddIngredient={addIngredient}
                      onRemoveIngredient={removeIngredient}
                      onUpdateIngredientDetail={updateIngredientDetail}
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
                  ) : (
                    <FormFields
                      columns={columns}
                      formData={formData}
                      onInputChange={handleInputChange}
                      type={type}
                      isEditing={!!selectedItem}
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