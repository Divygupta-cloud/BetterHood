import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Grid
} from '@mui/material';

const API_URL = 'http://localhost:5000/api';

const ReportDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const idToken = await user.getIdToken(true);
        const response = await axios.get(
          `${API_URL}/reports/${id}`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Accept': 'application/json'
            }
          }
        );

        setReport(response.data);
      } catch (error) {
        console.error('Error fetching report:', error);
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load report details'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'warning';
      case 'in-progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
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
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/my-reports')}>
            Back to Reports
          </Button>
        </Box>
      </Container>
    );
  }

  if (!report) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="info">Report not found</Alert>
        <Box sx={{ mt: 2 }}>
          <Button variant="contained" onClick={() => navigate('/my-reports')}>
            Back to Reports
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/my-reports')}>
          Back to Reports
        </Button>
      </Box>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" component="h1" gutterBottom>
              {report.title}
            </Typography>
            <Chip 
              label={report.status || 'pending'}
              color={getStatusColor(report.status)}
              sx={{ mb: 2 }}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Location
            </Typography>
            <Typography paragraph>
              {report.location}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {report.description}
            </Typography>
          </Grid>

          {report.imageUrl && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Image
              </Typography>
              <Box sx={{ mt: 2, mb: 2 }}>
                <img 
                  src={`${API_URL}/reports/image/${report.imageUrl}`}
                  alt={`Report from ${report.location}`}
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '400px', 
                    objectFit: 'contain',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0'
                  }} 
                />
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Created: {new Date(report.createdAt).toLocaleString()}
              </Typography>
              {report.updatedAt && (
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(report.updatedAt).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ReportDetail; 