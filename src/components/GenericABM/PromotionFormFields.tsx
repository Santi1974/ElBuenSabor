import React, { useState, useEffect } from 'react';
import inventoryService from '../../services/inventoryService';

interface PromotionFormFieldsProps {
  formData: any;
  selectedItem: any;
  onInputChange: (field: string, value: any) => void;
}

interface ProductItem {
  id_key: number;
  name: string;
  type: 'manufactured' | 'inventory';
  price?: number;
}

const PromotionFormFields: React.FC<PromotionFormFieldsProps> = ({
  formData,
  selectedItem,
  onInputChange
}) => {
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getAllProducts(0, 1000); // Get all products
      // Map the response to include the type property
      const productsWithType = response.data.map(product => ({
        id_key: product.id_key,
        name: product.name,
        type: (product as any).type || 'manufactured' as 'manufactured' | 'inventory',
        price: product.price
      }));
      setAvailableProducts(productsWithType);
      setError(null);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Error al cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const handleItemDetailChange = (itemType: 'manufactured_item_details' | 'inventory_item_details', index: number, field: 'manufactured_item_id' | 'inventory_item_id' | 'quantity', value: any) => {
    const currentDetails = formData[itemType] || [];
    const updatedDetails = [...currentDetails];
    
    if (!updatedDetails[index]) {
      if (itemType === 'manufactured_item_details') {
        updatedDetails[index] = { manufactured_item_id: '', quantity: 1 };
      } else {
        updatedDetails[index] = { inventory_item_id: '', quantity: 1 };
      }
    }
    
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: field === 'quantity' ? parseInt(value) || 1 : parseInt(value) || ''
    };
    
    onInputChange(itemType, updatedDetails);
  };

  const addItemDetail = (itemType: 'manufactured_item_details' | 'inventory_item_details') => {
    const currentDetails = formData[itemType] || [];
    const newDetail = itemType === 'manufactured_item_details' 
      ? { manufactured_item_id: '', quantity: 1 }
      : { inventory_item_id: '', quantity: 1 };
    onInputChange(itemType, [...currentDetails, newDetail]);
  };

  const removeItemDetail = (itemType: 'manufactured_item_details' | 'inventory_item_details', index: number) => {
    const currentDetails = formData[itemType] || [];
    const updatedDetails = currentDetails.filter((_: any, i: number) => i !== index);
    onInputChange(itemType, updatedDetails);
  };

  const getProductsByType = (type: 'manufactured' | 'inventory') => {
    return availableProducts.filter(product => product.type === type);
  };

  const getProductName = (id: number) => {
    const product = availableProducts.find(p => p.id_key === id);
    return product ? product.name : '';
  };

  return (
    <>
      {/* Nombre */}
      <div className="mb-3">
        <label className="form-label">Nombre de la Promoción <span className="text-danger">*</span></label>
        <input
          type="text"
          className="form-control"
          value={formData.name || ''}
          onChange={(e) => onInputChange('name', e.target.value)}
          placeholder="Ingrese el nombre de la promoción..."
          required
        />
      </div>

      {/* Descripción */}
      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <textarea
          className="form-control"
          rows={3}
          value={formData.description || ''}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe la promoción..."
        />
      </div>

      {/* Porcentaje de descuento */}
      <div className="mb-3">
        <label className="form-label">Porcentaje de Descuento <span className="text-danger">*</span></label>
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            min="0"
            max="100"
            step="0.01"
            value={formData.discount_percentage || ''}
            onChange={(e) => onInputChange('discount_percentage', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            required
          />
          <span className="input-group-text">%</span>
        </div>
      </div>

      {/* Estado activo */}
      <div className="mb-3">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            id="activeCheck"
            checked={formData.active || false}
            onChange={(e) => onInputChange('active', e.target.checked)}
          />
          <label className="form-check-label" htmlFor="activeCheck">
            Promoción Activa
          </label>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Cargando productos...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Productos Manufacturados */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Productos Manufacturados</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => addItemDetail('manufactured_item_details')}
              >
                <i className="bi bi-plus"></i> Agregar Producto
              </button>
            </div>
            
            {(formData.manufactured_item_details || []).map((detail: any, index: number) => (
              <div key={index} className="card mb-2">
                <div className="card-body p-3">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <label className="form-label">Producto</label>
                      <select
                        className="form-select"
                        value={detail.manufactured_item_id || ''}
                        onChange={(e) => handleItemDetailChange('manufactured_item_details', index, 'manufactured_item_id', e.target.value)}
                        required
                      >
                        <option value="">Seleccione un producto...</option>
                        {getProductsByType('manufactured').map((product) => (
                          <option key={product.id_key} value={product.id_key}>
                            {product.name} {product.price && `- $${product.price}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={detail.quantity || 1}
                        onChange={(e) => handleItemDetailChange('manufactured_item_details', index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">&nbsp;</label>
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeItemDetail('manufactured_item_details', index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {(!formData.manufactured_item_details || formData.manufactured_item_details.length === 0) && (
              <p className="text-muted text-center py-3">No hay productos manufacturados agregados</p>
            )}
          </div>

          {/* Productos de Inventario */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="mb-0">Productos de Inventario</h6>
              <button
                type="button"
                className="btn btn-sm btn-outline-primary"
                onClick={() => addItemDetail('inventory_item_details')}
              >
                <i className="bi bi-plus"></i> Agregar Producto
              </button>
            </div>
            
            {(formData.inventory_item_details || []).map((detail: any, index: number) => (
              <div key={index} className="card mb-2">
                <div className="card-body p-3">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <label className="form-label">Producto</label>
                      <select
                        className="form-select"
                        value={detail.inventory_item_id || ''}
                        onChange={(e) => handleItemDetailChange('inventory_item_details', index, 'inventory_item_id', e.target.value)}
                        required
                      >
                        <option value="">Seleccione un producto...</option>
                        {getProductsByType('inventory').map((product) => (
                          <option key={product.id_key} value={product.id_key}>
                            {product.name} {product.price && `- $${product.price}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Cantidad</label>
                      <input
                        type="number"
                        className="form-control"
                        min="1"
                        value={detail.quantity || 1}
                        onChange={(e) => handleItemDetailChange('inventory_item_details', index, 'quantity', e.target.value)}
                        required
                      />
                    </div>
                    <div className="col-md-2">
                      <label className="form-label">&nbsp;</label>
                      <button
                        type="button"
                        className="btn btn-outline-danger w-100"
                        onClick={() => removeItemDetail('inventory_item_details', index)}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {(!formData.inventory_item_details || formData.inventory_item_details.length === 0) && (
              <p className="text-muted text-center py-3">No hay productos de inventario agregados</p>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default PromotionFormFields; 