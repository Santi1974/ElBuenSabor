import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface GenericABMProps {
  title: string;
  columns: {
    field: string;
    headerName: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'select';
    options?: { value: string; label: string }[];
  }[];
  data: any[];
  onAdd: (item: any) => void;
  onEdit: (item: any) => void;
  onDelete: (id: string | number) => void;
  onRowClick?: (item: any) => void;
}

const GenericABM: React.FC<GenericABMProps> = ({
  title,
  columns,
  data,
  onAdd,
  onEdit,
  onDelete,
  onRowClick,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});

  const handleOpenModal = (item?: any) => {
    if (item) {
      setSelectedItem(item);
      setFormData(item);
    } else {
      setSelectedItem(null);
      setFormData({});
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setFormData({});
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItem) {
      onEdit(formData);
    } else {
      onAdd(formData);
    }
    handleCloseModal();
  };

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{title}</h2>
        <button
          className="btn btn-primary"
          onClick={() => handleOpenModal()}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Agregar
        </button>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.field} style={{ width: column.width }}>
                  {column.headerName}
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr 
                key={index}
                onClick={() => onRowClick?.(item)}
                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
              >
                {columns.map((column) => (
                  <td key={column.field}>{item[column.field]}</td>
                ))}
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenModal(item);
                    }}
                  >
                    <i className="bi bi-pencil"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                <form onSubmit={handleSubmit}>
                  {columns.map((column) => (
                    <div className="mb-3" key={column.field}>
                      <label className="form-label">{column.headerName}</label>
                      {column.type === 'select' ? (
                        <select
                          className="form-select"
                          value={formData[column.field] || ''}
                          onChange={(e) =>
                            handleInputChange(column.field, e.target.value)
                          }
                        >
                          <option value="">Seleccione...</option>
                          {column.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={column.type || 'text'}
                          className="form-control"
                          value={formData[column.field] || ''}
                          onChange={(e) =>
                            handleInputChange(column.field, e.target.value)
                          }
                        />
                      )}
                    </div>
                  ))}
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
    </div>
  );
};

export default GenericABM; 