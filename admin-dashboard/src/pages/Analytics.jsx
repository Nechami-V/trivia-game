import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState({
    gamesStats: {
      totalGames: 0,
      completedGames: 0,
      averageScore: 0
    },
    questionsStats: {
      totalQuestions: 0,
      mostAnswered: [],
      hardestQuestions: []
    },
    userStats: {
      totalUsers: 0,
      activeUsers: 0,
      topPlayers: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('week');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await apiService.get(`/admin/analytics?range=${timeRange}`);
      setAnalytics(response.data);
    } catch (err) {
      setError('שגיאה בטעינת נתוני האנליטיקה');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">טוען נתוני אנליטיקה...</div>;
  }

  if (error) {
    return (
      <div className="alert alert-error">
        {error}
        <button className="btn" onClick={fetchAnalytics} style={{ marginLeft: '10px' }}>
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>אנליטיקה ודוחות</h1>
        
        <div className="form-group" style={{ minWidth: '150px', margin: 0 }}>
          <select
            className="form-control"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="day">יום אחרון</option>
            <option value="week">שבוע אחרון</option>
            <option value="month">חודש אחרון</option>
            <option value="all">כל הזמנים</option>
          </select>
        </div>
      </div>

      {/* Game Statistics */}
      <div className="card">
        <h3>סטטיסטיקות משחקים</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{analytics.gamesStats.totalGames}</div>
            <div className="stat-label">סך הכל משחקים</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.gamesStats.completedGames}</div>
            <div className="stat-label">משחקים שהושלמו</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.gamesStats.averageScore}%</div>
            <div className="stat-label">ניקוד ממוצע</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {analytics.gamesStats.totalGames > 0 
                ? Math.round((analytics.gamesStats.completedGames / analytics.gamesStats.totalGames) * 100)
                : 0}%
            </div>
            <div className="stat-label">אחוז השלמה</div>
          </div>
        </div>
      </div>

      {/* Top Players */}
      <div className="card">
        <h3>שחקנים מובילים</h3>
        {analytics.userStats.topPlayers.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>דירוג</th>
                <th>שם משתמש</th>
                <th>ניקוד כולל</th>
                <th>משחקים שהושלמו</th>
                <th>ממוצע ניקוד</th>
              </tr>
            </thead>
            <tbody>
              {analytics.userStats.topPlayers.map((player, index) => (
                <tr key={player._id}>
                  <td>
                    <span style={{
                      fontWeight: 'bold',
                      color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#333'
                    }}>
                      #{index + 1}
                    </span>
                  </td>
                  <td>{player.username}</td>
                  <td>{player.totalScore}</td>
                  <td>{player.gamesCompleted}</td>
                  <td>{player.averageScore}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>אין נתונים על שחקנים</p>
        )}
      </div>

      {/* Questions Statistics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <h3>שאלות פופולריות</h3>
          {analytics.questionsStats.mostAnswered.length > 0 ? (
            <div>
              {analytics.questionsStats.mostAnswered.map((question, index) => (
                <div key={question._id} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{question.question.substring(0, 50)}...</span>
                  <span style={{ fontWeight: 'bold' }}>{question.timesAnswered} תשובות</span>
                </div>
              ))}
            </div>
          ) : (
            <p>אין נתונים על שאלות</p>
          )}
        </div>

        <div className="card">
          <h3>שאלות מאתגרות</h3>
          {analytics.questionsStats.hardestQuestions.length > 0 ? (
            <div>
              {analytics.questionsStats.hardestQuestions.map((question, index) => (
                <div key={question._id} style={{ 
                  padding: '10px', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>{question.question.substring(0, 50)}...</span>
                  <span style={{ fontWeight: 'bold', color: '#dc3545' }}>
                    {question.correctPercentage}% נכון
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>אין נתונים על שאלות</p>
          )}
        </div>
      </div>

      {/* User Activity */}
      <div className="card">
        <h3>פעילות משתמשים</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{analytics.userStats.totalUsers}</div>
            <div className="stat-label">סך הכל משתמשים</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{analytics.userStats.activeUsers}</div>
            <div className="stat-label">משתמשים פעילים</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">
              {analytics.userStats.totalUsers > 0 
                ? Math.round((analytics.userStats.activeUsers / analytics.userStats.totalUsers) * 100)
                : 0}%
            </div>
            <div className="stat-label">אחוז פעילות</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
