import { useState } from 'react'
import { useGameStore } from '../store/gameStore'

export function TriviaGame() {
  const { 
    currentGame, 
    currentQuestionIndex, 
    score, 
    submitAnswer, 
    nextQuestion, 
    endGame 
  } = useGameStore()
  
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  
  if (!currentGame) return null
  
  const currentQuestion = currentGame.questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === currentGame.questions.length - 1
  
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return
    
    setSelectedAnswer(answerIndex)
    submitAnswer(answerIndex)
    setShowResult(true)
    
    setTimeout(() => {
      if (isLastQuestion) {
        // Game finished
        return
      } else {
        nextQuestion()
        setSelectedAnswer(null)
        setShowResult(false)
      }
    }, 2000)
  }
  
  const handleEndGame = () => {
    endGame()
  }
  
  if (isLastQuestion && showResult) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">המשחק הסתיים!</h2>
          <p className="text-xl mb-4">
            הניקוד שלך: {score} מתוך {currentGame.questions.length}
          </p>
          <p className="text-gray-600 mb-6">
            {score / currentGame.questions.length >= 0.7 ? 'כל הכבוד!' : 'נסה שוב!'}
          </p>
          <button
            onClick={handleEndGame}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
          >
            חזרה לרשימת המשחקים
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold">{currentGame.title}</h1>
            <div className="text-sm text-gray-600">
              שאלה {currentQuestionIndex + 1} מתוך {currentGame.questions.length}
            </div>
          </div>
          
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-2 mb-4">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${((currentQuestionIndex + 1) / currentGame.questions.length) * 100}%` 
                }}
              />
            </div>
            <p className="text-sm text-gray-600">ניקוד: {score}</p>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>
            
            <div className="space-y-3">
              {currentQuestion.answers.map((answer, index) => {
                let buttonClass = "w-full p-4 text-right border rounded-md transition-colors "
                
                if (selectedAnswer === null) {
                  buttonClass += "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                } else if (index === currentQuestion.correctAnswer) {
                  buttonClass += "border-green-500 bg-green-100 text-green-800"
                } else if (index === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-100 text-red-800"
                } else {
                  buttonClass += "border-gray-300 bg-gray-100"
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null}
                    className={buttonClass}
                  >
                    {answer}
                  </button>
                )
              })}
            </div>
          </div>
          
          {showResult && (
            <div className="text-center">
              <p className={`text-lg font-semibold ${
                selectedAnswer === currentQuestion.correctAnswer 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {selectedAnswer === currentQuestion.correctAnswer ? 'נכון!' : 'לא נכון'}
              </p>
              {!isLastQuestion && (
                <p className="text-sm text-gray-600 mt-2">
                  עובר לשאלה הבאה...
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
