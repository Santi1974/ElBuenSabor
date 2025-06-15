import React from 'react';

interface IngredientFormFieldsProps {
  formData: any;
  selectedItem: any;
  measurementUnits: any[];
  categories: any[];
  selectedCategory: any;
  availableSubcategories: any[];
  imagePreview: string | null;
  onInputChange: (field: string, value: any) => void;
  onCategorySelection: (categoryId: string) => void;
  onSubcategorySelection: (subcategoryId: string) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const IngredientFormFields: React.FC<IngredientFormFieldsProps> = ({
  formData,
  selectedItem,
  measurementUnits,
  categories,
  selectedCategory,
  availableSubcategories,
  imagePreview,
  onInputChange,
  onCategorySelection,
  onSubcategorySelection,
  onImageChange,
  onRemoveImage
}) => {
  return (
    <>
      {/* Name field */}
      <div className="mb-3">
        <label className="form-label">Nombre del Ingrediente <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Ingrese el nombre del ingrediente..."
          required
        />
      </div>

      {/* Price field */}
      <div className="mb-3">
        <label className="form-label">Precio <span className="text-danger">*</span></label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            className="form-control"
            min="0"
            step="0.01"
            value={formData.price || ''}
            onChange={(e) => onInputChange('price', parseFloat(e.target.value) || '')}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Purchase cost field */}
      <div className="mb-3">
        <label className="form-label">Costo de Compra <span className="text-danger">*</span></label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            className="form-control"
            min="0"
            step="0.01"
            value={formData.purchase_cost || ''}
            onChange={(e) => onInputChange('purchase_cost', parseFloat(e.target.value) || '')}
            placeholder="0.00"
            required
          />
        </div>
      </div>

      {/* Stock fields */}
      <div className="row">
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">
              Stock Actual
              {selectedItem && (
                <small className="text-muted ms-2">(Solo lectura - Use "Agregar Inventario")</small>
              )}
            </label>
            <input
              type="number"
              className={`form-control ${selectedItem ? 'bg-light' : ''}`}
              min="0"
              step="0.1"
              value={formData.current_stock || ''}
              onChange={(e) => onInputChange('current_stock', parseFloat(e.target.value) || '')}
              placeholder="0"
              readOnly={!!selectedItem}
              disabled={!!selectedItem}
            />
            {selectedItem && (
              <div className="form-text text-info">
                <i className="bi bi-info-circle me-1"></i>
                Para modificar el stock use el botón "Agregar Inventario"
              </div>
            )}
          </div>
        </div>
        <div className="col-md-6">
          <div className="mb-3">
            <label className="form-label">Stock Mínimo</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.1"
              value={formData.minimum_stock || ''}
              onChange={(e) => onInputChange('minimum_stock', parseFloat(e.target.value) || '')}
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Measurement unit field */}
      <div className="mb-3">
        <label className="form-label">Unidad de Medida <span className="text-danger">*</span></label>
        <select
          className="form-select"
          value={formData.measurement_unit_id || ''}
          onChange={(e) => onInputChange('measurement_unit_id', parseInt(e.target.value) || '')}
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

      {/* Category selection fields */}
      <div className="mb-3">
        <label className="form-label">
          Categoría <span className="text-danger">*</span>
          {selectedCategory && availableSubcategories.length > 0 && ' (Seleccione subcategoría abajo)'}
        </label>
        <select
          className="form-select"
          value={selectedCategory ? selectedCategory.id_key : ''}
          onChange={(e) => onCategorySelection(e.target.value)}
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

      {/* Subcategory select field */}
      {availableSubcategories.length > 0 && (
        <div className="mb-3">
          <label className="form-label">
            Subcategoría de "{selectedCategory.name}" <span className="text-danger">*</span>
          </label>
          <select
            className="form-select"
            value={formData.category_id || ''}
            onChange={(e) => onSubcategorySelection(e.target.value)}
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

      {/* Image field */}
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

      {/* Active field */}
      <div className="mb-3">
        <label className="form-label">Estado</label>
        <select
          className="form-select"
          value={formData.active?.toString() || 'true'}
          onChange={(e) => onInputChange('active', e.target.value === 'true')}
        >
          <option value="true">Activo</option>
          <option value="false">Inactivo</option>
        </select>
      </div>
    </>
  );
};

export default IngredientFormFields; 