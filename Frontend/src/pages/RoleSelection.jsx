import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RoleSelection = () => {
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { firebaseUser, setUserData } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseUser) {
      setError('No user found. Please login again.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const token = await firebaseUser.getIdToken();

      // Create user profile with selected role
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          email: firebaseUser.email,
          role: role,
          createdAt: new Date().toISOString()
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create user profile');
      }

      const userData = await response.json();
      setUserData(userData);

      // Navigate based on role
      navigate(role === 'authority' ? '/authority-dashboard' : '/user-dashboard');
    } catch (error) {
      console.error('Error creating profile:', error);
      setError(error.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Welcome to BetterHood
          </Typography>
          <Typography variant="body1" align="center" sx={{ mb: 3 }}>
            Please select your role to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <FormControl component="fieldset" sx={{ width: '100%', mb: 3 }}>
              <FormLabel component="legend">I want to join as</FormLabel>
              <RadioGroup
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <FormControlLabel 
                  value="user" 
                  control={<Radio />} 
                  label="User - Report issues in your neighborhood"
                />
                <FormControlLabel 
                  value="authority" 
                  control={<Radio />} 
                  label="Authority - Manage and resolve reported issues"
                />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : "Continue"}
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
};

export default RoleSelection; 