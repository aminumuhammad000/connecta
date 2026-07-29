import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../utils/storage';
import { useAuth } from './AuthContext';
import type { UserRole } from '../types';

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isClient: boolean;
  isFreelancer: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = storage.getRole() as UserRole;
    if (savedRole) return savedRole;
    return user?.userType || 'freelancer';
  });

  useEffect(() => {
    if (user?.userType) {
      setRoleState(user.userType);
      storage.setRole(user.userType);
    }
  }, [user]);

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    storage.setRole(newRole);
  };

  return (
    <RoleContext.Provider
      value={{
        role,
        setRole,
        isClient: role === 'client',
        isFreelancer: role === 'freelancer',
      }}
    >
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within a RoleProvider');
  return context;
};
