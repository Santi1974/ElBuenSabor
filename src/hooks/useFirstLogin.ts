import { useState, useEffect } from 'react';
import { authService } from '../services/api';

export const useFirstLogin = () => {
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  useEffect(() => {
    // Check if user needs to change password on app load
    const user = authService.getCurrentUser();
    if (user && user.first_login) {
      setNeedsPasswordChange(true);
    }
  }, []);

  const setFirstLoginRequired = (required: boolean) => {
    setNeedsPasswordChange(required);
  };

  const completePasswordChange = () => {
    setNeedsPasswordChange(false);
  };

  return {
    needsPasswordChange,
    setFirstLoginRequired,
    completePasswordChange
  };
}; 