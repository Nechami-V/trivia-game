import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onBack: () => void
}

export function LoginForm({ onSwitchToRegister, onBack }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const login = useAuthStore(state => state.login)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      await login(username, password)
    } catch (error) {
      setError('שם משתמש או סיסמה שגויים')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">כניסה ללימוד אידיש</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <input
            type="email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="your@email.com"
            required
          />
        </div>          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              סיסמה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {isLoading ? 'נכנס...' : 'כניסה'}
          </button>
        </form>
        
        <div className="mt-4 space-y-2 text-center">
          <p className="text-sm text-gray-600">
            אין לך חשבון?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-green-500 hover:text-green-700 font-medium"
            >
              הרשמה
            </button>
          </p>
          
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
