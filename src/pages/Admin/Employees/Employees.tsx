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
        { value: 'delivery', label: 'Delivery' },
        { value: 'cocinero', label: 'Cocinero' },
        { value: 'cajero', label: 'Cajero'}
      ]
    },
    { field: 'phone_number', headerName: 'Teléfono', width: 150 }
  ];

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
        type="employee"
      />
    </div>
  );
};

export default Employees; 