import { useState } from 'react'
import { useAuthStore } from '../store/authStore'

export function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const register = useAuthStore(state => state.register)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password !== confirmPassword) {
      setError('הסיסמאות לא תואמות')
      return
    }
    
    if (password.length < 6) {
      setError('הסיסמה חייבת להכיל לפחות 6 תווים')
      return
    }
    
    setIsLoading(true)
    
    try {
      await register(username, email, password)
    } catch (error: any) {
      console.log('Error details:', error)
      if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else if (error.response?.data?.errors) {
        // אם יש שגיאות ולידציה
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ')
        setError(`שגיאות ולידציה: ${validationErrors}`)
      } else if (error.message) {
        setError(error.message)
      } else {
        setError('שגיאה בהרשמה')
      }
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 className="text-2xl font-bold mb-6 text-center">הרשמה ללימוד אידיש</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            שם משתמש
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={3}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אימייל
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            סיסמה
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            אישור סיסמה
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
            minLength={6}
          />
        </div>
        
        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}
        
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white p-3 rounded-md hover:bg-green-600 disabled:opacity-50"
        >
          {isLoading ? 'נרשם...' : 'הרשמה'}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-500 hover:text-blue-700 font-medium"
          >
            כניסה
          </button>
        </p>
      </div>
    </div>
  )
}
