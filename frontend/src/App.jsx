// src/App.jsx
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import HealthDashboard from './components/HealthDashboard';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="app-container">
      {!user ? (
        <>
          <LoginForm />
          <div className="preview-section">
            <div className="preview-overlay">
              <h2>Please login to access the Healthcare Portal</h2>
            </div>
          </div>
        </>
      ) : (
        <HealthDashboard />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
