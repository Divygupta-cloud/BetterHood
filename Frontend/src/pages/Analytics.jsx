import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const idToken = await auth.currentUser.getIdToken();
        const response = await axios.get(
          `${API_URL}/reports/stats`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          }
        );
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

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
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Analytics Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Total Reports Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h6" gutterBottom>
                Total Reports
              </Typography>
              <Typography variant="h3">
                {stats?.totalReports || 0}
              </Typography>
            </Paper>
          </Grid>

          {/* Pending Reports Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'warning.light' }}>
              <Typography variant="h6" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h3">
                {stats?.pendingReports || 0}
              </Typography>
            </Paper>
          </Grid>

          {/* Resolved Reports Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'success.light' }}>
              <Typography variant="h6" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h3">
                {stats?.resolvedReports || 0}
              </Typography>
            </Paper>
          </Grid>

          {/* Resolution Rate Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'info.light' }}>
              <Typography variant="h6" gutterBottom>
                Resolution Rate
              </Typography>
              <Typography variant="h3">
                {stats?.resolutionRate ? `${Math.round(stats.resolutionRate)}%` : '0%'}
              </Typography>
            </Paper>
          </Grid>

          {/* Average Resolution Time */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Average Resolution Time
              </Typography>
              <Typography variant="h4">
                {stats?.avgResolutionTime ? `${Math.round(stats.avgResolutionTime)} days` : 'N/A'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average time taken to resolve reports
              </Typography>
            </Paper>
          </Grid>

          {/* Reports by Location */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top Reporting Locations
              </Typography>
              {stats?.locationStats?.map((loc, index) => (
                <Box key={index} sx={{ mt: 2 }}>
                  <Typography variant="subtitle1">
                    {loc.location}: {loc.count} reports
                  </Typography>
                  <Box
                    sx={{
                      width: `${(loc.count / stats.totalReports) * 100}%`,
                      height: 10,
                      bgcolor: 'primary.main',
                      borderRadius: 1,
                      mt: 1
                    }}
                  />
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Analytics; 