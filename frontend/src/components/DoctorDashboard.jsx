// src/components/DoctorDashboard.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './DoctorDashboard.css';

function DoctorDashboard({ onLogout }) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateStatus, setUpdateStatus] = useState('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
    // Refresh appointments every 30 seconds
    const interval = setInterval(fetchAppointments, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/appointments/');
      setAppointments(response.data.appointments || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch appointments. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateStatus(appointment.status);
    setUpdateNotes(appointment.notes || '');
    setShowUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedAppointment(null);
    setUpdateStatus('');
    setUpdateNotes('');
  };

  const handleUpdateAppointment = async () => {
    if (!selectedAppointment) return;

    try {
      const response = await axios.put(
        `/api/appointments/${selectedAppointment.id}/`,
        {
          status: updateStatus,
          notes: updateNotes,
        }
      );

      // Update local state
      setAppointments(appointments.map(apt =>
        apt.id === selectedAppointment.id ? response.data.appointment : apt
      ));

      handleCloseUpdateModal();
    } catch (err) {
      setError('Failed to update appointment. Please try again.');
      console.error(err);
    }
  };

  const renderPatientStats = (appointment) => {
    if (!appointment.patient_stats || Object.keys(appointment.patient_stats).length === 0) {
      return null;
    }

    return (
      <div className="patient-stats">
        <strong>📊 Patient Stats:</strong>
        <div className="stats-details">
          {appointment.patient_stats.steps && (
            <span>👟 {appointment.patient_stats.steps} steps</span>
          )}
          {appointment.patient_stats.activeTime && (
            <span>⏱️ {appointment.patient_stats.activeTime} mins</span>
          )}
          {appointment.patient_stats.calories && (
            <span>🔥 {appointment.patient_stats.calories} kcal</span>
          )}
          {appointment.patient_stats.distance && (
            <span>📍 {appointment.patient_stats.distance} km</span>
          )}
          {appointment.patient_stats.sleepHours && (
            <span>😴 {appointment.patient_stats.sleepHours}h {appointment.patient_stats.sleepMinutes || 0}m</span>
          )}
        </div>
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeClass = (status) => {
    const baseClass = 'status-badge';
    switch (status) {
      case 'pending':
        return `${baseClass} status-pending`;
      case 'confirmed':
        return `${baseClass} status-confirmed`;
      case 'completed':
        return `${baseClass} status-completed`;
      case 'cancelled':
        return `${baseClass} status-cancelled`;
      default:
        return baseClass;
    }
  };

  const upcomingAppointments = appointments.filter(apt =>
    new Date(apt.appointment_date) > new Date() &&
    ['pending', 'confirmed'].includes(apt.status)
  );

  const pastAppointments = appointments.filter(apt =>
    new Date(apt.appointment_date) <= new Date() ||
    apt.status === 'completed'
  );

  const pendingAppointments = appointments.filter(apt => apt.status === 'pending');
  const confirmedAppointments = appointments.filter(apt => apt.status === 'confirmed');
  const completedAppointments = appointments.filter(apt => apt.status === 'completed');
  const cancelledAppointments = appointments.filter(apt => apt.status === 'cancelled');

  const pendingCount = appointments.filter(apt => apt.status === 'pending').length;
  const confirmedCount = appointments.filter(apt => apt.status === 'confirmed').length;

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h1>HCL HealthLink</h1>
        <div className="nav-links">
          <button className="logout-btn" onClick={onLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading-message">Loading appointments...</div>
        ) : (
          <>
            {/* Pending Requests Section */}
            {pendingAppointments.length > 0 && (
              <section className="appointments-section health-info-section">
                <h2><strong>⏳ Pending Requests</strong></h2>
                <div className="appointments-grid">
                  {pendingAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-card-top">
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <div className="appointment-time">
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </div>

                      <div className="appointment-card-content">
                        <div className="patient-info">
                          <strong>Patient Email:</strong> {appointment.patient_email}
                        </div>
                        {appointment.reason && (
                          <div className="patient-reason">
                            <strong>Reason:</strong> {appointment.reason}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="doctor-notes">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        {renderPatientStats(appointment)}
                      </div>

                      <div className="appointment-card-footer">
                        <button
                          className="action-btn update-btn"
                          onClick={() => handleOpenUpdateModal(appointment)}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Confirmed Appointments Section */}
            {confirmedAppointments.length > 0 && (
              <section className="appointments-section health-info-section">
                <h2><strong>✓ Confirmed Appointments</strong></h2>
                <div className="appointments-grid">
                  {confirmedAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-card-top">
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <div className="appointment-time">
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </div>

                      <div className="appointment-card-content">
                        <div className="patient-info">
                          <strong>Patient Email:</strong> {appointment.patient_email}
                        </div>
                        {appointment.reason && (
                          <div className="patient-reason">
                            <strong>Reason:</strong> {appointment.reason}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="doctor-notes">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        {renderPatientStats(appointment)}
                      </div>

                      <div className="appointment-card-footer">
                        <button
                          className="action-btn update-btn"
                          onClick={() => handleOpenUpdateModal(appointment)}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Appointments Section */}
            {completedAppointments.length > 0 && (
              <section className="appointments-section health-info-section">
                <h2><strong>🎉 Completed Appointments</strong></h2>
                <div className="appointments-grid">
                  {completedAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-card-top">
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <div className="appointment-time">
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </div>

                      <div className="appointment-card-content">
                        <div className="patient-info">
                          <strong>Patient Email:</strong> {appointment.patient_email}
                        </div>
                        {appointment.reason && (
                          <div className="patient-reason">
                            <strong>Reason:</strong> {appointment.reason}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="doctor-notes">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        {renderPatientStats(appointment)}
                      </div>

                      <div className="appointment-card-footer">
                        <button
                          className="action-btn update-btn"
                          onClick={() => handleOpenUpdateModal(appointment)}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cancelled Appointments Section */}
            {cancelledAppointments.length > 0 && (
              <section className="appointments-section health-info-section">
                <h2><strong>✕ Cancelled Appointments</strong></h2>
                <div className="appointments-grid">
                  {cancelledAppointments.map((appointment) => (
                    <div key={appointment.id} className="appointment-card">
                      <div className="appointment-card-top">
                        <span className={getStatusBadgeClass(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                        <div className="appointment-time">
                          {formatDate(appointment.appointment_date)}
                        </div>
                      </div>

                      <div className="appointment-card-content">
                        <div className="patient-info">
                          <strong>Patient Email:</strong> {appointment.patient_email}
                        </div>
                        {appointment.reason && (
                          <div className="patient-reason">
                            <strong>Reason:</strong> {appointment.reason}
                          </div>
                        )}
                        {appointment.notes && (
                          <div className="doctor-notes">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        {renderPatientStats(appointment)}
                      </div>

                      <div className="appointment-card-footer">
                        <button
                          className="action-btn update-btn"
                          onClick={() => handleOpenUpdateModal(appointment)}
                        >
                          Update Status
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {appointments.length === 0 && (
              <div className="no-appointments">
                <p>No appointments booked yet.</p>
              </div>
            )}
          </>
        )}

        {showUpdateModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Appointment</h3>
              <button className="close-btn" onClick={handleCloseUpdateModal}>×</button>
            </div>

            <div className="modal-body">
              <div className="appointment-detail">
                <strong>Patient:</strong> {selectedAppointment.patient_email}
              </div>
              <div className="appointment-detail">
                <strong>Date & Time:</strong> {formatDate(selectedAppointment.appointment_date)}
              </div>
              {selectedAppointment.reason && (
                <div className="appointment-detail">
                  <strong>Reason:</strong> {selectedAppointment.reason}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  value={updateStatus}
                  onChange={(e) => setUpdateStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes for Patient</label>
                <textarea
                  id="notes"
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  placeholder="Add any notes or instructions for the patient..."
                  rows="4"
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={handleCloseUpdateModal}>
                Cancel
              </button>
              <button className="save-btn" onClick={handleUpdateAppointment}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}

export default DoctorDashboard;
