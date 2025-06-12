import React from 'react';
import type { ABMType } from '../../hooks/useABMData';

interface CategoryFormFieldsProps {
  type: ABMType;
  formData: any;
  selectedItem: any;
  categories: any[];
  selectedCategory: any;
  availableSubcategories: any[];
  parentCategories: any[];
  measurementUnits: any[];
  imagePreview: string | null;
  onInputChange: (field: string, value: any) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const CategoryFormFields: React.FC<CategoryFormFieldsProps> = ({
  type,
  formData,
  selectedItem,
  categories,
  selectedCategory,
  availableSubcategories,
  parentCategories,
  measurementUnits,
  imagePreview,
  onInputChange,
  onImageChange,
  onRemoveImage
}) => {
  return (
    <>
      {/* Category type select field for new rubro items */}
      {type === 'rubro' && !selectedItem && (
        <div className="mb-3">
          <label className="form-label">Tipo de Categoría</label>
          <select
            className="form-select"
            value={formData.category_type || ''}
            onChange={(e) => onInputChange('category_type', e.target.value)}
            required
          >
            <option value="">Seleccione el tipo...</option>
            <option value="manufactured">Producto Manufacturado</option>
            <option value="inventory">Ingrediente</option>
          </select>
          <div className="form-text">
            Seleccione si esta categoría será para productos manufacturados o ingredientes
          </div>
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
              onInputChange('parent_id', e.target.value ? parseInt(e.target.value) : null)
            }
          >
            <option value="">Sin categoría padre</option>
            {parentCategories
              .filter(cat => {
                if (cat.id_key === formData.id_key) return false;
                
                if (selectedItem && selectedItem.category_type) {
                  return cat.category_type === selectedItem.category_type;
                }
                
                if (!selectedItem && formData.category_type) {
                  return cat.category_type === formData.category_type;
                }
                
                if (!selectedItem && !formData.category_type) {
                  return false;
                }
                
                return true;
              })
              .map((category) => (
              <option key={category.id_key} value={category.id_key}>
                {category.name} ({category.category_type === 'manufactured' ? 'Producto' : 'Ingrediente'})
              </option>
            ))}
          </select>
          <div className="form-text">
            Seleccione una categoría padre si esta es una subcategoría
            {selectedItem && selectedItem.category_type && (
              <span className="text-info">
                <br />Mostrando solo categorías de tipo: {selectedItem.category_type === 'manufactured' ? 'Producto' : 'Ingrediente'}
              </span>
            )}
            {!selectedItem && formData.category_type && (
              <span className="text-info">
                <br />Mostrando solo categorías de tipo: {formData.category_type === 'manufactured' ? 'Producto' : 'Ingrediente'}
              </span>
            )}
            {!selectedItem && !formData.category_type && (
              <span className="text-warning">
                <br />Primero seleccione el tipo de categoría para ver las opciones de categoría padre
              </span>
            )}
          </div>
        </div>
      )}

      {/* Category select field for inventory items and ingredients */}
      {(type === 'inventario' || type === 'ingrediente') && (
        <div className="mb-3">
          <label className="form-label">
            Categoría {selectedCategory && availableSubcategories.length > 0 && '(Seleccione subcategoría abajo)'}
          </label>
          <select
            className="form-select"
            value={selectedCategory ? selectedCategory.id_key : ''}
            onChange={(e) => onInputChange('category_id', e.target.value)}
            required={availableSubcategories.length === 0}
          >
            <option value="">Seleccione una categoría...</option>
            {Array.isArray(categories) && categories.map((category) => (
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

      {/* Subcategory select field */}
      {(type === 'inventario' || type === 'ingrediente') && selectedCategory && availableSubcategories.length > 0 && (
        <div className="mb-3">
          <label className="form-label">
            Subcategoría de "{selectedCategory.name}"
          </label>
          <select
            className="form-select"
            value={formData.category_id || ''}
            onChange={(e) => onInputChange('category_id', e.target.value)}
            required
          >
            <option value="">Seleccione una subcategoría...</option>
            {Array.isArray(availableSubcategories) && availableSubcategories.map((subcategory) => (
              <option key={subcategory.id_key} value={subcategory.id_key}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Measurement unit field for ingredients */}
      {type === 'ingrediente' && (
        <>
          {/* Image field for ingredients */}
          <div className="mb-3">
            <label className="form-label">Imagen del Ingrediente</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={onImageChange}
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
                  onClick={onRemoveImage}
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

          {/* Stock inicial - solo para crear nuevos ingredientes */}
          {!selectedItem && (
            <div className="mb-3">
              <label className="form-label">Stock Inicial</label>
              <input
                type="number"
                className="form-control"
                min="0"
                step="0.1"
                value={formData.current_stock || 0}
                onChange={(e) => onInputChange('current_stock', parseFloat(e.target.value) || 0)}
                placeholder="Stock inicial del ingrediente..."
              />
              <div className="form-text">
                El stock inicial que tendrá el ingrediente al crearlo. Para modificar el stock luego, use "Agregar Inventario".
              </div>
            </div>
          )}

          {/* Información de stock actual - solo al editar */}
          {selectedItem && (
            <div className="mb-3">
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Stock Actual: {selectedItem.current_stock || 0} {selectedItem.measurement_unit?.name || 'unidades'}
                </h6>
                <p className="mb-0">Para modificar el stock, use el botón "Agregar Inventario" desde la tabla.</p>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Unidad de Medida</label>
            <select
              className="form-select"
              value={formData.measurement_unit_id || ''}
              onChange={(e) => onInputChange('measurement_unit_id', parseInt(e.target.value))}
              required
            >
              <option value="">Seleccione una unidad...</option>
              {Array.isArray(measurementUnits) && measurementUnits.map((unit) => (
                <option key={unit.id_key} value={unit.id_key}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        </>
      )}
    </>
  );
};

export default CategoryFormFields; 