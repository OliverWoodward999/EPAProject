import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Registration modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalFadeOut, setModalFadeOut] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');

  const API = 'http://localhost:5001';

  // Login handlers
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch(`${API}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        localStorage.setItem('username', username);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/home');
      } else {
        const { error: msg } = await res.json();
        setError(msg || 'Login failed');
      }
    } catch {
      setError('An error occurred. Please try again.');
    }
  };

  // Open register modal
  const openRegisterModal = () => {
    setRegUsername('');
    setRegPassword('');
    setRegError('');
    setRegSuccess('');
    setModalFadeOut(false);
    setIsRegisterModalOpen(true);
  };

  // Close register modal with fade-out
  const closeRegisterModal = () => {
    setModalFadeOut(true);
    setTimeout(() => {
      setIsRegisterModalOpen(false);
      setModalFadeOut(false);
    }, 500); // match your CSS animation duration
  };

  // Registration handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    try {
      const res = await fetch(`${API}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });
      if (res.ok) {
        setRegSuccess('User registered successfully!');
        setRegUsername('');
        setRegPassword('');
      } else {
        const { error: msg } = await res.json();
        setRegError(msg || 'Registration failed');
      }
    } catch {
      setRegError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="login-page">
      <h2 className='h2Text'>Downtime Portals</h2>
      <h2 className='h2Text'>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Login</button>
      </form>

      <p>—or—</p>
      <button className="register-button" onClick={openRegisterModal}>
        Register New User
      </button>

      {isRegisterModalOpen && (
        <div
          className={`modal-overlay ${modalFadeOut ? 'fade-out' : ''}`}
          onClick={closeRegisterModal}
        >
          <div
            className={`modal-content ${modalFadeOut ? 'fade-out' : ''}`}
            onClick={e => e.stopPropagation()}
          >
            <h3>Register</h3>
            {regError && <p className="error">{regError}</p>}
            {regSuccess && <p className="success">{regSuccess}</p>}
            <form onSubmit={handleRegister}>
              <div>
                <label>Username:</label>
                <input
                  type="text"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  required
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Create Account</button>
            </form>
            <button className="modal-close-btn" onClick={closeRegisterModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
