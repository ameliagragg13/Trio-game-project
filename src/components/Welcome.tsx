import { useNavigate } from 'react-router-dom';
import '../styles/welcome.css';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <h1 className="welcome-title">TRIO GAMES</h1>
        <p className="welcome-subtitle">Retro Gaming Experience</p>
        <div className="welcome-buttons">
          <button 
            className="pixel-button pixel-button-primary" 
            onClick={() => navigate('/login')}
          >
            LOG IN
          </button>
          <button 
            className="pixel-button pixel-button-secondary" 
            onClick={() => navigate('/signup')}
          >
            SIGN UP
          </button>
        </div>
      </div>
    </div>
  );
}

