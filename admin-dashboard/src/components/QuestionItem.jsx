import React from 'react';
import './QuestionItem.css';

const QuestionItem = ({ question, onEdit, onDelete, onToggleStatus }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shuffleAnswers = (correctAnswer, wrongAnswers) => {
    const allAnswers = [correctAnswer, ...wrongAnswers];
    return allAnswers.sort(() => Math.random() - 0.5);
  };

  const shuffledAnswers = shuffleAnswers(question.correctAnswer, question.wrongAnswers);

  return (
    <div className={`question-item ${!question.isActive ? 'inactive' : ''}`}>
      {/* Header */}
      <div className="question-header">
        <div className="question-word">
          <span className="word-text">{question.word}</span>
          {!question.isActive && <span className="inactive-badge">לא פעיל</span>}
        </div>
        <div className="question-actions">
          <button 
            className="action-btn edit-btn"
            onClick={onEdit}
            title="עריכה"
          >
            ✏️
          </button>
          <button 
            className={`action-btn toggle-btn ${question.isActive ? 'active' : 'inactive'}`}
            onClick={onToggleStatus}
            title={question.isActive ? 'השבת' : 'הפעל'}
          >
            {question.isActive ? '👁️' : '👁️‍🗨️'}
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={onDelete}
            title="מחיקה"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="question-content">
        {/* Correct Answer */}
        <div className="correct-answer">
          <span className="answer-label">תשובה נכונה:</span>
          <span className="answer-text correct">{question.correctAnswer}</span>
        </div>

        {/* All Answers Preview */}
        <div className="answers-preview">
          <span className="answers-label">תשובות (מעורבבות):</span>
          <div className="answers-grid">
            {shuffledAnswers.map((answer, index) => (
              <div 
                key={index} 
                className={`answer-option ${answer === question.correctAnswer ? 'correct-option' : 'wrong-option'}`}
              >
                {answer}
                {answer === question.correctAnswer && <span className="correct-indicator">✓</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Audio Files */}
        {(question.ashkenaziAudioFile || question.sephardiAudioFile) && (
          <div className="audio-files">
            <span className="audio-label">קבצי אודיו:</span>
            <div className="audio-list">
              {question.ashkenaziAudioFile && (
                <span className="audio-file ashkenazi">
                  🎵 אשכנזי: {question.ashkenaziAudioFile.split('/').pop()}
                </span>
              )}
              {question.sephardiAudioFile && (
                <span className="audio-file sephardi">
                  🎵 ספרדי: {question.sephardiAudioFile.split('/').pop()}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="question-footer">
        <div className="metadata">
          <span className="created-date">
            נוצר: {formatDate(question.createdAt)}
          </span>
          {question.updatedAt && question.updatedAt !== question.createdAt && (
            <span className="updated-date">
              עודכן: {formatDate(question.updatedAt)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionItem;
