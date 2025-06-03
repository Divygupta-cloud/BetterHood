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
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ReportsManagement = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [resolvedImage, setResolvedImage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${API_URL}/reports`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );

      if (!response.data) {
        throw new Error('No data received from server');
      }

      const reportsData = Array.isArray(response.data) ? response.data : [];
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reportId, newStatus) => {
    try {
      setError('');
      const idToken = await auth.currentUser.getIdToken(true);
      await axios.patch(
        `${API_URL}/reports/${reportId}`,
        { status: newStatus },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      await fetchReports();
    } catch (error) {
      console.error('Error updating report status:', error);
      setError(error.response?.data?.message || 'Failed to update report status');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      
      try {
        const base64 = await convertToBase64(file);
        setResolvedImage(base64);
        setError(''); // Clear any previous errors
      } catch (error) {
        console.error('Error processing image:', error);
        setError('Error processing image');
      }
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleResolve = async () => {
    if (!selectedReport || !resolvedImage) return;

    try {
      setError('');
      const idToken = await auth.currentUser.getIdToken();
      await axios.patch(
        `${API_URL}/reports/${selectedReport._id}`,
        {
          status: 'resolved',
          resolvedImage: resolvedImage
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        }
      );
      setDialogOpen(false);
      setSelectedReport(null);
      setResolvedImage('');
      await fetchReports(); // Refresh reports after resolution
    } catch (error) {
      console.error('Error resolving report:', error);
      setError(error.response?.data?.message || 'Failed to resolve report');
    }
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

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'Pending';
      case 'in-progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'rejected':
        return 'Rejected';
      default:
        return status || 'Unknown';
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
        <Typography variant="h4" component="h1" gutterBottom>
          Reports Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            select
            label="Filter by Status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">All Reports</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="resolved">Resolved</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
        </Box>

        {reports.length === 0 ? (
          <Alert severity="info">No reports found.</Alert>
        ) : (
          <Grid container spacing={3}>
            {reports
              .filter(report => filterStatus === 'all' || report.status === filterStatus)
              .map((report) => (
                <Grid item xs={12} md={6} key={report._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {report.title}
                      </Typography>
                      <Typography color="textSecondary" gutterBottom>
                        Location: {report.location}
                      </Typography>
                      <Typography variant="body2" paragraph>
                        {report.description}
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          label={getStatusLabel(report.status)}
                          color={getStatusColor(report.status)}
                          size="small"
                        />
                      </Box>
                      <Typography variant="caption" display="block">
                        Reported on: {new Date(report.createdAt).toLocaleDateString()}
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
                      {report.status !== 'resolved' && report.status !== 'rejected' && (
                        <>
                          {report.status !== 'in-progress' && (
                            <Button
                              size="small"
                              color="info"
                              onClick={() => handleStatusChange(report._id, 'in-progress')}
                            >
                              Mark In Progress
                            </Button>
                          )}
                          <Button
                            size="small"
                            color="success"
                            onClick={() => {
                              setSelectedReport(report);
                              setDialogOpen(true);
                            }}
                          >
                            Mark Resolved
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleStatusChange(report._id, 'rejected')}
                          >
                            Reject Report
                          </Button>
                        </>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
          </Grid>
        )}

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <DialogTitle>Resolve Report</DialogTitle>
          <DialogContent>
            <Typography gutterBottom>
              Upload an image showing the resolved issue:
            </Typography>
            <Button
              variant="contained"
              component="label"
              sx={{ mt: 2 }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </Button>
            {resolvedImage && (
              <Box sx={{ mt: 2 }}>
                <img 
                  src={resolvedImage} 
                  alt="Resolution Preview" 
                  style={{ maxWidth: '100%', maxHeight: '200px' }} 
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleResolve} 
              color="primary"
              disabled={!resolvedImage}
            >
              Confirm Resolution
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default ReportsManagement; 