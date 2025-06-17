import React from 'react';

interface StatusFilters {
  a_confirmar: boolean;
  en_cocina: boolean;
  listo: boolean;
  en_delivery: boolean;
  entregado: boolean;
}

interface OrderFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilters: StatusFilters;
  onFilterChange: (filterName: string) => void;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilters,
  onFilterChange
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">
          <i className="bi bi-funnel me-2"></i>
          Filtros
        </h6>
      </div>
      <div className="card-body">
        <div className="mb-3">
          <label className="form-label">Buscar:</label>
          <input
            type="text"
            className="form-control form-control-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar pedidos..."
          />
        </div>
        <div className="d-flex flex-column gap-2">
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="pending" 
              checked={statusFilters.a_confirmar}
              onChange={() => onFilterChange('a_confirmar')}
            />
            <label className="form-check-label" htmlFor="pending">
              A confirmar
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="en_cocina" 
              checked={statusFilters.en_cocina}
              onChange={() => onFilterChange('en_cocina')}
            />
            <label className="form-check-label" htmlFor="en_cocina">
              En cocina
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="listo" 
              checked={statusFilters.listo}
              onChange={() => onFilterChange('listo')}
            />
            <label className="form-check-label" htmlFor="listo">
              Listo
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="on-way" 
              checked={statusFilters.en_delivery}
              onChange={() => onFilterChange('en_delivery')}
            />
            <label className="form-check-label" htmlFor="on-way">
              En camino
            </label>
          </div>
          <div className="form-check">
            <input 
              className="form-check-input" 
              type="checkbox" 
              id="delivered" 
              checked={statusFilters.entregado}
              onChange={() => onFilterChange('entregado')}
            />
            <label className="form-check-label" htmlFor="delivered">
              Entregado
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters; 