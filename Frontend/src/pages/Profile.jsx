import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Badge
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import DeleteIcon from '@mui/icons-material/Delete';

const API_URL = 'http://localhost:5000/api';

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userData, setUserData] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const idToken = await user.getIdToken(true);
        const response = await axios.get(
          `${API_URL}/users/profile`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Accept': 'application/json'
            }
          }
        );

        setUserData(response.data);
        setFormData({
          name: response.data.name || '',
          email: user.email || ''
        });
        if (response.data.profilePhotoUrl) {
          setPhotoPreview(`${API_URL}/reports/image/${response.data.profilePhotoUrl}`);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load profile'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const idToken = await auth.currentUser.getIdToken(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (profilePhoto) {
        formDataToSend.append('profilePhoto', profilePhoto);
      }

      await axios.patch(
        `${API_URL}/users/profile`,
        formDataToSend,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError(
        error.response?.data?.message || 
        error.message || 
        'Failed to update profile'
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ position: 'relative', mr: 3 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                <label htmlFor="profile-photo-input">
                  <input
                    accept="image/*"
                    id="profile-photo-input"
                    type="file"
                    style={{ display: 'none' }}
                    onChange={handlePhotoChange}
                  />
                  <IconButton
                    color="primary"
                    aria-label="upload picture"
                    component="span"
                    sx={{
                      bgcolor: 'background.paper',
                      '&:hover': { bgcolor: 'background.paper' }
                    }}
                  >
                    <PhotoCamera />
                  </IconButton>
                </label>
              }
            >
              <Avatar
                src={photoPreview || userData?.profilePhotoUrl && `${API_URL}/reports/image/${userData.profilePhotoUrl}`}
                sx={{ width: 100, height: 100 }}
              />
            </Badge>
            {photoPreview && (
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'background.paper' }
                }}
                onClick={handleRemovePhoto}
              >
                <DeleteIcon />
              </IconButton>
            )}
          </Box>
          <Typography variant="h4" component="h1">
            My Profile
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            margin="normal"
            variant="outlined"
            disabled
            helperText="Email cannot be changed"
          />

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save Changes
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Profile; 