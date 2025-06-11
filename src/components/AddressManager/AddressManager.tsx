import React, { useState, useEffect } from 'react';
import addressService, { type Address, type AddressFormData } from '../../services/addressService';
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

const AddressManager: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<AddressFormData>({
    street: '',
    street_number: 0,
    zip_code: '',
    name: '',
    locality_id: 0,
  });
  
  // Geography data
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<number | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);

  useEffect(() => {
    loadAddresses();
    loadCountries();
  }, []);

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const userAddresses = await addressService.getUserAddresses();
      // Asegurar que siempre sea un array
      setAddresses(Array.isArray(userAddresses) ? userAddresses : []);
    } catch (err: any) {
      setError('Error al cargar las direcciones');
      console.error('Error loading addresses:', err);
      setAddresses([]); // Asegurar que addresses sea un array vacío en caso de error
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await api.get('/country/');
      const countriesData = Array.isArray(response.data) ? response.data : [];
      setCountries(countriesData);
    } catch (err) {
      console.error('Error fetching countries:', err);
      setCountries([]);
      setError('Error al cargar los países');
    }
  };

  const provinces = selectedCountry
    ? countries.find(c => c.id_key === selectedCountry)?.provinces || []
    : [];

  const localities = selectedProvince
    ? provinces.find(p => p.id_key === selectedProvince)?.localities || []
    : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'street_number' || name === 'locality_id' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      if (editingAddress) {
        await addressService.update(editingAddress.id_key, formData);
      } else {
        await addressService.create(formData);
      }
      
      await loadAddresses();
      resetForm();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al guardar la dirección');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      street: address.street,
      street_number: address.street_number,
      zip_code: address.zip_code,
      name: address.name,
      locality_id: address.locality_id,
    });
    setShowForm(true);
    
    // Find and set the country and province for this locality
    // This is a simplified approach - in a real app you might want to store this data
    // or make additional API calls to get the hierarchy
  };

  const handleDelete = async (address: Address) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la dirección "${address.name}"?`)) {
      try {
        await addressService.delete(address.id_key);
        await loadAddresses();
      } catch (err: any) {
        setError('Error al eliminar la dirección');
      }
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
    setEditingAddress(null);
    setShowForm(false);
    setSelectedCountry(null);
    setSelectedProvince(null);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5>
          <i className="bi bi-geo-alt me-2"></i>
          Mis Direcciones
        </h5>
        {!showForm && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowForm(true)}
          >
            <i className="bi bi-plus me-1"></i>
            Nueva Dirección
          </button>
        )}
      </div>

      {error && (
        <div className="alert alert-danger" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </div>
      )}

      {showForm && (
        <div className="card mb-3">
          <div className="card-header">
            <h6 className="mb-0">
              {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
            </h6>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-8">
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
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
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
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
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
                <div className="col-md-6">
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
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">País</label>
                <select
                  className="form-select"
                  value={selectedCountry ?? ''}
                  onChange={e => {
                    setSelectedCountry(Number(e.target.value));
                    setSelectedProvince(null);
                    setFormData(f => ({ ...f, locality_id: 0 }));
                  }}
                  required
                >
                  <option value="">Selecciona un país</option>
                  {Array.isArray(countries) && countries.map(c => (
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
                    setSelectedProvince(Number(e.target.value));
                    setFormData(f => ({ ...f, locality_id: 0 }));
                  }}
                  disabled={!selectedCountry}
                  required
                >
                  <option value="">Selecciona una provincia</option>
                  {Array.isArray(provinces) && provinces.map(p => (
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
                  {Array.isArray(localities) && localities.map(l => (
                    <option key={l.id_key} value={l.id_key}>{l.name}</option>
                  ))}
                </select>
              </div>

              <div className="d-flex gap-2">
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
                  {saving ? 'Guardando...' : editingAddress ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {(!Array.isArray(addresses) || addresses.length === 0) && !showForm ? (
        <div className="text-center py-4 text-muted">
          <i className="bi bi-geo-alt fs-1"></i>
          <p className="mt-2">No tienes direcciones guardadas</p>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            Agregar primera dirección
          </button>
        </div>
      ) : Array.isArray(addresses) && addresses.length > 0 ? (
        <div className="row">
          {addresses.map(address => (
            <div key={address.id_key} className="col-md-6 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-geo-alt-fill me-2 text-primary"></i>
                      {address.name}
                    </h6>
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-outline-primary"
                        onClick={() => handleEdit(address)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger"
                        onClick={() => handleDelete(address)}
                        title="Eliminar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                  <p className="card-text mb-1">
                    <strong>{address.street} {address.street_number}</strong>
                  </p>
                  <p className="card-text mb-1">
                    {address.locality_name ? address.locality_name : `Localidad ID: ${address.locality_id}`}
                  </p>
                  <small className="text-muted">CP: {address.zip_code}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default AddressManager; 