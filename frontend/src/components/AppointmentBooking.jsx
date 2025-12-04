// src/components/AppointmentBooking.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './AppointmentBooking.css';

function AppointmentBooking({ onBackToDashboard, onNavigateToHome, onNavigateToMyAppointments, onLogout }) {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [doctorDetails, setDoctorDetails] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [patientStats, setPatientStats] = useState({
    steps: '',
    activeTime: '',
    calories: '',
    distance: '',
    sleepHours: '',
    sleepMinutes: '',
    sleepStartTime: '',
    sleepEndTime: ''
  });

  // Fetch all doctors on component mount
  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/providers/');
      setDoctors(response.data.providers || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch doctors. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = async (doctorId) => {
    setSelectedDoctor(doctorId);
    setDoctorDetails(null);
    
    // Fetch doctor details and their appointments
    try {
      const response = await axios.get(`/api/appointments/doctor/${doctorId}/`);
      setDoctorDetails(response.data.doctor);
    } catch (err) {
      console.error('Failed to fetch doctor details:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedDoctor || !appointmentDate || !appointmentTime) {
      setError('Please fill in all required fields');
      return;
    }

    // Show stats modal before submitting
    setShowStatsModal(true);
  };

  const handleStatsInputChange = (e) => {
    const { name, value } = e.target;
    setPatientStats(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitWithStats = async () => {
    // Validate stats
    if (!patientStats.steps || !patientStats.activeTime || !patientStats.calories || !patientStats.distance) {
      setError('Please fill in all activity stats');
      return;
    }

    if (!patientStats.sleepHours || !patientStats.sleepMinutes) {
      setError('Please fill in sleep duration');
      return;
    }

    if (!patientStats.sleepStartTime || !patientStats.sleepEndTime) {
      setError('Please fill in sleep time range');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Combine date and time
      const dateTime = `${appointmentDate}T${appointmentTime}:00Z`;
      
      const response = await axios.post('/api/appointments/create/', {
        provider_id: selectedDoctor,
        appointment_date: dateTime,
        reason: reason || '',
        patient_stats: patientStats,
      });

      setSuccess('Appointment booked successfully! The doctor will confirm your appointment shortly.');
      
      // Reset form
      setSelectedDoctor('');
      setAppointmentDate('');
      setAppointmentTime('');
      setReason('');
      setPatientStats({
        steps: '',
        activeTime: '',
        calories: '',
        distance: '',
        sleepHours: '',
        sleepMinutes: '',
        sleepStartTime: '',
        sleepEndTime: ''
      });
      setShowStatsModal(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to book appointment. Please try again.';
      setError(errorMsg);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>HCL HealthLink</h1>
        <div className="nav-links">
          <button onClick={onNavigateToHome}>Home</button>
          <button className="active" onClick={onBackToDashboard}>
            Book Appointment
          </button>
          <button onClick={onNavigateToMyAppointments}>
            My Appointments
          </button>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="health-info-section">
          <h2><strong>Book an Appointment</strong></h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="booking-form">
        <div className="form-group">
          <label htmlFor="doctor">Select Doctor *</label>
          <select
            id="doctor"
            value={selectedDoctor}
            onChange={(e) => handleDoctorSelect(e.target.value)}
            disabled={loading}
            required
          >
            <option value="">Choose a doctor...</option>
            {doctors.map((doctor) => (
              <option key={doctor.user_id} value={doctor.user_id}>
                {doctor.specialty} | {doctor.doctor_name} | {doctor.clinic_address || 'Location not specified'}
              </option>
            ))}
          </select>
        </div>

        {doctorDetails && (
          <div className="doctor-details-card">
            <h3>Doctor Information</h3>
            <p><strong>Specialty:</strong> {doctorDetails.specialty}</p>
            <p><strong>Location:</strong> {doctorDetails.clinic_address}</p>
            <p><strong>Available Hours:</strong></p>
            <ul>
              {Object.entries(doctorDetails.available_hours || {}).map(([day, hours]) => (
                <li key={day}>{day}: {hours}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="date">Appointment Date *</label>
          <input
            type="date"
            id="date"
            value={appointmentDate}
            onChange={(e) => setAppointmentDate(e.target.value)}
            min={today}
            disabled={loading || !selectedDoctor}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="time">Appointment Time *</label>
          <input
            type="time"
            id="time"
            value={appointmentTime}
            onChange={(e) => setAppointmentTime(e.target.value)}
            disabled={loading || !selectedDoctor}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="reason">Reason for Visit</label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe your reason for visit (optional)"
            rows="4"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !selectedDoctor}
          className="submit-btn"
        >
          {loading ? 'Booking...' : 'Book Appointment'}
        </button>
      </form>
        </div>

        {showStatsModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Your Physical Stats</h3>
                <p>Please enter your current physical stats before completing your booking</p>
              </div>

              <div className="modal-body">
                {error && <div className="error-message">{error}</div>}

                {/* Activity Stats Section */}
                <div className="stats-group">
                  <h4>Activity Stats</h4>
                  
                  <div className="form-group">
                    <label htmlFor="steps">Steps</label>
                    <div className="input-with-unit">
                      <input
                        type="number"
                        id="steps"
                        name="steps"
                        value={patientStats.steps}
                        onChange={handleStatsInputChange}
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
                        value={patientStats.activeTime}
                        onChange={handleStatsInputChange}
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
                        value={patientStats.calories}
                        onChange={handleStatsInputChange}
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
                        value={patientStats.distance}
                        onChange={handleStatsInputChange}
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
                  <h4>Sleep Stats</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="sleepHours">Sleep Duration - Hours</label>
                      <input
                        type="number"
                        id="sleepHours"
                        name="sleepHours"
                        value={patientStats.sleepHours}
                        onChange={handleStatsInputChange}
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
                        value={patientStats.sleepMinutes}
                        onChange={handleStatsInputChange}
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
                        value={patientStats.sleepStartTime}
                        onChange={handleStatsInputChange}
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="sleepEndTime">To</label>
                      <input
                        type="time"
                        id="sleepEndTime"
                        name="sleepEndTime"
                        value={patientStats.sleepEndTime}
                        onChange={handleStatsInputChange}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button className="cancel-btn" onClick={() => setShowStatsModal(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSubmitWithStats} disabled={loading}>
                  {loading ? 'Booking...' : 'Complete Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AppointmentBooking;
