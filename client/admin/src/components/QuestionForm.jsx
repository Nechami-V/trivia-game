import React, { useState, useEffect } from 'react';
import './QuestionForm.css';

const QuestionForm = ({ question, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState({
    word: '',
    correctAnswer: '',
    wrongAnswers: ['', '', ''],
    ashkenaziAudioFile: '',
    sephardiAudioFile: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (question) {
      setFormData({
        word: question.word || '',
        correctAnswer: question.correctAnswer || '',
        wrongAnswers: question.wrongAnswers || ['', '', ''],
        ashkenaziAudioFile: question.ashkenaziAudioFile || '',
        sephardiAudioFile: question.sephardiAudioFile || '',
        isActive: question.isActive !== undefined ? question.isActive : true
      });
    }
  }, [question]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleWrongAnswerChange = (index, value) => {
    const newWrongAnswers = [...formData.wrongAnswers];
    newWrongAnswers[index] = value;
    setFormData(prev => ({
      ...prev,
      wrongAnswers: newWrongAnswers
    }));

    // Clear error when user starts typing
    if (errors[`wrongAnswer${index}`]) {
      setErrors(prev => ({ ...prev, [`wrongAnswer${index}`]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.word.trim()) {
      newErrors.word = 'מילה חובה';
    }

    if (!formData.correctAnswer.trim()) {
      newErrors.correctAnswer = 'תשובה נכונה חובה';
    }

    formData.wrongAnswers.forEach((answer, index) => {
      if (!answer.trim()) {
        newErrors[`wrongAnswer${index}`] = `תשובה שגויה ${index + 1} חובה`;
      }
    });

    // Check for duplicate answers
    const allAnswers = [formData.correctAnswer, ...formData.wrongAnswers].filter(a => a.trim());
    const uniqueAnswers = new Set(allAnswers.map(a => a.trim().toLowerCase()));
    if (uniqueAnswers.size !== allAnswers.length) {
      newErrors.general = 'לא ניתן להשתמש באותה תשובה פעמיים';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Clean up the data
      const cleanData = {
        ...formData,
        word: formData.word.trim(),
        correctAnswer: formData.correctAnswer.trim(),
        wrongAnswers: formData.wrongAnswers.map(answer => answer.trim())
      };
      onSubmit(cleanData);
    }
  };

  return (
    <div className="question-form-container">
      <form onSubmit={handleSubmit} className="question-form">
        <h3>{question ? 'עריכת שאלה' : 'שאלה חדשה'}</h3>

        {errors.general && (
          <div className="error-message general-error">
            {errors.general}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="word">המילה בעברית *</label>
          <input
            type="text"
            id="word"
            name="word"
            value={formData.word}
            onChange={handleChange}
            className={errors.word ? 'error' : ''}
            placeholder="הכנס את המילה בעברית"
            disabled={isLoading}
          />
          {errors.word && <span className="error-text">{errors.word}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="correctAnswer">התשובה הנכונה *</label>
          <input
            type="text"
            id="correctAnswer"
            name="correctAnswer"
            value={formData.correctAnswer}
            onChange={handleChange}
            className={errors.correctAnswer ? 'error' : ''}
            placeholder="הכנס את התשובה הנכונה"
            disabled={isLoading}
          />
          {errors.correctAnswer && <span className="error-text">{errors.correctAnswer}</span>}
        </div>

        <div className="form-group">
          <label>תשובות שגויות *</label>
          {formData.wrongAnswers.map((answer, index) => (
            <div key={index} className="wrong-answer-input">
              <input
                type="text"
                value={answer}
                onChange={(e) => handleWrongAnswerChange(index, e.target.value)}
                className={errors[`wrongAnswer${index}`] ? 'error' : ''}
                placeholder={`תשובה שגויה ${index + 1}`}
                disabled={isLoading}
              />
              {errors[`wrongAnswer${index}`] && (
                <span className="error-text">{errors[`wrongAnswer${index}`]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="form-group">
          <label htmlFor="ashkenaziAudioFile">קובץ אודיו אשכנזי</label>
          <input
            type="text"
            id="ashkenaziAudioFile"
            name="ashkenaziAudioFile"
            value={formData.ashkenaziAudioFile}
            onChange={handleChange}
            placeholder="נתיב לקובץ אודיו אשכנזי (אופציונלי)"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="sephardiAudioFile">קובץ אודיו ספרדי</label>
          <input
            type="text"
            id="sephardiAudioFile"
            name="sephardiAudioFile"
            value={formData.sephardiAudioFile}
            onChange={handleChange}
            placeholder="נתיב לקובץ אודיו ספרדי (אופציונלי)"
            disabled={isLoading}
          />
        </div>

        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              disabled={isLoading}
            />
            שאלה פעילה
          </label>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'שומר...' : (question ? 'עדכן שאלה' : 'הוסף שאלה')}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
          >
            ביטול
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
