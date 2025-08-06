import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalQuestions: 0,
    totalGamesPlayed: 0,
    activeUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('Dashboard - טוען נתוני דשבורד');
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      console.log('Dashboard - שולח בקשה לנתוני סטטיסטיקות');
      setLoading(true);
      const response = await apiService.get('/admin/stats');
      setStats(response.data);
    } catch (err) {
      setError('שגיאה בטעינת נתוני הדשבורד');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <h2>טוען נתוני דשבורד...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button className="btn" onClick={fetchDashboardStats} style={{ marginLeft: '10px' }}>
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '30px' }}>אזור ניהול</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">סך הכל לומדים</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalQuestions}</div>
          <div className="stat-label">סך הכל שאלות</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.totalGamesPlayed}</div>
          <div className="stat-label">פעילויות שהושלמו</div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{stats.activeUsers}</div>
          <div className="stat-label">לומדים פעילים</div>
        </div>
      </div>

      <div className="card">
        <h3>פעילות אחרונה</h3>
        <p>כאן יוצגו פעילויות אחרונות של המערכת</p>
      </div>

      <div className="card">
        <h3>פעולות מהירות</h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            className="btn"
            onClick={() => navigate('/questions')}
          >
            הוסף שאלה חדשה
          </button>
          <button 
            className="btn"
            onClick={() => navigate('/users')}
          >
            צפה בלומדים
          </button>
          <button 
            className="btn"
            onClick={() => navigate('/games')}
          >
            נהל פעילויות לימוד
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
