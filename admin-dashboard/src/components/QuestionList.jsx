import React, { useState } from 'react';
import QuestionItem from './QuestionItem';
import './QuestionList.css';

const QuestionList = ({ 
  questions, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isLoading,
  pagination,
  onPageChange,
  searchTerm,
  onSearchChange 
}) => {
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const handleDeleteClick = (question) => {
    setDeleteConfirm(question);
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirm) {
      await onDelete(deleteConfirm._id);
      setDeleteConfirm(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const { currentPage, totalPages } = pagination;

    // Previous button
    pages.push(
      <button
        key="prev"
        className={`pagination-btn ${currentPage === 1 ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ‹ הקודם
      </button>
    );

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - 1 && i <= currentPage + 1) // Current page ±1
      ) {
        pages.push(
          <button
            key={i}
            className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </button>
        );
      } else if (
        (i === currentPage - 2 && currentPage > 3) ||
        (i === currentPage + 2 && currentPage < totalPages - 2)
      ) {
        pages.push(
          <span key={`ellipsis-${i}`} className="pagination-ellipsis">
            ...
          </span>
        );
      }
    }

    // Next button
    pages.push(
      <button
        key="next"
        className={`pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        הבא ›
      </button>
    );

    return (
      <div className="pagination">
        <div className="pagination-info">
          עמוד {currentPage} מתוך {totalPages} 
          {pagination.totalQuestions && (
            <span> ({pagination.totalQuestions} שאלות סך הכל)</span>
          )}
        </div>
        <div className="pagination-controls">{pages}</div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="question-list-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>טוען שאלות...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="question-list-container">
      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="חפש שאלות לפי מילה או תשובה..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      {/* Questions Count */}
      {pagination?.totalQuestions !== undefined && (
        <div className="questions-count">
          {pagination.totalQuestions === 0 ? (
            'אין שאלות'
          ) : (
            `נמצאו ${pagination.totalQuestions} שאלות`
          )}
        </div>
      )}

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="empty-state">
          {searchTerm ? (
            <>
              <p>לא נמצאו שאלות התואמות לחיפוש "{searchTerm}"</p>
              <button 
                className="btn btn-secondary" 
                onClick={() => onSearchChange('')}
              >
                נקה חיפוש
              </button>
            </>
          ) : (
            <p>עדיין לא נוספו שאלות למשחק זה</p>
          )}
        </div>
      ) : (
        <>
          <div className="questions-grid">
            {questions.map((question) => (
              <QuestionItem
                key={question._id}
                question={question}
                onEdit={() => onEdit(question)}
                onDelete={() => handleDeleteClick(question)}
                onToggleStatus={() => onToggleStatus(question._id, !question.isActive)}
              />
            ))}
          </div>

          {/* Pagination */}
          {renderPagination()}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>אישור מחיקה</h3>
            <p>
              האם אתה בטוח שברצונך למחוק את השאלה:
              <br />
              <strong>"{deleteConfirm.word}"</strong>
            </p>
            <div className="modal-actions">
              <button 
                className="btn btn-danger" 
                onClick={handleDeleteConfirm}
              >
                מחק
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={handleDeleteCancel}
              >
                ביטול
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
