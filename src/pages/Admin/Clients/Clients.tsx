import React, { useState } from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';
import { ClientOrdersModal } from './components';
import './Clients.css';

const Clients: React.FC = () => {
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const columns = [
    { field: 'full_name', headerName: 'Nombre', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'role', 
      headerName: 'Rol', 
      width: 150,
      type: 'select' as const,
      options: [
        { value: 'cliente', label: 'Cliente' }
      ]
    },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 },
  ];

  const handleViewClientOrders = (client: any) => {
    setSelectedClient(client);
    setShowOrdersModal(true);
  };

  const handleCloseOrdersModal = () => {
    setShowOrdersModal(false);
    setSelectedClient(null);
  };

  return (
    <>
      <GenericABM
        title="Gestión de Clientes"
        columns={columns}
        type="client"
        onViewOrders={handleViewClientOrders}
      />

      <ClientOrdersModal
        isOpen={showOrdersModal}
        client={selectedClient}
        onClose={handleCloseOrdersModal}
      />
    </>
  );
};

export default Clients; 