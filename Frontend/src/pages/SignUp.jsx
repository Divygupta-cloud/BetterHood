import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../App.css';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [authorityPin, setAuthorityPin] = useState('');
  const [step, setStep] = useState(1);

  const navigate = useNavigate();
  const { signup } = useAuth();
  const AUTHORITY_PIN = '123456';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const validateStep1 = () => formData.name && formData.email;

  const validateStep2 = () =>
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;

  const handleNextStep = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else {
      setError('Please fill all required fields correctly before proceeding.');
    }
  };

  const isFormValid =
    step === 3 &&
    formData.name &&
    formData.email &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.role;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (step !== 3 || !isFormValid) {
      setError('Please complete all fields including selecting a role.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!formData.role) {
      setError('Please select a user role');
      return;
    }

    if (formData.role === 'authority') {
      setPinDialogOpen(true);
      return;
    }

    await handleSignUp();
  };

  const handlePinVerification = async () => {
    if (authorityPin !== AUTHORITY_PIN) {
      setError('Invalid authority PIN');
      return;
    }
    setPinDialogOpen(false);
    setAuthorityPin('');
    await handleSignUp(true);
  };

  const handleSignUp = async () => {
    try {
      setError('');
      setLoading(true);
      const result = await signup(
        formData.email,
        formData.password,
        formData.name,
        formData.role
      );

      const userRole = result?.role || formData.role;

      if (userRole === 'authority') {
        navigate('/authority-dashboard');
      } else {
        navigate('/user-dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100vh',
        width: '100vw',
        margin: 0,
        padding: 0,
        background: `
          radial-gradient(ellipse at top left, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
          radial-gradient(ellipse at bottom right, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
          linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f0f23 100%)
        `,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'auto',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        boxSizing: 'border-box'
      }}
    >
      <div className="signup-bg-animated" />
      <div
        className="signup-container"
        style={{
          width: '100%',
          maxWidth: '480px',
          position: 'relative',
          zIndex: 10,
          padding: '16px'
        }}
      >
        <div
          className="signup-form"
          style={{
            padding: '40px',
            borderRadius: '16px',
            background: `
              linear-gradient(145deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%
              )
            `,
            backdropFilter: 'blur(40px) saturate(200%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: `
              0 25px 50px -12px rgba(0, 0, 0, 0.8),
              0 0 0 1px rgba(255, 255, 255, 0.05),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            color: '#fff',
            position: 'relative',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '1px',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)'
            }}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '32px',
              gap: '12px'
            }}
          >
            {[1, 2, 3].map((stepNum) => (
              <div
                key={stepNum}
                className={`step-indicator ${
                  stepNum === step
                    ? 'active'
                    : stepNum < step
                    ? 'completed'
                    : ''
                }`}
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background:
                    stepNum <= step
                      ? stepNum === step
                        ? 'linear-gradient(135deg, #8b5cf6, #ec4899)'
                        : 'rgba(34, 197, 94, 0.8)'
                      : 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)'
                }}
              />
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '2.5rem',
                fontWeight: 700,
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                marginBottom: '8px',
                letterSpacing: '-0.025em',
                margin: '0 0 8px 0'
              }}
            >
              {step === 1
                ? 'Join Us'
                : step === 2
                ? 'Secure Your Account'
                : 'Choose Your Role'}
            </h1>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                fontSize: '1.1rem',
                fontWeight: 400,
                margin: 0
              }}
            >
              {step === 1
                ? 'Create your account to get started'
                : step === 2
                ? 'Set up a strong password'
                : 'Select how you want to use our platform'}
            </p>
          </div>

          {error && (
            <div
              className="error-alert"
              style={{
                marginBottom: '24px',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'rgba(244, 67, 54, 0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
                color: '#ffcdd2',
                fontSize: '0.95rem'
              }}
            >
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="step-content">
              {step === 1 && (
                <>
                  <div style={{ marginBottom: '24px' }}>
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          focusedField === 'name'
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(255,255,255,0.1)'
                        }`,
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: '32px' }}>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          focusedField === 'email'
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(255,255,255,0.1)'
                        }`,
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <div style={{ marginBottom: '24px', position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '16px 50px 16px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          focusedField === 'password'
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(255,255,255,0.1)'
                        }`,
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(!showPassword)}
                      className={`password-toggle-btn${
                        showPassword ? ' active' : ''
                      }`}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div style={{ marginBottom: '32px', position: 'relative' }}>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => setFocusedField('confirmPassword')}
                      onBlur={() => setFocusedField(null)}
                      required
                      className="input-field"
                      style={{
                        width: '100%',
                        padding: '16px 50px 16px 20px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.05)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${
                          focusedField === 'confirmPassword'
                            ? 'rgba(139, 92, 246, 0.5)'
                            : 'rgba(255,255,255,0.1)'
                        }`,
                        color: '#fff',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide confirm password'
                          : 'Show confirm password'
                      }
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className={`password-toggle-btn${
                        showConfirmPassword ? ' active' : ''
                      }`}
                    >
                      {showConfirmPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </>
              )}

              {step === 3 && (
                <div style={{ marginBottom: '32px' }}>
                  <p
                    style={{
                      color: 'rgba(255,255,255,0.8)',
                      marginBottom: '16px',
                      fontSize: '1rem',
                      fontWeight: 500
                    }}
                  >
                    How do you want to use our platform?
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                      {
                        value: 'user',
                        label: 'User',
                        desc: 'Access services and features',
                        icon: '👤'
                      },
                      {
                        value: 'authority',
                        label: 'Authority',
                        desc: 'Manage and oversee operations',
                        icon: '🛡️'
                      }
                    ].map((role) => (
                      <div
                        key={role.value}
                        className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                        onClick={() =>
                          handleChange({ target: { name: 'role', value: role.value } })
                        }
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background:
                            formData.role === role.value
                              ? 'rgba(139, 92, 246, 0.2)'
                              : 'rgba(255,255,255,0.05)',
                          border: `1px solid ${
                            formData.role === role.value
                              ? 'rgba(139, 92, 246, 0.5)'
                              : 'rgba(255,255,255,0.1)'
                          }`,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        <span style={{ fontSize: '24px' }}>{role.icon}</span>
                        <div>
                          <p
                            style={{
                              color: '#fff',
                              fontWeight: 600,
                              margin: '0 0 4px 0',
                              fontSize: '1.1rem'
                            }}
                          >
                            {role.label}
                          </p>
                          <p
                            style={{
                              color: 'rgba(255,255,255,0.7)',
                              margin: 0,
                              fontSize: '0.9rem'
                            }}
                          >
                            {role.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(step - 1);
                    setError('');
                  }}
                  className="back-btn"
                  style={{
                    flex: 1,
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    fontFamily: 'inherit'
                  }}
                >
                  ← Back
                </button>
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    (step === 1 && !validateStep1()) || (step === 2 && !validateStep2())
                  }
                  className="submit-btn"
                  style={{
                    flex: step === 1 ? 1 : 2,
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background:
                      (step === 1 && validateStep1()) || (step === 2 && validateStep2())
                        ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                        : 'rgba(255,255,255,0.1)',
                    color:
                      (step === 1 && validateStep1()) || (step === 2 && validateStep2())
                        ? '#fff'
                        : 'rgba(255,255,255,0.5)',
                    cursor:
                      (step === 1 && validateStep1()) || (step === 2 && validateStep2())
                        ? 'pointer'
                        : 'not-allowed',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !isFormValid}
                  className="submit-btn"
                  style={{
                    flex: 2,
                    padding: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: isFormValid
                      ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)'
                      : 'rgba(255,255,255,0.1)',
                    color: isFormValid ? '#fff' : 'rgba(255,255,255,0.5)',
                    cursor: isFormValid && !loading ? 'pointer' : 'not-allowed',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  {loading ? (
                    <div
                      className="spinner"
                      style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTop: '2px solid rgba(255,255,255,0.7)',
                        borderRadius: '50%'
                      }}
                    />
                  ) : (
                    <>
                      Create Account <span style={{ fontSize: '16px' }}>✨</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  marginBottom: '16px',
                  fontSize: '0.95rem'
                }}
              >
                Already have an account?
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="signin-link-btn"
              >
                Sign In Instead
              </button>
            </div>
          </form>
        </div>
      </div>

      {pinDialogOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(10px)'
          }}
        >
          <div
            style={{
              background: `
              linear-gradient(145deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                rgba(255, 255, 255, 0.05) 100%
              )
            `,
              backdropFilter: 'blur(40px)',
              borderRadius: '16px',
              padding: '32px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
              color: '#fff',
              maxWidth: '400px',
              width: '90%'
            }}
          >
            <h3
              style={{
                margin: '0 0 16px 0',
                fontSize: '1.5rem',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              🛡️ Authority Verification
            </h3>
            <p
              style={{
                color: 'rgba(255,255,255,0.7)',
                marginBottom: '24px',
                textAlign: 'center',
                fontSize: '0.95rem'
              }}
            >
              Enter the authority PIN to verify your credentials
            </p>
            <input
              type="password"
              placeholder="Enter PIN"
              value={authorityPin}
              onChange={(e) => setAuthorityPin(e.target.value)}
              className="pin-input"
              style={{
                width: '100%',
                padding: '16px 20px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
                marginBottom: '24px',
                textAlign: 'center',
                letterSpacing: '2px'
              }}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setPinDialogOpen(false);
                  setAuthorityPin('');
                  setError('');
                }}
                className="cancel-btn"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.8)',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
              <button
                onClick={handlePinVerification}
                className="verify-btn"
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: '1px solid rgba(139, 92, 246, 0.3)',
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  fontSize: '1rem',
                  fontWeight: 600
                }}
              >
                Verify
              </button>
            </div>
            <div
              style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                textAlign: 'center'
              }}
            >
              <p
                style={{
                  color: 'rgba(147, 197, 253, 0.9)',
                  fontSize: '0.8rem',
                  margin: 0,
                  fontFamily: 'Monaco, Consolas, monospace'
                }}
              >
                💡 Demo PIN: 123456
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SignUp;
