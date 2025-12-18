const API_BASE_URL = 'http://localhost:5000/api';

export async function apiRequest(endpoint, options = {}) {
  const { authToken, ...customOptions } = options;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(authToken && { Authorization: `Bearer ${authToken}` }),
    ...customOptions.headers,
  };

  const config = {
    ...customOptions,
    headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// Example API functions
export const api = {
  // Reports
  getReports: (authToken) => apiRequest('/reports', { authToken }),
  createReport: (authToken, reportData) => apiRequest('/reports', {
    method: 'POST',
    body: JSON.stringify(reportData),
    authToken,
  }),
  // Add more API functions as needed
}; 