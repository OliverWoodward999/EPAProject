import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DowntimeLog from './DowntimeLog.jsx';

function HomePage() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [modalFadeOut, setModalFadeOut] = useState(false);
  const navigate = useNavigate();

  const username = localStorage.getItem('username') || 'Guest';

  const handleLogout = () => {
    localStorage.removeItem('username');
    navigate('/login');
  };

  const openProfileModal = () => {
    setIsProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setModalFadeOut(true);
    setTimeout(() => {
      setIsProfileModalOpen(false);
      setModalFadeOut(false);
    }, 500);
  };

  return (
    <div className="home-page">
      <header>
        <h1>Downtime Portal Teest</h1>
        <nav>
          <Link to="/home" className="nav-button">Home</Link>
          <button onClick={openProfileModal} className="nav-button">Profile</button>
          <button onClick={handleLogout} className="nav-button">Logout</button>
        </nav>
      </header>
      <main className="fade-in">
        <h2>Welcome, {username}!</h2>
        <p>This is your personal downtime portal</p>
        {/* Downtime log is embedded in the homepage */}
        <section className="downtime-section">
          <DowntimeLog />
        </section>
      </main>
      <footer>
        <p>&copy; 2025 Oliver Woodward's Downtime Portal...</p>
      </footer>

      {isProfileModalOpen && (
        <div
          className={`modal-overlay ${modalFadeOut ? 'fade-out' : ''}`}
          onClick={closeProfileModal}
        >
          <div
            className={`modal-content ${modalFadeOut ? 'fade-out' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>User Profile</h3>
            <p>Username: {username}</p>
            <button onClick={closeProfileModal} className="modal-close-btn">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;