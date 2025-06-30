import React from 'react';

interface InventoryFormFieldsProps {
  formData: any;
  selectedItem: any;
  selectedDetails: any[];
  availableIngredients: any[];
  measurementUnits: any[];
  categories: any[];
  selectedCategory: any;
  availableSubcategories: any[];
  imagePreview: string | null;
  onInputChange: (field: string, value: any) => void;
  onProductTypeChange: (productType: string) => void;
  onCategorySelection: (categoryId: string) => void;
  onSubcategorySelection: (subcategoryId: string) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onAddIngredient: () => void;
  onRemoveIngredient: (index: number) => void;
  onUpdateIngredientDetail: (index: number, field: string, value: any) => void;
}

const InventoryFormFields: React.FC<InventoryFormFieldsProps> = ({
  formData,
  selectedItem,
  selectedDetails,
  availableIngredients,
  measurementUnits,
  categories,
  selectedCategory,
  availableSubcategories,
  imagePreview,
  onInputChange,
  onProductTypeChange,
  onCategorySelection,
  onSubcategorySelection,
  onImageChange,
  onRemoveImage,
  onAddIngredient,
  onRemoveIngredient,
  onUpdateIngredientDetail
}) => {
  // Función para detectar el tipo de producto basándose en sus propiedades
  const getProductType = (item: any): 'manufactured' | 'inventory' | null => {
    if (!item) return null;
    
    // Primero verificar si ya tiene la propiedad type o product_type
    if (item.type) return item.type;
    if (item.product_type) return item.product_type;
    
    // Si no, detectar basándose en las propiedades únicas de cada tipo
    // Los productos manufacturados tienen preparation_time y recipe
    if ('preparation_time' in item || 'recipe' in item) {
      return 'manufactured';
    }
    
    // Los productos de inventario tienen current_stock, minimum_stock, purchase_cost
    if ('current_stock' in item || 'minimum_stock' in item || 'purchase_cost' in item) {
      return 'inventory';
    }
    
    return null;
  };

  const selectedItemType = getProductType(selectedItem);

  return (
    <>
      {/* Product type field - for new items (selector) or existing items (readonly) */}
      <div className="mb-3">
        <label className="form-label">Tipo de Producto</label>
        {!selectedItem ? (
          // Selector for new products
          <>
            <select
              className="form-select"
              value={formData.product_type || ''}
              onChange={(e) => onProductTypeChange(e.target.value)}
              required
            >
              <option value="">Seleccione el tipo...</option>
              <option value="manufactured">Producto Manufacturado</option>
              <option value="inventory">Producto de Inventario</option>
            </select>
            <div className="form-text">
              Seleccione si es un producto manufacturado (se fabrica) o un producto de inventario (se compra)
            </div>
          </>
        ) : (
          // Read-only display for existing products
          <>
            <div className="form-control-plaintext border rounded p-2 bg-light">
              <i className={`bi ${selectedItemType === 'manufactured' ? 'bi-tools' : 'bi-box'} me-2`}></i>
              {selectedItemType === 'manufactured' ? 'Producto Manufacturado' : 
               selectedItemType === 'inventory' ? 'Producto de Inventario' : 'Tipo desconocido'}
            </div>
            <div className="form-text text-muted">
              El tipo de producto no se puede modificar después de la creación
            </div>
          </>
        )}
      </div>

      {/* Name field */}
      <div className="mb-3">
        <label className="form-label">Nombre del Producto <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Ingrese el nombre del producto..."
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

      {/* Description field - only for manufactured products */}
      {(selectedItemType === 'manufactured' || (!selectedItem && formData.product_type === 'manufactured')) && (
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
      )}

      {/* Category selection fields */}
      {(formData.product_type || selectedItemType) && (
        <>
          {/* Category select field */}
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
        </>
      )}

      {/* Recipe field - only for manufactured products */}
      {(selectedItemType === 'manufactured' || (!selectedItem && formData.product_type === 'manufactured')) && (
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
      {(selectedItemType === 'inventory' || (!selectedItem && formData.product_type === 'inventory')) && (
        <>
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
              step="0.001"
              value={formData.current_stock || 0}
              onChange={(e) => onInputChange('current_stock', parseFloat(e.target.value) || 0)}
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
          <div className="mb-3">
            <label className="form-label">Stock Mínimo</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.001"
              value={formData.minimum_stock || 0}
              onChange={(e) => onInputChange('minimum_stock', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Costo de Compra</label>
            <input
              type="number"
              className="form-control"
              min="0"
              step="0.001"
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
      {(selectedItemType === 'manufactured' || (!selectedItem && formData.product_type === 'manufactured')) && (
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <label className="form-label mb-0">
              <strong>Ingredientes del Producto</strong>
            </label>
            <button
              type="button"
              className="btn btn-sm btn-success"
              onClick={onAddIngredient}
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
                        onUpdateIngredientDetail(index, 'inventory_item_id', parseInt(e.target.value))
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
                      step="0.001"
                      value={detail.quantity || ''}
                      onChange={(e) => 
                        onUpdateIngredientDetail(index, 'quantity', parseFloat(e.target.value) || 0)
                      }
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm w-100"
                      onClick={() => onRemoveIngredient(index)}
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