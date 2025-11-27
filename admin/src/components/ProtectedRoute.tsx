import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const token = localStorage.getItem('admin_token');
  const isAuthenticated = !!token;

  console.log('ProtectedRoute check:', { isAuthenticated, hasToken: !!token, tokenLength: token?.length });

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
