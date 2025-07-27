import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';

// Import pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Questions from './pages/Questions';
import Users from './pages/Users';
import Analytics from './pages/Analytics';
import Games from './pages/Games';

// Import components
import AdminLayout from './components/AdminLayout';
import LoadingSpinner from './components/LoadingSpinner';

// Import styles
// import './App.css';

// Create a query client (optional - for future use)
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       refetchOnWindowFocus: false,
//       retry: 1,
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     },
//   },
// });

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  if (isLoading) {
    console.log('ProtectedRoute - מציג LoadingSpinner');
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    console.log('ProtectedRoute - מפנה ל-login, לא מאומת');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute - גישה מורשת, מציג תוכן');
  return children;
};

// Public Route component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  console.log('PublicRoute - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
  
  if (isLoading) {
    console.log('PublicRoute - מציג LoadingSpinner');
    return <LoadingSpinner />;
  }
  
  if (isAuthenticated) {
    console.log('PublicRoute - משתמש מאומת, מפנה לדשבורד');
    return <Navigate to="/admin" replace />;
  }
  
  console.log('PublicRoute - מציג דף התחברות');
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/games" element={<Games />} />
                      <Route path="/questions" element={<Questions />} />
                      <Route path="/users" element={<Users />} />
                      <Route path="/analytics" element={<Analytics />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
