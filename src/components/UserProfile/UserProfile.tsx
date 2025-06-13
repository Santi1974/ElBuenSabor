import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import userProfileService from '../../services/userProfileService';
import type { UpdateProfileData } from '../../services/userProfileService';
import AddressManager from '../AddressManager/AddressManager';
import PasswordField from '../PasswordField/PasswordField';
import { handleError } from '../../utils/errorHandler';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  isModal?: boolean;
}

const UserProfileComponent: React.FC<UserProfileProps> = ({ isOpen, onClose, isModal = true }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
  
  // Form data
  const [formData, setFormData] = useState<UpdateProfileData>({
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    image_url: ''
  });
  
  const [confirmPassword, setConfirmPassword] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userProfile = await userProfileService.getCurrentProfile();
      setFormData({
        full_name: userProfile.full_name,
        email: userProfile.email,
        phone_number: userProfile.phone_number,
        password: '',
        image_url: userProfile.image_url || ''
      });
      
      // Set image preview if exists
      if (userProfile.image_url) {
        setImagePreview(userProfile.image_url);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error); // Debug log
      setError(handleError(error, 'load profile'));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof UpdateProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen debe ser menor a 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Result = e.target?.result as string;
        setImagePreview(base64Result);
        setFormData(prev => ({
          ...prev,
          image_url: base64Result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData(prev => ({
      ...prev,
      image_url: ''
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      // Validaciones
      if (formData.password && formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        setLoading(false);
        return;
      }

      if (formData.password && !/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
        setError('La contraseña debe contener al menos una letra y un número');
        setLoading(false);
        return;
      }

      if (formData.password && formData.password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        setLoading(false);
        return;
      }

      // Preparar datos para enviar
      const updateData: UpdateProfileData = {
        full_name: formData.full_name,
        email: formData.email,
        phone_number: formData.phone_number,
        image_url: formData.image_url
      };

      // Solo incluir contraseña si se ingresó una nueva
      if (formData.password && formData.password.trim() !== '') {
        updateData.password = formData.password;
      }

      await userProfileService.updateProfile(updateData);
      
      setSuccess('Perfil actualizado correctamente');
      
      // Limpiar contraseña después de actualizar
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
      setConfirmPassword('');
      
    } catch (error: any) {
      setError(handleError(error, 'update profile'));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const content = (
    <>
      {isModal && (
        <div className="modal-header">
          <h5 className="modal-title">
            <i className="bi bi-person-circle me-2 text-primary"></i>
            Mi Perfil
          </h5>
          <button
            type="button"
            className="btn-close"
            onClick={onClose}
          ></button>
        </div>
      )}
      
      <div className="modal-body">
        {/* Navigation Tabs */}
        <ul className="nav nav-tabs mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('profile');
                setError(null);
                setSuccess(null);
              }}
              type="button"
            >
              <i className="bi bi-person me-2"></i>
              Información Personal
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('addresses');
                setError(null);
                setSuccess(null);
              }}
              type="button"
            >
              <i className="bi bi-geo-alt me-2"></i>
              Mis Direcciones
            </button>
          </li>
        </ul>

        {/* Messages */}
        {error && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            <i className="bi bi-exclamation-triangle me-2"></i>
            {error}
            <button type="button" className="btn-close" onClick={() => setError(null)}></button>
          </div>
        )}

        {success && (
          <div className="alert alert-success alert-dismissible" role="alert">
            <i className="bi bi-check-circle me-2"></i>
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess(null)}></button>
          </div>
        )}

        {loading && activeTab === 'profile' && (
          <div className="text-center mb-3">
            <div className="spinner-border spinner-border-sm text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'profile' ? (
        <form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="fullName" className="form-label">
                  <i className="bi bi-person me-2"></i>
                  Nombre Completo
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="fullName"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  <i className="bi bi-envelope me-2"></i>
                  Email
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="phoneNumber" className="form-label">
                  <i className="bi bi-telephone me-2"></i>
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="form-control"
                  id="phoneNumber"
                  value={formData.phone_number}
                  onChange={(e) => handleInputChange('phone_number', e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="imageUpload" className="form-label">
                  <i className="bi bi-image me-2"></i>
                  Imagen de Perfil
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3 text-center">
                    <div className="position-relative d-inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="rounded border"
                        style={{ 
                          width: '120px', 
                          height: '120px', 
                          objectFit: 'cover' 
                        }}
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle"
                        style={{ transform: 'translate(25%, -25%)' }}
                        onClick={removeImage}
                        disabled={loading}
                      >
                        <i className="bi bi-x"></i>
                      </button>
                    </div>
                  </div>
                )}
                
                <input
                  type="file"
                  className="form-control"
                  id="imageUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={loading}
                />
                <small className="text-muted">
                  Formatos permitidos: JPG, PNG, GIF. Máximo 5MB.
                </small>
              </div>
            </div>
          </div>

          <hr className="my-4" />

          <h6 className="text-muted mb-3">
            <i className="bi bi-shield-lock me-2"></i>
            Cambiar Contraseña (Opcional)
          </h6>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="password" className="form-label">
                  <i className="bi bi-key me-2"></i>
                  Nueva Contraseña
                </label>
                <PasswordField
                  value={formData.password || ''}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="Dejar vacío para mantener actual"
                  className={`form-control ${loading ? 'disabled' : ''}`}
                  id="password"
                />
                <small className="text-muted">Mínimo 6 caracteres, con letras y números</small>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">
                  <i className="bi bi-key-fill me-2"></i>
                  Confirmar Nueva Contraseña
                </label>
                <PasswordField
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir nueva contraseña"
                  className={`form-control ${loading ? 'disabled' : ''}`}
                  id="confirmPassword"
                />
              </div>
            </div>
          </div>

          <div className="text-end mt-4">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Actualizando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-circle me-2"></i>
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
        ) : (
          <AddressManager />
        )}
      </div>
    </>
  );

  if (isModal) {
    return (
      <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
};

export default UserProfileComponent; 