import React, { useState, useEffect } from 'react';
import inventoryPurchaseService from '../../services/inventoryPurchaseService';
import inventoryService from '../../services/inventoryService';
import ingredientService from '../../services/ingredientService';

interface AddInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inventoryItemId?: number;
  inventoryItemName?: string;
  userRole: 'cocinero' | 'administrador';
}

interface InventoryItem {
  id_key: number;
  name: string;
  current_stock: number;
  minimum_stock: number;
  purchase_cost?: number;
  measurement_unit?: {
    name: string;
  };
  product_type?: string;
}

const AddInventoryModal: React.FC<AddInventoryModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  inventoryItemId,
  inventoryItemName,
  userRole
}) => {
  // Helper function to format numbers with limited decimals
  const formatNumber = (value: number, decimals: number = 2): string => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    return Number(value).toFixed(decimals);
  };
  const [selectedItemId, setSelectedItemId] = useState<number>(inventoryItemId || 0);
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [availableItems, setAvailableItems] = useState<InventoryItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && !inventoryItemId) {
      loadAvailableItems();
    }
    if (inventoryItemId) {
      setSelectedItemId(inventoryItemId);
      loadItemDetails(inventoryItemId);
    }
  }, [isOpen, inventoryItemId]);

  const loadAvailableItems = async () => {
    try {
      setLoading(true);
      
      // Cargar productos de inventario
      const inventoryResponse = await inventoryService.getAll(0, 100);
      const inventoryItems = Array.isArray(inventoryResponse.data) ? inventoryResponse.data : inventoryResponse;
      
      // Cargar ingredientes
      const ingredientsResponse = await ingredientService.getAll(0, 100);
      const ingredients = Array.isArray(ingredientsResponse.data) ? ingredientsResponse.data : ingredientsResponse;
      
      // Combinar ambos tipos y filtrar solo productos de inventario
      const allItems = [
        ...inventoryItems.filter((item: any) => item.product_type === 'inventory'),
        ...ingredients
      ];
      
      setAvailableItems(allItems);
    } catch (err) {
      console.error('Error loading available items:', err);
      setError('Error al cargar los elementos disponibles');
    } finally {
      setLoading(false);
    }
  };

  const loadItemDetails = async (itemId: number) => {
    try {
      // Intentar cargar como producto de inventario primero
      try {
        const item = await inventoryService.getById(itemId);
        setSelectedItem(item);
        // Auto-completar el costo unitario con el purchase_cost del producto
        if (item.purchase_cost) {
          setUnitCost(item.purchase_cost);
        }
        return;
      } catch {
        // Si falla, intentar como ingrediente
        const item = await ingredientService.getById(itemId);
        setSelectedItem(item);
        // Auto-completar el costo unitario con el purchase_cost del ingrediente
        if (item.purchase_cost) {
          setUnitCost(item.purchase_cost);
        }
      }
    } catch (err) {
      console.error('Error loading item details:', err);
      setError('Error al cargar los detalles del elemento');
    }
  };

  const handleItemSelection = (itemId: number) => {
    setSelectedItemId(itemId);
    const item = availableItems.find(item => item.id_key === itemId);
    setSelectedItem(item || null);
    
    // Auto-completar el costo unitario con el purchase_cost del elemento seleccionado
    if (item && item.purchase_cost) {
      setUnitCost(item.purchase_cost);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedItemId || quantity === 0) {
      setError('Por favor, seleccione un elemento y una cantidad válida');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const addStockParams = {
        inventory_item_id: selectedItemId,
        quantity: quantity,
        unit_cost: quantity < 0 ? 0 : unitCost,
        notes: notes || `${quantity < 0 ? 'Reducido' : 'Agregado'} por ${userRole} - ${new Date().toLocaleDateString()}`
      };

      await inventoryPurchaseService.addStock(addStockParams);
      
      // Resetear formulario
      setSelectedItemId(inventoryItemId || 0);
      setQuantity(1);
      setUnitCost(0);
      setNotes('');
      setError(null);
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding stock:', err);
      setError('Error al modificar el inventario. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedItemId(inventoryItemId || 0);
    setQuantity(1);
    setUnitCost(0);
    setNotes('');
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className={`bi ${quantity < 0 ? 'bi-dash-circle' : 'bi-plus-circle'} me-2`}></i>
              {quantity < 0 ? 'Restar Inventario' : 'Agregar Inventario'}
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={handleClose}
            ></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {/* Selector de elemento (solo si no se especificó uno) */}
              {!inventoryItemId && (
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Elemento de Inventario</strong>
                  </label>
                  <select
                    className="form-select"
                    value={selectedItemId}
                    onChange={(e) => handleItemSelection(parseInt(e.target.value))}
                    required
                  >
                    <option value="">Seleccione un elemento...</option>
                    {availableItems.map((item) => (
                      <option key={item.id_key} value={item.id_key}>
                        {item.name} - Stock actual: {formatNumber(item.current_stock || 0, 2)} {item.measurement_unit?.name || 'unidades'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Información del elemento seleccionado */}
              {inventoryItemId && inventoryItemName && (
                <div className="mb-3">
                  <label className="form-label">
                    <strong>Elemento Seleccionado</strong>
                  </label>
                  <div className="form-control-plaintext border rounded p-2 bg-light">
                    <i className="bi bi-box-seam me-2"></i>
                    {inventoryItemName}
                  </div>
                </div>
              )}

              {/* Información del stock actual */}
              {selectedItem && (
                <div className="mb-3">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <small className="text-muted">Stock Actual:</small>
                          <div className="fw-bold text-primary">
                            {formatNumber(selectedItem.current_stock || 0, 2)} {selectedItem.measurement_unit?.name || 'unidades'}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted">Stock Mínimo:</small>
                          <div className="fw-bold text-warning">
                            {formatNumber(selectedItem.minimum_stock || 0, 2)} {selectedItem.measurement_unit?.name || 'unidades'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Cantidad a agregar */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Cantidad a {quantity < 0 ? 'Restar' : 'Agregar'}</strong>
                </label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    step="0.01"
                    value={quantity}
                    onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
                    placeholder="Ingrese la cantidad (+ para agregar, - para restar)..."
                    required
                  />
                  {selectedItem?.measurement_unit && (
                    <span className="input-group-text">
                      {selectedItem.measurement_unit.name}
                    </span>
                  )}
                </div>
                {quantity < 0 && (
                  <div className="form-text text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    Se restará {Math.abs(quantity)} {selectedItem?.measurement_unit?.name || 'unidades'} del stock
                  </div>
                )}
              </div>

              {/* Costo unitario */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Costo Unitario</strong>
                </label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className="form-control"
                    min="0"
                    step="0.01"
                    value={quantity < 0 ? 0 : unitCost}
                    onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    required
                    disabled={quantity < 0}
                  />
                </div>
                <div className="form-text">
                  {quantity < 0 ? (
                    <span className="text-info">
                      <i className="bi bi-info-circle me-1"></i>
                      Costo unitario automáticamente establecido en $0.00 para reducciones de stock
                    </span>
                  ) : (
                    <>
                      {selectedItem?.purchase_cost && unitCost === selectedItem.purchase_cost && (
                        <span className="text-success">
                          <i className="bi bi-check-circle me-1"></i>
                          Usando último costo registrado: ${formatNumber(selectedItem.purchase_cost, 2)}
                        </span>
                      )}
                      <br />
                      Costo total: ${(quantity * unitCost).toFixed(2)}
                    </>
                  )}
                </div>
              </div>

              {/* Notas */}
              <div className="mb-3">
                <label className="form-label">
                  <strong>Notas (Opcional)</strong>
                </label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Agregar notas sobre esta compra de inventario..."
                />
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleClose}
                disabled={loading}
              >
                <i className="bi bi-x-lg me-2"></i>
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || !selectedItemId || quantity === 0 || (selectedItem?.current_stock && selectedItem.current_stock < Math.abs(quantity))}
              >
                <i className="bi bi-check-circle me-2"></i>
                {loading ? (quantity < 0 ? 'Restando...' : 'Agregando...') : (quantity < 0 ? 'Restar Inventario' : 'Agregar Inventario')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddInventoryModal; 