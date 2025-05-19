import React, { useState } from 'react';
import type { Address, AddressFormData } from '../../types/address';

interface AddressModalProps {
  show: boolean;
  onHide: () => void;
  onSave: (address: AddressFormData) => void;
  addresses: Address[];
  onSelectAddress?: (address: Address) => void;
}

const AddressModal: React.FC<AddressModalProps> = ({
  show,
  onHide,
  onSave,
  addresses,
  onSelectAddress
}) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    number: '',
    apartment: '',
    city: '',
    province: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setFormData({
      street: '',
      number: '',
      apartment: '',
      city: '',
      province: '',
      notes: ''
    });
    setShowForm(false);
  };

  if (!show) return null;

  return (
    <>
      <div className="modal-backdrop show"></div>
      <div className="modal d-block" tabIndex={-1}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {showForm ? 'Agregar nueva dirección' : 'Seleccionar dirección'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
              ></button>
            </div>
            <div className="modal-body">
              {!showForm ? (
                <>
                  {addresses.length > 0 ? (
                    <div className="list-group mb-3">
                      {addresses.map((address) => (
                        <button
                          key={address.id}
                          className="list-group-item list-group-item-action"
                          onClick={() => onSelectAddress?.(address)}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{address.street} {address.number}</h6>
                            {address.apartment && (
                              <small className="text-muted">Apto {address.apartment}</small>
                            )}
                          </div>
                          <p className="mb-1">{address.city}, {address.province}</p>
                          {address.notes && (
                            <small className="text-muted d-block">{address.notes}</small>
                          )}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center mb-3">No hay direcciones guardadas</p>
                  )}
                  <button
                    className="btn btn-primary w-100"
                    onClick={() => setShowForm(true)}
                  >
                    Agregar nueva dirección
                  </button>
                </>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="street" className="form-label">Calle</label>
                    <input
                      type="text"
                      className="form-control"
                      id="street"
                      name="street"
                      value={formData.street}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="row mb-3">
                    <div className="col">
                      <label htmlFor="number" className="form-label">Número</label>
                      <input
                        type="text"
                        className="form-control"
                        id="number"
                        name="number"
                        value={formData.number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="apartment" className="form-label">Apartamento</label>
                      <input
                        type="text"
                        className="form-control"
                        id="apartment"
                        name="apartment"
                        value={formData.apartment}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="city" className="form-label">Ciudad</label>
                    <input
                      type="text"
                      className="form-control"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="province" className="form-label">Provincia</label>
                    <input
                      type="text"
                      className="form-control"
                      id="province"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="notes" className="form-label">Notas adicionales</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={2}
                    />
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={() => setShowForm(false)}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary w-100"
                    >
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddressModal; 