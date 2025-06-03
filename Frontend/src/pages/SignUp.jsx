import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Paper,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

function SignUp() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' // Default role
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [authorityPin, setAuthorityPin] = useState('');

  // Authority PIN for verification (in a real app, this would be securely stored and managed)
  const AUTHORITY_PIN = '123456'; // This is just for demonstration

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
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
    await handleSignUp(true);
  };

  const handleSignUp = async (isAuthority = false) => {
    try {
      setError('');
      setLoading(true);
      
      // Sign up the user
      const user = await signup(formData.email, formData.password, formData.name, formData.role);
      
      // Navigate based on role regardless of authority setup success
      if (formData.role === 'authority') {
        console.log('Navigating to authority dashboard...');
        navigate('/authority-dashboard');
      } else {
        console.log('Navigating to user dashboard...');
        navigate('/user-dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already in use. Please use a different email or log in.');
      } else {
        setError(err.message || 'Failed to create an account');
      }
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
            Sign Up
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
            />

            <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
              <FormLabel component="legend">Sign up as</FormLabel>
              <RadioGroup
                row
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <FormControlLabel value="user" control={<Radio />} label="User" />
                <FormControlLabel value="authority" control={<Radio />} label="Authority" />
              </RadioGroup>
            </FormControl>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              Sign Up
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Typography color="primary">
                  Already have an account? Log In
                </Typography>
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Authority PIN Verification Dialog */}
      <Dialog open={pinDialogOpen} onClose={() => setPinDialogOpen(false)}>
        <DialogTitle>Authority Verification</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="pin"
            label="Enter Authority PIN"
            type="password"
            fullWidth
            variant="outlined"
            value={authorityPin}
            onChange={(e) => setAuthorityPin(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPinDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePinVerification}>Verify</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default SignUp; 