import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/AuthService';
import { useAuth } from '../hooks/useAuth';
import logoImage from '../assets/logo.png';
import './AdminView.css';

const AdminView = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { currentUser: _currentUser } = useAuth(); // Renommé pour éviter l'avertissement
  const navigate = useNavigate();

  // Écouter les utilisateurs en temps réel
  useEffect(() => {
    console.log('🔄 Démarrage du listener utilisateurs...');
    
    let isMounted = true;
    
    const initializeListener = () => {
      if (isMounted) {
        setLoading(true);
      }
      
      const unsubscribe = authService.getUsersStream((usersData) => {
        if (isMounted) {
          console.log('✅ Données reçues:', usersData);
          setUsers(usersData);
          setLoading(false);
        }
      });

      return () => {
        console.log('🛑 Arrêt du listener utilisateurs');
        unsubscribe();
      };
    };

    const cleanup = initializeListener();

    return () => {
      isMounted = false;
      if (cleanup) cleanup();
    };
  }, []);

  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter((user) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.nom?.toLowerCase().includes(searchLower) ||
      user.prenom?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const handleUserClick = (user) => {
    navigate(`/admin/user/${user.id}`, { state: { user } });
  };

  return (
    <div className="admin-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <img src={logoImage} alt="StudyHub Logo" className="sidebar-logo" />
          <button onClick={handleLogout} className="logout-button">
            <span className="admin-label">Admin</span>
            <span className="logout-text">déconnexion</span>
          </button>
        </div>

        <div className="divider" />

        <div className="sidebar-info">
          <div className="info-icon">👨‍🎓</div>
          <h3 className="info-title">Liste des étudiants</h3>
          <p className="info-description">
            Tous les étudiants inscrits dans la plateforme
          </p>
        </div>

        <div className="spacer" />

        <nav className="sidebar-nav">
          <button
            className="nav-item"
            onClick={() => navigate('/admin/statistics')}
          >
            <span className="nav-icon">📊</span>
            <span>Statistiques</span>
          </button>
          <button
            className="nav-item"
            onClick={() => navigate('/admin/create-course')}
          >
            <span className="nav-icon">➕</span>
            <span>Créer cours</span>
          </button>
        </nav>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className="admin-main">
        {/* Barre de recherche */}
        <div className="search-bar bg-white shadow-sm">
          <div className="search-input-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control form-control-lg"
            />
          </div>
          <span className="badge bg-primary fs-6 px-4 py-2">
            {filteredUsers.length} étudiant{filteredUsers.length > 1 ? 's' : ''}
          </span>
        </div>

        {/* Grille d'utilisateurs */}
        <div className="users-grid-container">
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Chargement des étudiants...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">👥</span>
              <p>
                {searchQuery
                  ? 'Aucun étudiant trouvé'
                  : 'Aucun étudiant inscrit'}
              </p>
            </div>
          ) : (
            <div className="users-grid">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={() => handleUserClick(user)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Composant Card utilisateur
const UserCard = ({ user, onClick }) => {
  return (
    <div className="user-card" onClick={onClick}>
      <div className="user-card-type">{user.type || 'Étudiant'}</div>

      <div className="user-avatar">
        <span className="avatar-icon">👤</span>
      </div>

      <div className="user-info-group">
        <span className="info-label">ID</span>
        <span className="info-value">{user.uid?.substring(0, 8) || 'N/A'}</span>
      </div>

      <div className="user-info-group">
        <span className="info-label">Nom</span>
        <span className="info-value">{user.nom || 'Non renseigné'}</span>
      </div>

      <div className="user-info-group">
        <span className="info-label">Prénom</span>
        <span className="info-value">{user.prenom || 'Non renseigné'}</span>
      </div>

      <div className="user-info-group">
        <span className="info-label">Email</span>
        <span className="info-value info-email" title={user.email}>
          {user.email || 'Non renseigné'}
        </span>
      </div>
    </div>
  );
};

export default AdminView;