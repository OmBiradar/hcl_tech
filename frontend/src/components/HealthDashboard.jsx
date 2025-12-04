// src/components/HealthDashboard.jsx
import { useAuth } from '../context/AuthContext';
import InfoCard from './InfoCard';

const HealthDashboard = () => {
  const { user, logout } = useAuth();

  const healthInfo = [
    {
      title: 'COVID-19 Updates',
      description: 'Stay informed about the latest COVID-19 guidelines and vaccination information.'
    },
    {
      title: 'Seasonal Flu Prevention',
      description: 'Learn about steps you can take to prevent the seasonal flu and when to get vaccinated.'
    },
    {
      title: 'Mental Health Awareness',
      description: 'Explore resources and support options for maintaining good mental health.'
    }
  ];

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>Healthcare Portal</h1>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#topics">Health Topics</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </nav>
      
      <div className="dashboard-content">
        <h2>Latest Health Information</h2>
        
        <div className="cards-container">
          {healthInfo.map((info, index) => (
            <InfoCard key={index} {...info} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthDashboard;
