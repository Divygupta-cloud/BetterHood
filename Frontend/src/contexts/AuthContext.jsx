import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import axios from 'axios';

// Make sure this matches your backend port (5000)
const API_URL = 'http://localhost:5000/api';
const AuthContext = createContext();

const isDevelopment = import.meta.env.MODE === 'development';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [userData, setUserData] = useState(null);

  // Fetch user data from MongoDB
  const fetchUserData = async (user) => {
    try {
      const idToken = await user.getIdToken();
      const response = await axios.get(
        `${API_URL}/users/${user.uid}`,
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setUserData(response.data);
      setUserRole(response.data.role);
      return response.data;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  async function login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Force token refresh to get latest claims
      await user.getIdToken(true);
      const tokenResult = await user.getIdTokenResult(true);
      
      // Fetch user data from MongoDB
      const mongoUser = await fetchUserData(user);
      
      setCurrentUser(user);
      return { ...userCredential, mongoUser };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async function signup(email, password, name, role) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user in MongoDB
      const idToken = await user.getIdToken();
      const mongoUser = await axios.post(
        `${API_URL}/users`,
        {
          uid: user.uid,
          name,
          email,
          role,
          createdAt: new Date().toISOString()
        },
        {
          headers: {
            'Authorization': `Bearer ${idToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // If signing up as authority, try to set the role
      if (role === 'authority') {
        try {
          console.log('Making request to:', `${API_URL}/admin/setup-authority`);
          await axios.post(
            `${API_URL}/admin/setup-authority`,
            { 
              uid: user.uid,
              pin: '123456' // This matches the PIN in the backend
            },
            {
              headers: {
                'Authorization': `Bearer ${idToken}`,
                'Content-Type': 'application/json'
              }
            }
          );
          console.log('Authority setup successful');
        } catch (error) {
          console.error('Authority setup failed:', error);
          // Continue anyway since the user is created in MongoDB with the correct role
        }
      }

      // Fetch the complete user data
      await fetchUserData(user);
      setCurrentUser(user);
      
      return {
        user,
        mongoUser: mongoUser.data,
        role: role
      };
    } catch (error) {
      console.error('Signup error:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
      }
      throw error;
    }
  }

  function logout() {
    setCurrentUser(null);
    setUserRole(null);
    setUserData(null);
    return signOut(auth);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchUserData(user);
          setCurrentUser(user);
        } catch (error) {
          console.error('Error in auth state change:', error);
          setCurrentUser(null);
          setUserRole(null);
          setUserData(null);
        }
      } else {
        setCurrentUser(null);
        setUserRole(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    userData,
    signup,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 