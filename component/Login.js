import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css'; // fichier CSS partagé

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation basique
    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      setLoading(false);
      return;
    }

    const result = await authService.login(email, password);
    
    if (result.success) {
      // Rediriger selon le type d'utilisateur
      if (result.isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <h2 className="auth-title">Log In</h2>
        <span className="page-indicator">2 / 14</span>
      </div>

      <div className="auth-card">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-circle">
            <img 
              src="/logo.png" 
              alt="StudyHub Logo" 
              className="logo-image"
            />
            <span className="logo-text">studyhub</span>
          </div>
        </div>

        {/* Titre de bienvenue */}
        <h1 className="welcome-title">Bienvenue !</h1>

        {/* Formulaire */}
        <form onSubmit={handleLogin} className="auth-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Email ou numero de telephone*"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            disabled={loading}
          />

          <input
            type="password"
            placeholder="Mot de passe*"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            disabled={loading}
          />

          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Continuer'}
          </button>

          <p className="auth-link-text">
            Vous n'avez pas de compte ? {' '}
            <Link to="/signup" className="auth-link">
              Inscrivez-vous
            </Link>
          </p>
        </form>
      </div>

      {/* Footer */}
      <div className="auth-footer">
        <a href="#" className="footer-link">Terms of Use</a>
        <span className="footer-separator">|</span>
        <a href="#" className="footer-link">Privacy Policy</a>
      </div>
    </div>
  );
}

export default Login;