// src/components/ProfileStats.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './ProfileStats.css';

function ProfileStats({ onNavigateToHome, onNavigateToBooking, onNavigateToMyAppointments, onLogout }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    steps: '',
    activeTime: '',
    calories: '',
    distance: '',
    sleepHours: '',
    sleepMinutes: '',
    sleepStartTime: '',
    sleepEndTime: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStats(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    if (!stats.steps || !stats.activeTime || !stats.calories || !stats.distance) {
      setError('Please fill in all activity fields');
      return;
    }

    if (!stats.sleepHours || !stats.sleepMinutes) {
      setError('Please fill in sleep duration');
      return;
    }

    if (!stats.sleepStartTime || !stats.sleepEndTime) {
      setError('Please fill in sleep time range');
      return;
    }

    setSuccess('Physical stats updated successfully!');
    setError('');
    
    // Reset form after success
    setTimeout(() => {
      setStats({
        steps: '',
        activeTime: '',
        calories: '',
        distance: '',
        sleepHours: '',
        sleepMinutes: '',
        sleepStartTime: '',
        sleepEndTime: ''
      });
      setSuccess('');
    }, 2000);
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>HCL HealthLink</h1>
        <div className="nav-links">
          <button onClick={onNavigateToHome}>Home</button>
          <button onClick={onNavigateToBooking}>
            Book Appointment
          </button>
          <button onClick={onNavigateToMyAppointments}>
            My Appointments
          </button>
          <button className="active">
            Profile
          </button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="health-info-section">
          <h2><strong>Daily Physical Stats</strong></h2>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit} className="stats-form">
            {/* Activity Stats Section */}
            <div className="stats-group">
              <h3>Activity Stats</h3>
              
              <div className="form-group">
                <label htmlFor="steps">Steps</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="steps"
                    name="steps"
                    value={stats.steps}
                    onChange={handleInputChange}
                    placeholder="Enter steps"
                    min="0"
                  />
                  <span className="unit">steps</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="activeTime">Active Time</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="activeTime"
                    name="activeTime"
                    value={stats.activeTime}
                    onChange={handleInputChange}
                    placeholder="Enter minutes"
                    min="0"
                  />
                  <span className="unit">mins</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="calories">Calories Burned</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="calories"
                    name="calories"
                    value={stats.calories}
                    onChange={handleInputChange}
                    placeholder="Enter calories"
                    min="0"
                  />
                  <span className="unit">kcal</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="distance">Distance Traveled</label>
                <div className="input-with-unit">
                  <input
                    type="number"
                    id="distance"
                    name="distance"
                    value={stats.distance}
                    onChange={handleInputChange}
                    placeholder="Enter distance"
                    min="0"
                    step="0.01"
                  />
                  <span className="unit">km</span>
                </div>
              </div>
            </div>

            {/* Sleep Stats Section */}
            <div className="stats-group">
              <h3>Sleep Stats</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sleepHours">Sleep Duration - Hours</label>
                  <input
                    type="number"
                    id="sleepHours"
                    name="sleepHours"
                    value={stats.sleepHours}
                    onChange={handleInputChange}
                    placeholder="Hours"
                    min="0"
                    max="24"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sleepMinutes">Minutes</label>
                  <input
                    type="number"
                    id="sleepMinutes"
                    name="sleepMinutes"
                    value={stats.sleepMinutes}
                    onChange={handleInputChange}
                    placeholder="Minutes"
                    min="0"
                    max="59"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="sleepStartTime">Sleep Time - From</label>
                  <input
                    type="time"
                    id="sleepStartTime"
                    name="sleepStartTime"
                    value={stats.sleepStartTime}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="sleepEndTime">To</label>
                  <input
                    type="time"
                    id="sleepEndTime"
                    name="sleepEndTime"
                    value={stats.sleepEndTime}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className="submit-btn">Save Physical Stats</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfileStats;
