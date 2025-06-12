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
import { Modal, Button } from 'react-bootstrap';

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
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    imagePreview,
    passwordError: formPasswordError,
    initializeFormData,
    handleInputChange,
    handlePasswordConfirmChange,
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

  const handleFormSubmit = async () => {
    try {
      await handleSubmit();
      setShowForm(false);
      handleInventorySuccess();
    } catch (err: any) {
      setFormError(err.message);
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

  const handleCloseForm = () => {
    setShowForm(false);
    resetForm();
    setFormError(null);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>{title}</h2>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                initializeFormData();
              }}
            >
              <i className="bi bi-plus-circle me-1"></i>
              Nuevo
            </button>
          </div>

          {/* Modal de formulario */}
          <Modal
            show={showForm}
            onHide={handleCloseForm}
            backdrop="static"
            keyboard={false}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>
                {selectedItem ? 'Editar' : 'Nuevo'} {title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {formError && (
                <div className="alert alert-danger" role="alert">
                  {formError}
                </div>
              )}
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
                  onPasswordConfirmChange={handlePasswordConfirmChange}
                  passwordError={formPasswordError}
                />
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseForm}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleFormSubmit}>
                {selectedItem ? 'Guardar cambios' : 'Crear'}
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Modal de visualización */}
          <Modal show={!!viewItem} onHide={() => setViewItem(null)}>
            <Modal.Header closeButton>
              <Modal.Title>Detalles</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {viewItem && (
                <div>
                  {columns.map((column) => (
                    <div key={column.field} className="mb-2">
                      <strong>{column.headerName}: </strong>
                      {viewItem[column.field]}
                    </div>
                  ))}
                </div>
              )}
            </Modal.Body>
          </Modal>

          {/* Tabla de datos */}
          <DataTable
            columns={columns}
            data={data}
            onEdit={(item) => {
              setShowForm(true);
              initializeFormData(item);
            }}
            onView={setViewItem}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default GenericABM; 