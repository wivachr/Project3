import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRights = [] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  if (allowedRights.length && !allowedRights.includes(user.right)) return <Navigate to="/" replace />;
  return children;
}
