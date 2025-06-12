import React from 'react';

interface InventoryFormFieldsProps {
  formData: any;
  selectedItem: any;
  selectedDetails: any[];
  availableIngredients: any[];
  measurementUnits: any[];
  imagePreview: string | null;
  onInputChange: (field: string, value: any) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
}

const InventoryFormFields: React.FC<InventoryFormFieldsProps> = ({
  formData,
  selectedItem,
  selectedDetails,
  availableIngredients,
  measurementUnits,
  imagePreview,
  onInputChange,
  onImageChange,
  onRemoveImage
}) => {
  return (
    <>
      {/* Product type select field for new inventory items */}
      {!selectedItem && (
        <div className="mb-3">
          <label className="form-label">Tipo de Producto</label>
          <select
            className="form-select"
            value={formData.product_type || ''}
            onChange={(e) => onInputChange('product_type', e.target.value)}
            required
          >
            <option value="">Seleccione el tipo...</option>
            <option value="manufactured">Producto Manufacturado</option>
            <option value="inventory">Producto de Inventario</option>
          </select>
          <div className="form-text">
            Seleccione si es un producto manufacturado (se fabrica) o un producto de inventario (se compra)
          </div>
        </div>
      )}

      {/* Description field */}
      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe el producto..."
        />
      </div>

      {/* Recipe field - only for manufactured products */}
      {(selectedItem?.product_type === 'manufactured' || (!selectedItem && formData.product_type === 'manufactured')) && (
        <>
          <div className="mb-3">
            <label className="form-label">Receta</label>
            <textarea
              className="form-control"
              rows={4}
              value={formData.recipe || ''}
              onChange={(e) => onInputChange('recipe', e.target.value)}
              placeholder="Ingredientes y pasos de preparación..."
            />
          </div>

          {/* Preparation time field - only for manufactured products */}
          <div className="mb-3">
            <label className="form-label">Tiempo de Preparación (minutos)</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={formData.preparation_time || 0}
              onChange={(e) => onInputChange('preparation_time', parseInt(e.target.value) || 0)}
              placeholder="Tiempo en minutos..."
            />
          </div>
        </>
      )}

      {/* Stock fields - only for inventory products */}
      {(selectedItem?.product_type === 'inventory' || (!selectedItem && formData.product_type === 'inventory')) && (
        <>
          <div className="mb-3">
            <label className="form-label">Stock Actual</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={formData.current_stock || 0}
              onChange={(e) => onInputChange('current_stock', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Stock Mínimo</label>
            <input
              type="number"
              className="form-control"
              min="0"
              value={formData.minimum_stock || 0}
              onChange={(e) => onInputChange('minimum_stock', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Costo de Compra</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.01"
              value={formData.purchase_cost || 0}
              onChange={(e) => onInputChange('purchase_cost', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          {/* Measurement unit field for inventory products */}
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

      {/* Image field */}
      <div className="mb-3">
        <label className="form-label">Imagen del Producto</label>
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

      {/* Ingredients management for inventory items - only for manufactured products */}
      {(selectedItem?.product_type === 'manufactured' || (!selectedItem && formData.product_type === 'manufactured')) && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label mb-0">
              <strong>Ingredientes del Producto</strong>
            </label>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={() => onInputChange('ingredients', [...(formData.ingredients || []), { quantity: 0 } as any])}
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
              {Array.isArray(selectedDetails) && selectedDetails.map((detail, index) => (
                <div key={detail.temp_id || detail.id_key || index} className="row g-2 mb-3 align-items-end">
                  <div className="col-6">
                    <label className="form-label small">Ingrediente</label>
                    <select
                      className="form-select form-select-sm"
                      value={detail.inventory_item_id || ''}
                      onChange={(e) => 
                        onInputChange(`ingredients.${index}.inventory_item_id`, parseInt(e.target.value))
                      }
                      required
                    >
                      <option value="">Seleccione un ingrediente...</option>
                      {Array.isArray(availableIngredients) && availableIngredients.map((ingredient) => (
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
                        onInputChange(`ingredients.${index}.quantity`, parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => onInputChange(`ingredients.${index}.quantity`, 0)}
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
    </>
  );
};

export default InventoryFormFields; 