import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import axios from 'axios';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';

// Hardcode the API URL for now - you can move this to .env later
const API_URL = 'http://localhost:5000/api';

const MyReports = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        // Add a delay to ensure Firebase auth is fully initialized
        await new Promise(resolve => setTimeout(resolve, 1000));

        const idToken = await user.getIdToken(true); // Force token refresh
        console.log('Making API request to:', `${API_URL}/reports/my-reports`);
        
        const response = await axios.get(
          `${API_URL}/reports/my-reports`,
          {
            headers: {
              'Authorization': `Bearer ${idToken}`,
              'Accept': 'application/json'
            }
          }
        );

        console.log('API Response:', response.data);

        // Ensure response.data is an array
        if (Array.isArray(response.data)) {
          setReports(response.data);
        } else {
          console.error('Invalid response format:', response.data);
          setError('Received invalid data format from server');
          setReports([]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
        if (error.response) {
          console.error('Error response:', error.response.data);
          console.error('Error status:', error.response.status);
        }
        setError(
          error.response?.data?.message || 
          error.message || 
          'Failed to load reports. Please ensure the backend server is running.'
        );
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleImageError = (reportId, imageUrl) => {
    console.error(`Error loading image for report ${reportId}:`, imageUrl);
    setImageErrors(prev => ({
      ...prev,
      [reportId]: true
    }));
  };

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

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setReportToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;

    try {
      const user = auth.currentUser;
      const idToken = await user.getIdToken(true);
      
      await axios.delete(
        `${API_URL}/reports/${reportToDelete._id}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
          }
        }
      );

      // Remove the deleted report from the state
      setReports(reports.filter(report => report._id !== reportToDelete._id));
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    } catch (error) {
      console.error('Error deleting report:', error);
      setError('Failed to delete report. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            My Reports
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/create-report')}
          >
            Create New Report
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!error && reports.length === 0 ? (
          <Alert severity="info">
            You haven't created any reports yet. Click the button above to create your first report.
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {reports.map((report) => (
              <Grid item xs={12} md={6} key={report._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {report.title}
                    </Typography>
                    <Chip 
                      label={report.status || 'pending'}
                      color={getStatusColor(report.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography color="textSecondary" gutterBottom>
                      Location: {report.location}
                    </Typography>
                    <Typography variant="body2" paragraph>
                      {report.description}
                    </Typography>
                    {report.imageUrl && !imageErrors[report._id] && (
                      <Box sx={{ mt: 2, mb: 2 }}>
                        <img 
                          src={`${API_URL}/reports/image/${report.imageUrl}`}
                          alt={`Report from ${report.location}`}
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '200px', 
                            objectFit: 'cover',
                            borderRadius: '4px',
                            border: '1px solid #e0e0e0'
                          }} 
                          onError={() => handleImageError(report._id, report.imageUrl)}
                        />
                      </Box>
                    )}
                    {imageErrors[report._id] && (
                      <Box sx={{ 
                        mt: 2, 
                        mb: 2, 
                        height: '200px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f5f5f5',
                        borderRadius: '4px',
                        border: '1px solid #e0e0e0'
                      }}>
                        <Typography color="textSecondary">
                          Image not available
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="caption" display="block">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/reports/${report._id}`)}
                    >
                      View Details
                    </Button>
                    <Button 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteClick(report)}
                    >
                      Delete
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this report? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyReports;
  