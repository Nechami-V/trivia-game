import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    question: '',
    answers: ['', '', '', ''],
    correctAnswer: 0,
    explanation: '',
    audioFile: null
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const response = await apiService.get('/questions');
      setQuestions(response.data);
    } catch (err) {
      setError('שגיאה בטעינת השאלות');
      console.error('Questions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      
      // Add text fields
      formDataToSend.append('question', formData.question);
      formDataToSend.append('answers', JSON.stringify(formData.answers));
      formDataToSend.append('correctAnswer', formData.correctAnswer);
      formDataToSend.append('explanation', formData.explanation);
      
      // Add audio file if exists
      if (formData.audioFile) {
        formDataToSend.append('audioFile', formData.audioFile);
      }

      if (editingQuestion) {
        await apiService.put(`/questions/${editingQuestion._id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await apiService.post('/questions', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      resetForm();
      fetchQuestions();
      setShowModal(false);
    } catch (err) {
      setError('שגיאה בשמירת השאלה');
      console.error('Save question error:', err);
    }
  };

  const handleDelete = async (questionId) => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק שאלה זו?')) {
      try {
        await apiService.delete(`/questions/${questionId}`);
        fetchQuestions();
      } catch (err) {
        setError('שגיאה במחיקת השאלה');
        console.error('Delete question error:', err);
      }
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      answers: question.answers,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || '',
      audioFile: null
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      question: '',
      answers: ['', '', '', ''],
      correctAnswer: 0,
      explanation: '',
      audioFile: null
    });
    setEditingQuestion(null);
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...formData.answers];
    newAnswers[index] = value;
    setFormData({ ...formData, answers: newAnswers });
  };

  if (loading) {
    return <div className="loading">טוען שאלות...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1>ניהול שאלות</h1>
        <button 
          className="btn btn-success"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          הוסף שאלה חדשה
        </button>
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
              <th>שאלה</th>
              <th>תאריך יצירה</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((question) => (
              <tr key={question._id}>
                <td>{question.question}</td>
                <td>{new Date(question.createdAt).toLocaleDateString('he-IL')}</td>
                <td>
                  <button 
                    className="btn" 
                    onClick={() => handleEdit(question)}
                    style={{ marginLeft: '5px' }}
                  >
                    ערוך
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => handleDelete(question._id)}
                  >
                    מחק
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {questions.length === 0 && (
          <p style={{ textAlign: 'center', padding: '20px' }}>
            אין שאלות במערכת
          </p>
        )}
      </div>

      {/* Modal for Add/Edit Question */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingQuestion ? 'ערוך שאלה' : 'הוסף שאלה חדשה'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>שאלה</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>תשובות</label>
                {formData.answers.map((answer, index) => (
                  <div key={index} style={{ marginBottom: '10px' }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`תשובה ${index + 1}`}
                      value={answer}
                      onChange={(e) => handleAnswerChange(index, e.target.value)}
                      required
                      style={{
                        backgroundColor: index === formData.correctAnswer ? '#e7f3ff' : 'white'
                      }}
                    />
                  </div>
                ))}
              </div>

              <div className="form-group">
                <label>תשובה נכונה</label>
                <select
                  className="form-control"
                  value={formData.correctAnswer}
                  onChange={(e) => setFormData({ ...formData, correctAnswer: parseInt(e.target.value) })}
                >
                  {formData.answers.map((_, index) => (
                    <option key={index} value={index}>
                      תשובה {index + 1}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>הסבר (אופציונלי)</label>
                <textarea
                  className="form-control"
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>קובץ אודיו (אופציונלי)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="audio/*"
                  onChange={(e) => setFormData({ ...formData, audioFile: e.target.files[0] })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>
                  ביטול
                </button>
                <button type="submit" className="btn btn-success">
                  {editingQuestion ? 'עדכן שאלה' : 'הוסף שאלה'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;
