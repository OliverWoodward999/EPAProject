import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from './api';

function LoginPage() {
  // Login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  // Registration modal states
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [modalFadeOut, setModalFadeOut] = useState(false);
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regBusy, setRegBusy] = useState(false);

  // Login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const body = {
        username: username.trim(),
        password: password,
      };

      const res = await fetch(apiUrl('/api/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        localStorage.setItem('username', body.username);
        localStorage.setItem('isAuthenticated', 'true');
        navigate('/home');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Login failed (${res.status})`);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  // Open/close register modal
  const openRegisterModal = () => {
    setRegUsername('');
    setRegPassword('');
    setRegError('');
    setRegSuccess('');
    setModalFadeOut(false);
    setIsRegisterModalOpen(true);
  };
  const closeRegisterModal = () => {
    setModalFadeOut(true);
    setTimeout(() => {
      setIsRegisterModalOpen(false);
      setModalFadeOut(false);
    }, 500);
  };

  // Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');
    setRegBusy(true);
    try {
      const body = {
        username: regUsername.trim(),
        password: regPassword,
      };

      const res = await fetch(apiUrl('/api/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setRegSuccess('User registered successfully!');
        setRegUsername('');
        setRegPassword('');
      } else {
        const data = await res.json().catch(() => ({}));
        setRegError(data.error || `Registration failed (${res.status})`);
      }
    } catch {
      setRegError('Network error. Please try again.');
    } finally {
      setRegBusy(false);
    }
  };

  return (
    <div className="login-page">
      <h2 className='h2Text'>Downtime Portal</h2>
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
            autoComplete="username"
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
            autoComplete="current-password"
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={busy}>
          {busy ? 'Logging in…' : 'Login'}
        </button>
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
                  autoComplete="username"
                />
              </div>
              <div>
                <label>Password:</label>
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <button type="submit" disabled={regBusy}>
                {regBusy ? 'Creating…' : 'Create Account'}
              </button>
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
