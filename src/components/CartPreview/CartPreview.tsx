import React, { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';

const CartPreview: React.FC = () => {
  const { items, totalItems, removeItem, updateQuantity } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
      setIsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const totalPrice = items.reduce((sum, item) => sum + (item.product?.price * item.quantity), 0);

  return (
    <div className="position-relative" ref={tooltipRef}>
      <button
        className="btn btn-primary d-flex align-items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="bi bi-cart"></i>
        {totalItems > 0 && (
          <span className="badge bg-danger rounded-pill">{totalItems}</span>
        )}
      </button>

      {isOpen && items.length > 0 && (
        <div className="position-absolute end-0 mt-2 p-3 bg-white rounded shadow-lg" 
             style={{ width: '350px', zIndex: 1000 }}>
          <h6 className="mb-3">Carrito de Compras</h6>
          
          <div className="mb-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {items.map(item => (
              <div key={item.product.id_key} className="card mb-2">
                <div className="card-body p-2">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-0">{item.product.name}</h6>
                      <span className="text-primary fw-bold">
                        ${item.product.price}
                      </span>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(item.product.id_key)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                  
                  <div className="d-flex align-items-center gap-2">
                    <div className="input-group input-group-sm" style={{ width: '120px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => updateQuantity(item.product.id_key, item.quantity - 1)}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <span className="form-control text-center">
                        {item.quantity}
                      </span>
                      <button
                        className="btn btn-outline-secondary"
                        type="button"
                        onClick={() => updateQuantity(item.product.id_key, item.quantity + 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                    <span className="ms-auto text-muted">
                      Total: ${(item.product.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="border-top pt-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="fw-bold">Total:</span>
              <span className="fw-bold text-primary">${totalPrice.toFixed(2)}</span>
            </div>
            <Link 
              to="/cart" 
              className="btn btn-primary w-100"
              onClick={() => setIsOpen(false)}
            >
              Ver Carrito
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPreview; 