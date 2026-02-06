import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LoginPage.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        navigate('/user');
      } else {
        setError('Invalid email or password');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
      </div>

      <div className="login-container animate-slide-up">
        <div className="login-card glass-card">
          <div className="login-header">
            <div className="login-logo">
              <div className="logo-icon">
                <img src="/favicon.png" alt="Teleaon Bot" width={48} height={48} />
              </div>
            </div>
            <h1 className="login-title">
              Welcome to <span className="text-gradient">Teleaon Bot</span>
            </h1>
            <p className="login-subtitle">
              Your intelligent AI assistant
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  type="email"
                  className="input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  className="input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary btn-lg w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner-icon" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <p className="login-hint">
              Sign in with your credentials to continue
            </p>
          </div>
        </div>

        <div className="login-features">
          <div className="feature-item">
            <span className="feature-icon">🪶</span>
            <span>Ultra-Lightweight</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⚡️</span>
            <span>Lightning Fast</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🔬</span>
            <span>Research-Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}
