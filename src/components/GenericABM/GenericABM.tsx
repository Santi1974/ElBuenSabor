import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useABMData } from '../../hooks/useABMData';
import type { ABMType } from '../../hooks/useABMData';
import { useFormData } from '../../hooks/useFormData';
import DataTable from './DataTable';
import FormFields from './FormFields';
import { Modal, Button } from 'react-bootstrap';

interface GenericABMProps {
  title: string;
  columns: {
    field: string;
    headerName: string;
    width?: number;
    type?: 'text' | 'number' | 'date' | 'select' | 'password';
    options?: { value: string; label: string }[];
    createOnly?: boolean;
    viewOnly?: boolean;
  }[];
  type?: ABMType;
}

const GenericABM: React.FC<GenericABMProps> = ({
  title,
  columns,
  type = 'employee'
}) => {
  const [viewItem, setViewItem] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const {
    data,
    loadData,
    handleDelete
  } = useABMData(type);

  const {
    formData,
    selectedItem,
    passwordError: formPasswordError,
    initializeFormData,
    handleInputChange,
    handlePasswordConfirmChange,
    handleSubmit,
    resetForm
  } = useFormData(type, () => {
    loadData();
    setShowForm(false);
    setFormError(null);
  });

  const handleFormSubmit = async () => {
    try {
      await handleSubmit();
      setShowForm(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message);
    }
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
              <FormFields
                columns={columns}
                formData={formData}
                onInputChange={handleInputChange}
                type={type}
                isEditing={!!selectedItem}
                onPasswordConfirmChange={handlePasswordConfirmChange}
                passwordError={formPasswordError}
              />
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
                  {columns
                    .filter(column => column.viewOnly !== false && column.type !== 'password')
                    .map((column) => (
                    <div key={column.field} className="mb-2">
                      <strong>{column.headerName}: </strong>
                      {column.type === 'select' && column.options ? 
                        column.options.find(opt => opt.value === viewItem[column.field])?.label || viewItem[column.field]
                        : viewItem[column.field]}
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