import React from 'react';
import ClientLayout from '../../../components/ClientLayout/ClientLayout';
import UserProfile from '../../../components/UserProfile';

const Profile: React.FC = () => {
  return (
    <ClientLayout 
      title="Mi Perfil" 
      showBackButton={true}
      showSearchBar={false}
    >
      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0">
              <div className="card-header bg-primary text-white">
                <h4 className="mb-0">
                  <i className="bi bi-person-circle me-2"></i>
                  Configuración de Perfil
                </h4>
              </div>
              <div className="card-body p-0">
                {/* Embedded UserProfile component without modal wrapper */}
                <UserProfile isOpen={true} onClose={() => {}} isModal={false} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default Profile; 