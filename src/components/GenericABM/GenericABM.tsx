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

interface GenericABMProps {
  title: string;
  columns: {
    field: string;
    headerName: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'select';
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
  const [viewItem, setViewItem] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Custom hooks
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
  } = useABMData(type);

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
  });

  const {
    categories,
    selectedCategory,
    availableSubcategories,
    parentCategories,
    availableIngredients,
    measurementUnits,
    loadCategoriesForProduct,
    handleCategorySelection,
    handleSubcategorySelection,
    resetCategorySelection,
    findCategoryForItem
  } = useCategories(type);

  const handleOpenModal = async (item?: any) => {
    resetCategorySelection();
    initializeFormData(item);
    
    if (item && (type === 'inventario' || type === 'ingrediente')) {
      findCategoryForItem(item);
    }
    
    // Load categories for inventory items
    if (type === 'inventario') {
      if (item && item.product_type) {
        await loadCategoriesForProduct(item.product_type);
      }
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

  // Ingredient management functions
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
                  <FormFields
                    columns={columns}
                    formData={formData}
                    type={type}
                    onInputChange={handleInputChange}
                  />

                  {/* Inventory Specific Fields */}
                  {type === 'inventario' && (
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
                  )}

                  {/* Category Related Fields */}
                  {(type === 'inventario' || type === 'ingrediente' || type === 'rubro') && (
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
    </div>
  );
};

export default GenericABM; 