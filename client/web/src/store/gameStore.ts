import { create } from 'zustand'
import axios from 'axios'

interface Game {
  _id: string
  title: string
  description: string
  questions: Question[]
  createdAt: string
}

interface Question {
  _id: string
  question: string
  answers: string[]
  correctAnswer: number
}

interface GameState {
  games: Game[]
  currentGame: Game | null
  currentQuestionIndex: number
  score: number
  userAnswers: number[]
  
  fetchGames: () => Promise<void>
  startGame: (gameId: string) => Promise<void>
  submitAnswer: (answerIndex: number) => void
  nextQuestion: () => void
  endGame: () => void
}

export const useGameStore = create<GameState>((set, get) => ({
  games: [],
  currentGame: null,
  currentQuestionIndex: 0,
  score: 0,
  userAnswers: [],
  
  fetchGames: async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/game/list')
      set({ games: response.data })
    } catch (error) {
      console.error('Failed to fetch games:', error)
    }
  },
  
  startGame: async (gameId: string) => {
    try {
      const response = await axios.get(`http://localhost:3000/api/game/${gameId}/details`)
      set({ 
        currentGame: response.data,
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: []
      })
    } catch (error) {
      console.error('Failed to start game:', error)
    }
  },
  
  submitAnswer: (answerIndex: number) => {
    const { currentGame, currentQuestionIndex, userAnswers, score } = get()
    if (!currentGame) return
    
    const question = currentGame.questions[currentQuestionIndex]
    const isCorrect = answerIndex === question.correctAnswer
    
    set({
      userAnswers: [...userAnswers, answerIndex],
      score: isCorrect ? score + 1 : score
    })
  },
  
  nextQuestion: () => {
    const { currentQuestionIndex } = get()
    set({ currentQuestionIndex: currentQuestionIndex + 1 })
  },
  
  endGame: () => {
    set({ 
      currentGame: null,
      currentQuestionIndex: 0,
      score: 0,
      userAnswers: []
    })
  }
}))
