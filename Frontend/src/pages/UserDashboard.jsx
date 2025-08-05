import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserDashboard = () => {
  const { currentUser, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userDataState, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        setError('No user found');
        setLoading(false);
        return;
      }

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch(`${API_URL}/users/${currentUser.uid}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            const createResponse = await fetch(`${API_URL}/users`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                uid: currentUser.uid,
                email: currentUser.email,
                name: currentUser.displayName || currentUser.email.split('@')[0],
                role: 'user',
                createdAt: new Date().toISOString()
              }),
              credentials: 'include'
            });

            if (!createResponse.ok) throw new Error('Failed to create user profile');
            const userData = await createResponse.json();
            setUserData(userData);
          } else {
            const errorText = await response.text();
            throw new Error('Failed to fetch user data: ' + errorText);
          }
        } else {
          const userData = await response.json();
          setUserData(userData);
        }
      } catch (error) {
        console.error(error);
        setError('Failed to load user data. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      setError('Failed to sign out.');
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(145deg, #0f0f0f, #1c1c1c)',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const ErrorDisplay = () => (
    <Alert
      severity="error"
      sx={{ mt: 4 }}
      action={
        <Button color="inherit" size="small" onClick={() => window.location.reload()}>
          Refresh Page
        </Button>
      }
    >
      {error}
    </Alert>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #121212, #1e1e1e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 600 }}>
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#fff',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
          }}
        >
          {error ? (
            <ErrorDisplay />
          ) : (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Typography variant="h4" fontWeight="bold">
                  Welcome, {userDataState?.name || currentUser?.displayName || 'User'}!
                </Typography>
                <Button
                  onClick={handleSignOut}
                  variant="outlined"
                  sx={{
                    borderColor: '#888',
                    color: '#ccc',
                    '&:hover': {
                      borderColor: '#fff',
                      color: '#fff',
                    },
                  }}
                >
                  Sign Out
                </Button>
              </Box>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Email:</strong> {userDataState?.email || currentUser?.email}
              </Typography>
              <Typography variant="body1" sx={{ mb: 4 }}>
                <strong>Role:</strong> {userDataState?.role || 'User'}
              </Typography>

              <Typography variant="h6" sx={{ mb: 2 }}>
                Quick Actions
              </Typography>
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #00c6ff, #0072ff)',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(to right, #0072ff, #00c6ff)',
                    },
                  }}
                  onClick={() => navigate('/create-report')}
                >
                  Create Report
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    background: 'linear-gradient(to right, #ff416c, #ff4b2b)',
                    color: '#fff',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    px: 3,
                    '&:hover': {
                      background: 'linear-gradient(to right, #ff4b2b, #ff416c)',
                    },
                  }}
                  onClick={() => navigate('/my-reports')}
                >
                  My Reports
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default UserDashboard;
