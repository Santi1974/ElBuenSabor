import React, { useState, useRef } from 'react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import './CartPreview.css';

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
    <div className="cart-preview-container" ref={tooltipRef}>
      <button
        className="cart-preview-button position-relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <i className="bi bi-cart"></i>
        {totalItems > 0 && (
          <span className="cart-preview-badge">{totalItems}</span>
        )}
      </button>

      {isOpen && items.length > 0 && (
        <div className="cart-preview-dropdown">
          <div className="cart-preview-header">Carrito de Compras</div>
          
          <div className="cart-preview-items">
            {items.map(item => (
              <div key={item.product.id_key} className="cart-item-card">
                <div className="cart-item-header">
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.product.name}</div>
                    <div className="cart-item-price">${item.product.price}</div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeItem(item.product.id_key)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
                
                <div className="cart-item-controls">
                  <div className="cart-quantity-controls">
                    <button
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.product.id_key, item.quantity - 1)}
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <div className="cart-quantity-display">
                      {item.quantity}
                    </div>
                    <button
                      className="cart-quantity-btn"
                      onClick={() => updateQuantity(item.product.id_key, item.quantity + 1)}
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                  <div className="cart-item-total">
                    Total: ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-preview-footer">
            <div className="cart-preview-total">
              <span>Total:</span>
              <span className="cart-preview-total-amount">${totalPrice.toFixed(2)}</span>
            </div>
            <Link 
              to="/cart" 
              className="cart-preview-view-btn"
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