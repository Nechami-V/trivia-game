import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export function AdminLoginForm({ onBack }: { onBack: () => void }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const adminLogin = useAuthStore(state => state.adminLogin)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await adminLogin(username, password)
    } catch (error) {
      setError('שם משתמש או סיסמה שגויים למנהל')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">👑 כניסת מנהל</h2>
          <p className="text-gray-600 mt-2">גישה לפאנל הניהול</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              שם משתמש מנהל
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              placeholder="admin"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמת מנהל
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gray-700 text-white p-3 rounded-md hover:bg-gray-800 disabled:opacity-50"
          >
            {isLoading ? 'נכנס...' : 'כניסה כמנהל'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← חזרה
          </button>
        </div>
      </div>
    </div>
  )
}
