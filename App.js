// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Login from './component/Login';
import Signup from './component/Signup';

// Composants de protection de routes
function PrivateRoute({ children }) {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center',
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Chargement...
      </div>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Chargement...
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  return children;
}

function PublicRoute({ children }) {
  const { currentUser, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Chargement...
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to={isAdmin ? "/admin/dashboard" : "/dashboard"} />;
  }

  return children;
}

// Composants de pages temporaires (à remplacer par vos vraies pages)
function Dashboard() {
  const { userDetails, currentUser } = useAuth();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Dashboard Étudiant</h1>
      <p>Bienvenue {userDetails?.prenom} {userDetails?.nom}!</p>
      <p>Email: {currentUser?.email}</p>
      <button onClick={() => {
        import('./services/authService').then(module => module.default.logout());
      }}>
        Se déconnecter
      </button>
    </div>
  );
}

function AdminDashboard() {
  const { currentUser } = useAuth();
  
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <h1>Dashboard Admin</h1>
      <p>Bienvenue Admin: {currentUser?.email}</p>
      <button onClick={() => {
        import('./services/authService').then(module => module.default.logout());
      }}>
        Se déconnecter
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/signup" 
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          } 
        />

        {/* Routes protégées - Étudiants */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Routes protégées - Admin */}
        <Route 
          path="/admin/dashboard" 
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } 
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        {/* Page 404 */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;