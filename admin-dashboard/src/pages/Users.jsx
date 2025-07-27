import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers();
      setUsers(response.data.users || response.data || []);
    } catch (err) {
      setError('שגיאה בטעינת המשתמשים');
      console.error('Users error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (userId, currentStatus) => {
    try {
      await apiService.toggleUserStatus(userId, !currentStatus);
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, isActive: !currentStatus }
          : user
      ));
    } catch (err) {
      setError('שגיאה בעדכון סטטוס המשתמש');
      console.error('Toggle user error:', err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק משתמש זה?')) {
      try {
        await apiService.deleteUser(userId);
        setUsers(users.filter(user => user._id !== userId));
      } catch (err) {
        setError('שגיאה במחיקת המשתמש');
        console.error('Delete user error:', err);
      }
    }
  };

  if (loading) {
    return <div className="loading">טוען משתמשים...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>ניהול משתמשים</h1>
        <div className="stat-card" style={{ minWidth: '200px' }}>
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">סך הכל משתמשים</div>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>שם משתמש</th>
              <th>אימייל</th>
              <th>תאריך הצטרפות</th>
              <th>התחברות אחרונה</th>
              <th>ניקוד כולל</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('he-IL')}</td>
                <td>
                  {user.lastLogin 
                    ? new Date(user.lastLogin).toLocaleDateString('he-IL')
                    : 'מעולם לא התחבר'
                  }
                </td>
                <td>{user.totalScore || 0}</td>
                <td>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    backgroundColor: user.isActive ? '#d4edda' : '#f8d7da',
                    color: user.isActive ? '#155724' : '#721c24'
                  }}>
                    {user.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </td>
                <td>
                  <button 
                    className={`btn ${user.isActive ? 'btn-danger' : 'btn-success'}`}
                    onClick={() => handleToggleActive(user._id, user.isActive)}
                    style={{ marginLeft: '5px' }}
                  >
                    {user.isActive ? 'השבת' : 'הפעל'}
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>
            אין משתמשים במערכת
          </p>
        )}
      </div>
    </div>
  );
};

export default Users;
