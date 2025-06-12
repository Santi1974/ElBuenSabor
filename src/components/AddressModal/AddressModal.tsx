import React, { useState, useEffect } from 'react';
import type { Address, AddressFormData } from '../../types/address';
import api from '../../services/api';

interface Country {
  id_key: number;
  name: string;
  provinces: Province[];
}

interface Province {
  id_key: number;
  name: string;
  localities: Locality[];
}

interface Locality {
  id_key: number;
  name: string;
}

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
    street_number: 0,
    zip_code: '',
    name: '',
    locality_id: 0,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  useEffect(() => {
    api.get('/country/')
      .then(res => {
        const countriesData = res.data.items || [];
        setCountries(countriesData);
      })
      .catch(err => {
        console.error('Error fetching countries:', err);
        setCountries([]);
      });
  }, []);

  const provinces = selectedCountry
    ? countries.find(c => c.id_key === selectedCountry)?.provinces || []
    : [];

  const localities = selectedProvince
    ? provinces.find(p => p.id_key === selectedProvince)?.localities || []
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: AddressFormData) => ({
      ...prev,
      [name]: name === 'street_number' || name === 'locality_id' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.post('/address/user/addresses', formData);
      onSave(formData);
      setFormData({
        street: '',
        street_number: 0,
        zip_code: '',
        name: '',
        locality_id: 0,
      });
      setShowForm(false);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      street: '',
      street_number: 0,
      zip_code: '',
      name: '',
      locality_id: 0,
    });
    setSelectedCountry(null);
    setSelectedProvince(null);
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
                          key={address.id_key}
                          className="list-group-item list-group-item-action"
                          onClick={() => onSelectAddress?.(address)}
                        >
                          <div className="d-flex w-100 justify-content-between">
                            <h6 className="mb-1">{address.street} {address.street_number}</h6>
                          </div>
                          <p className="mb-1">
                            {('locality_name' in address && address.locality_name)
                              ? `${address.locality_name} (ID: ${address.locality_id})`
                              : `ID Localidad: ${address.locality_id}`}
                          </p>
                          <small className="text-muted d-block">{address.zip_code} - {address.name}</small>
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
                      <label htmlFor="street_number" className="form-label">Número</label>
                      <input
                        type="number"
                        className="form-control"
                        id="street_number"
                        name="street_number"
                        value={formData.street_number}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="col">
                      <label htmlFor="zip_code" className="form-label">Código Postal</label>
                      <input
                        type="text"
                        className="form-control"
                        id="zip_code"
                        name="zip_code"
                        value={formData.zip_code}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label">Referencia / Alias</label>
                    <input
                      type="text"
                      className="form-control"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Ej: Casa, Trabajo, etc."
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">País</label>
                    <select
                      className="form-select"
                      value={selectedCountry ?? ''}
                      onChange={e => {
                        setSelectedCountry(Number(e.target.value) || null);
                        setSelectedProvince(null);
                        setFormData(f => ({ ...f, locality_id: 0 }));
                      }}
                      required
                    >
                      <option value="">Selecciona un país</option>
                      {countries.map(c => (
                        <option key={c.id_key} value={c.id_key}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Provincia</label>
                    <select
                      className="form-select"
                      value={selectedProvince ?? ''}
                      onChange={e => {
                        setSelectedProvince(Number(e.target.value) || null);
                        setFormData(f => ({ ...f, locality_id: 0 }));
                      }}
                      disabled={!selectedCountry}
                      required
                    >
                      <option value="">Selecciona una provincia</option>
                      {provinces.map(p => (
                        <option key={p.id_key} value={p.id_key}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Localidad</label>
                    <select
                      className="form-select"
                      name="locality_id"
                      value={formData.locality_id}
                      onChange={handleChange}
                      disabled={!selectedProvince}
                      required
                    >
                      <option value="">Selecciona una localidad</option>
                      {localities.map(l => (
                        <option key={l.id_key} value={l.id_key}>{l.name}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="d-flex gap-2 justify-content-end">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={resetForm}
                      disabled={saving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={saving}
                    >
                      {saving ? 'Guardando...' : 'Guardar'}
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