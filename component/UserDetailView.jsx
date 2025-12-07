import { useNavigate, useLocation } from 'react-router-dom';
import './UserDetailView.css';

const UserDetailView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user;

  if (!user) {
    return (
      <div className="error-container">
        <h2>Utilisateur introuvable</h2>
        <button onClick={() => navigate('/admin/dashboard')}>
          Retour au dashboard
        </button>
      </div>
    );
  }

  // Formater la date d'inscription
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Non disponible';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="user-detail-container">
      {/* Header avec retour */}
      <div className="detail-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          ← Retour
        </button>
        <h1 className="detail-title">Détails de l'étudiant</h1>
      </div>

      <div className="detail-content">
        {/* Card principale */}
        <div className="detail-card">
          {/* Avatar et infos principales */}
          <div className="user-header-section">
            <div className="user-avatar-large">
              <span className="avatar-icon-large">👤</span>
            </div>
            <h2 className="user-full-name">
              {user.prenom} {user.nom}
            </h2>
            <span className="user-type-badge">{user.type || 'Étudiant'}</span>
            <span className="user-status-badge">{user.status || 'Actif'}</span>
          </div>

          <div className="divider-horizontal" />

          {/* Informations détaillées */}
          <div className="info-sections">
            <div className="info-section">
              <h3 className="section-title">📧 Informations de contact</h3>
              <div className="info-grid">
                <InfoItem label="Email" value={user.email} />
                <InfoItem label="ID Utilisateur" value={user.uid} />
              </div>
            </div>

            <div className="info-section">
              <h3 className="section-title">🎓 Informations académiques</h3>
              <div className="info-grid">
                <InfoItem 
                  label="Établissement" 
                  value={user.etablissement || 'Non renseigné'} 
                />
                <InfoItem 
                  label="Niveau" 
                  value={user.niveau || 'Non renseigné'} 
                />
              </div>
            </div>

            <div className="info-section">
              <h3 className="section-title">📅 Informations système</h3>
              <div className="info-grid">
                <InfoItem 
                  label="Date d'inscription" 
                  value={formatDate(user.dateInscription)} 
                />
                <InfoItem 
                  label="Statut du compte" 
                  value={user.status || 'Actif'} 
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="action-buttons p-4 bg-light border-top">
            <button className="btn btn-secondary me-2" onClick={() => navigate(-1)}>
              Fermer
            </button>
            <button className="btn btn-danger">
              <i className="bi bi-lock-fill me-2"></i>
              Suspendre le compte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher une info
const InfoItem = ({ label, value }) => {
  return (
    <div className="info-item">
      <span className="info-item-label">{label}</span>
      <span className="info-item-value">{value || 'Non renseigné'}</span>
    </div>
  );
};

export default UserDetailView;