// src/pages/AuthorityDashboard.jsx
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Button,
  CircularProgress,
  Card,
  CardContent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const AuthorityDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (auth.currentUser) {
          const idToken = await auth.currentUser.getIdToken();
          const headers = {
            'Authorization': `Bearer ${idToken}`
          };

          // Fetch user data
          const userResponse = await axios.get(
            `${API_URL}/users/${auth.currentUser.uid}`,
            { headers }
          );

          if (userResponse.data.role !== 'authority') {
            navigate('/login');
            return;
          }

          setUserData(userResponse.data);

          // Fetch reports for the authority's jurisdiction
          const reportsResponse = await axios.get(
            `${API_URL}/reports`,
            { headers }
          );
          setReports(reportsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
        if (error.response?.status === 401 || error.response?.status === 403) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container>
        <Typography>No user data found. Please log in again.</Typography>
        <Button variant="contained" onClick={() => navigate('/login')}>
          Go to Login
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Authority Dashboard - Welcome, {userData.name}!
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Profile Information
              </Typography>
              <Typography>Name: {userData.name}</Typography>
              <Typography>Email: {userData.email}</Typography>
              <Typography>Role: Authority</Typography>
              <Typography>Member Since: {new Date(userData.createdAt).toLocaleDateString()}</Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{ mr: 2 }}
                onClick={() => navigate('/reports-management')}
              >
                Manage Reports
              </Button>
              <Button
                variant="contained"
                color="secondary"
                sx={{ mr: 2 }}
                onClick={() => navigate('/analytics')}
              >
                View Analytics
              </Button>
              <Button
                variant="outlined"
                color="error"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
              Recent Reports
            </Typography>
            <Grid container spacing={2}>
              {reports.slice(0, 4).map((report) => (
                <Grid item xs={12} md={6} key={report._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{report.title}</Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Reported on: {new Date(report.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" noWrap>
                        {report.description}
                      </Typography>
                      <Button
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/report/${report._id}`)}
                        sx={{ mt: 1 }}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AuthorityDashboard;
