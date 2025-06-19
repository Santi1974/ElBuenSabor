import React from 'react';
import GenericABM from '../../../components/GenericABM/GenericABM';

const Promotions: React.FC = () => {
  // Helper function to calculate promotion price
  const calculatePromotionPrice = (item: any): string => {
    if (!item) return '$0.00';
    
    let totalPrice = 0;
    
    // Calculate total price from manufactured items
    if (item.manufactured_item_details && item.manufactured_item_details.length > 0) {
      item.manufactured_item_details.forEach((detail: any) => {
        if (detail.manufactured_item && detail.manufactured_item.price && detail.quantity) {
          totalPrice += detail.manufactured_item.price * detail.quantity;
        }
      });
    }
    
    // Calculate total price from inventory items
    if (item.inventory_item_details && item.inventory_item_details.length > 0) {
      item.inventory_item_details.forEach((detail: any) => {
        if (detail.inventory_item && detail.inventory_item.price && detail.quantity) {
          totalPrice += detail.inventory_item.price * detail.quantity;
        }
      });
    }
    
    // Apply discount
    const discountPercentage = item.discount_percentage || 0;
    const discountedPrice = totalPrice * (1 - discountPercentage / 100);
    
    return `$${discountedPrice.toFixed(2)}`;
  };

  const columns = [
    { field: 'name', headerName: 'Nombre', width: 200 },
    { field: 'description', headerName: 'Descripción', width: 250 },
    { field: 'discount_percentage', headerName: 'Descuento (%)', width: 120, type: 'number' as const },
    { 
      field: 'calculated_price', 
      headerName: 'Precio Final', 
      width: 130,
      type: 'calculated' as const,
      renderCell: calculatePromotionPrice
    },
    { 
      field: 'active', 
      headerName: 'Activa', 
      width: 100,
      type: 'select' as const,
      options: [
        { value: 'true', label: 'Sí' },
        { value: 'false', label: 'No' }
      ]
    }
  ];

  return (
    <div className="container-fluid p-4">
      <GenericABM
        title="Gestión de Promociones"
        columns={columns}
        type="promotion"
      />
    </div>
  );
};

export default Promotions; 