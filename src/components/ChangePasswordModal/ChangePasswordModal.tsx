import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { authService } from '../../services/api';
import PasswordField from '../PasswordField/PasswordField';

interface ChangePasswordModalProps {
  onPasswordChanged: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onPasswordChanged }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(newPassword)) {
      setError('La contraseña debe contener al menos una letra y un número');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changeEmployeePassword(newPassword);
      onPasswordChanged();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cambiar la contraseña. Inténtelo nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title text-center w-100">
              <i className="bi bi-shield-lock me-2 text-warning"></i>
              Cambio de Contraseña Obligatorio
            </h5>
          </div>
          <div className="modal-body px-4">
            <div className="alert alert-info" role="alert">
              <i className="bi bi-info-circle me-2"></i>
              Por tu seguridad, debes cambiar la contraseña antes de continuar.
            </div>

            {error && (
              <div className="alert alert-danger" role="alert">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="newPassword" className="form-label">
                  Nueva Contraseña
                </label>
                <PasswordField
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres, con letras y números"
                  required={true}
                  className={`form-control ${isLoading ? 'disabled' : ''}`}
                  id="newPassword"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirmar Nueva Contraseña
                </label>
                <PasswordField
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repetir contraseña"
                  required={true}
                  className={`form-control ${isLoading ? 'disabled' : ''}`}
                  id="confirmPassword"
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-100"
                disabled={isLoading || !newPassword || !confirmPassword}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Cambiando contraseña...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Cambiar Contraseña
                  </>
                )}
              </button>
            </form>
          </div>
          <div className="modal-footer border-0 justify-content-center">
            <small className="text-muted">
              <i className="bi bi-shield-check me-1"></i>
              Esta acción es obligatoria por razones de seguridad
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal; 