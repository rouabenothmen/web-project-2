import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/AuthService';
import logoImage from '../assets/logo.png'; // ✅ Ajout du logo
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    etablissement: '',
    niveau: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.nom || !formData.prenom || !formData.email || 
        !formData.password || !formData.etablissement || !formData.niveau) {
      setError('Veuillez remplir tous les champs obligatoires');
      setLoading(false);
      return;
    }

    const result = await authService.signupWithDetails({
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      password: formData.password,
      etablissement: formData.etablissement,
      userType: 'Étudiant',
      niveau: formData.niveau
    });
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-header">
        <button 
          onClick={() => navigate('/login')} 
          className="back-button"
        >
          ← Sign Up
        </button>
      </div>

      <div className="auth-card signup-card">
        
        {/* -------- LOGO CERCLE -------- */}
        <div className="logo-container">
          <div 
            className="logo-circle"
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              border: "3px solid #f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            <img 
              src={logoImage}
              alt="StudyHub Logo"
              style={{
                width: "80%",
                height: "80%",
                objectFit: "contain"
              }}
            />
          </div>
        </div>
        {/* -------- FIN LOGO -------- */}

        <h1 className="welcome-title">Créer un compte</h1>

        <form onSubmit={handleSignup} className="auth-form signup-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              name="nom"
              placeholder="Nom*"
              value={formData.nom}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="prenom"
              placeholder="Prénom*"
              value={formData.prenom}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="email"
              name="email"
              placeholder="Email*"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="password"
              name="password"
              placeholder="Mot de passe*"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <input
              type="text"
              name="etablissement"
              placeholder="Établissement*"
              value={formData.etablissement}
              onChange={handleChange}
              className="form-control"
              disabled={loading}
            />
          </div>

          <div className="mb-3">
            <select
              name="niveau"
              value={formData.niveau}
              onChange={handleChange}
              className="form-select"
              disabled={loading}
            >
              <option value="">Niveau scolaire*</option>
              <option value="Licence 1">Licence 1</option>
              <option value="Licence 2">Licence 2</option>
              <option value="Licence 3">Licence 3</option>
              <option value="Master 1">Master 1</option>
              <option value="Master 2">Master 2</option>
              <option value="Doctorat">Doctorat</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-100 btn-lg"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Inscription...
              </>
            ) : "S'inscrire"}
          </button>

          <p className="auth-link-text mt-3">
            Vous avez déjà un compte ? {' '}
            <Link to="/login" className="text-primary fw-bold text-decoration-none">
              Connectez-vous
            </Link>
          </p>
        </form>
      </div>

      <div className="auth-footer">
        <a href="#" className="footer-link">Terms of Use</a>
        <span className="footer-separator">|</span>
        <a href="#" className="footer-link">Privacy Policy</a>
      </div>
    </div>
  );
};

export default Signup;
