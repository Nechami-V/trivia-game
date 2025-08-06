import { AuthPage } from './components/AuthPage'
import { GameList } from './components/GameList'
import { TriviaGame } from './components/TriviaGame'
import { AdminDashboard } from './components/AdminDashboard'
import { useAuthStore } from './store/authStore'
import { useGameStore } from './store/gameStore'

function App() {
  const { user, isAuthenticated } = useAuthStore()
  const { currentGame } = useGameStore()

  if (!isAuthenticated) {
    return <AuthPage />
  }

  // אם המשתמש הוא מנהל, הצג את פאנל הניהול
  if (user?.isAdmin) {
    return <AdminDashboard />
  }

  if (currentGame) {
    return <TriviaGame />
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">🎮 טריוויה</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">שלום {user?.username}</span>
              <button
                onClick={() => useAuthStore.getState().logout()}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                יציאה
              </button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <GameList />
      </main>
    </div>
  )
}

export default App
