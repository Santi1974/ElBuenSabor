import React, { useState, useEffect } from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';
import employeeService from '../../../services/employeeService';

interface Employee {
  id_key: number;
  full_name: string;
  email: string;
  role: string;
  phone_number: string;
  addresses?: any[];
  active?: boolean;
  google_sub?: string;
}

export const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    const filtered = employees.filter(employee => 
      (employee.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (employee.phone_number || '').includes(searchTerm)
    );
    setFilteredEmployees(filtered);
  }, [searchTerm, employees]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await employeeService.getAll();
      setEmployees(data);
      setFilteredEmployees(data);
      setError(null);
    } catch (err) {
      setError('Error al cargar los empleados');
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { field: 'full_name', headerName: 'Nombre', width: 200 },
    { field: 'email', headerName: 'Email', width: 250 },
    { 
      field: 'role', 
      headerName: 'Rol',
      width: 150,
      type: 'select' as const,
      options: [
        { value: 'administrador', label: 'Administrador' },
        { value: 'cliente', label: 'Cliente' },
        { value: 'empleado', label: 'Empleado' }
      ]
    },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 }
  ];

  const handleRowClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  if (loading) {
    return <div className="text-center p-4">Cargando...</div>;
  }

  if (error) {
    return <div className="text-center text-danger p-4">{error}</div>;
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre, email o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>
      <GenericABM
        title="Empleados"
        columns={columns}
        data={filteredEmployees}
        onAdd={() => {}}
        onEdit={() => {}}
        onDelete={() => {}}
        onRowClick={handleRowClick}
      />

      {/* Modal de detalles */}
      {selectedEmployee && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Detalles del Empleado</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedEmployee(null)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="fw-bold">Nombre Completo:</label>
                  <p>{selectedEmployee.full_name}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Email:</label>
                  <p>{selectedEmployee.email}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Rol:</label>
                  <p>{selectedEmployee.role}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Teléfono:</label>
                  <p>{selectedEmployee.phone_number}</p>
                </div>
                <div className="mb-3">
                  <label className="fw-bold">Estado:</label>
                  <p>
                    <span className={`badge ${selectedEmployee.active ? 'bg-success' : 'bg-danger'}`}>
                      {selectedEmployee.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </p>
                </div>
                {selectedEmployee.addresses && selectedEmployee.addresses.length > 0 && (
                  <div className="mb-3">
                    <label className="fw-bold">Direcciones:</label>
                    <ul className="list-unstyled">
                      {selectedEmployee.addresses.map((address, index) => (
                        <li key={index} className="mb-2">
                          {address.street}, {address.city}, {address.state}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedEmployee(null)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees; 