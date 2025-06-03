import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Button,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const UserDashboard = () => {
  const { currentUser, userData, logout } = useAuth();
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
        console.log('Fetching user data for:', currentUser.uid);
        const token = await currentUser.getIdToken();
        
        // First try to get the user
        const response = await fetch(`${API_URL}/users/${currentUser.uid}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 404) {
            // If user doesn't exist, create them
            console.log('User not found, creating new user');
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

            if (!createResponse.ok) {
              throw new Error('Failed to create user profile');
            }
            
            const userData = await createResponse.json();
            setUserData(userData);
          } else {
            const errorText = await response.text();
            console.error('Failed to fetch user data:', errorText);
            throw new Error('Failed to fetch user data');
          }
        } else {
          const userData = await response.json();
          setUserData(userData);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
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
      console.error('Error signing out:', error);
      setError('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </Container>
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
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          {error ? <ErrorDisplay /> : (
            <>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" gutterBottom>
                  Welcome, {userDataState?.name || currentUser?.displayName || 'User'}!
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </Box>
              
              <Typography variant="body1" paragraph>
                Email: {userDataState?.email || currentUser?.email}
              </Typography>
              
              <Typography variant="body1" paragraph>
                Role: {userDataState?.role || 'User'}
              </Typography>

              <Box mt={4}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mr: 2 }}
                  onClick={() => navigate('/create-report')}
                >
                  Create Report
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate('/my-reports')}
                >
                  My Reports
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default UserDashboard; 