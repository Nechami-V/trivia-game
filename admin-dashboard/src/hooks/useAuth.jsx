import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService, setAuthToken } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on app start
  useEffect(() => {
    console.log('useAuth - בדיקת אותנטיקציה בעליית המערכת');
    const token = localStorage.getItem('adminToken');
    console.log('useAuth - טוקן נמצא:', !!token);
    
    if (token) {
      setAuthToken(token);
      console.log('useAuth - שולח בקשה לאימות טוקן');
      // Verify token by fetching profile
      apiService.getProfile()
        .then((response) => {
          console.log('useAuth - תגובת פרופיל:', response.data);
          if (response.data && response.data.admin) {
            console.log('useAuth - מנהל מאומת:', response.data.admin.name);
            setAdmin(response.data.admin);
            setIsAuthenticated(true);
          } else {
            console.log('useAuth - תגובה לא תקינה, מנתק');
            logout();
          }
        })
        .catch((error) => {
          console.log('useAuth - שגיאה בבדיקת טוקן:', error);
          logout();
        })
        .finally(() => {
          console.log('useAuth - סיום בדיקת אותנטיקציה');
          setIsLoading(false);
        });
    } else {
      console.log('useAuth - אין טוקן, מגדיר כלא מאומת');
      setIsLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    try {
      console.log('useAuth - מתחיל תהליך התחברות עבור:', username);
      setIsLoading(true);
      const response = await apiService.login({ username, password });
      console.log('useAuth - תגובת התחברות:', response.data);
      
      if (response.data.success && response.data.token) {
        const { token, admin } = response.data;
        console.log('useAuth - התחברות הצליחה עבור מנהל:', admin.name);
        
        setAuthToken(token);
        setAdmin(admin);
        setIsAuthenticated(true);
        
        return admin;
      } else {
        console.log('useAuth - התחברות נכשלה:', response.data.message);
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('useAuth - שגיאה בהתחברות:', error);
      throw new Error(error.message || 'שגיאה בהתחברות');
    } finally {
      console.log('useAuth - סיום תהליך התחברות');
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('useAuth - מנתק מנהל:', admin?.name || 'לא זמין');
    setAuthToken(null);
    setAdmin(null);
    setIsAuthenticated(false);
    localStorage.removeItem('adminToken');
    console.log('useAuth - התנתקות הושלמה');
  };

  const value = {
    admin,
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
