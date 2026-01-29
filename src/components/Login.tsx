import React, { useState } from 'react';
import { useLeagueStore } from '../store/leagueStore';
import '../styles/Auth.css';

interface AuthProps {
  onSuccess: () => void;
}

export const Login: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login, register } = useLeagueStore();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (login(username, password)) {
      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setError('Invalid username or password');
      setPassword('');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !name || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (register(username, email, name, password)) {
      setSuccess('Account created! Logging you in...');
      setTimeout(() => {
        onSuccess();
      }, 500);
    } else {
      setError('Username already exists');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>PSK Golf League</h1>
        <h2>{isLogin ? 'Login' : 'Create Account'}</h2>

        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="toggle-password"
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
              />
            </div>
          )}

          <button type="submit" className="submit-btn">
            {isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setSuccess('');
                setUsername('');
                setPassword('');
                setConfirmPassword('');
                setEmail('');
                setName('');
              }}
              className="toggle-btn"
            >
              {isLogin ? 'Create Account' : 'Login Here'}
            </button>
          </p>
        </div>

        <p className="demo-hint">
          Demo: alex / alex123 or jeb / jeb123
        </p>
      </div>
    </div>
  );
};
