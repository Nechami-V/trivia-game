import { useState } from 'react'
import { LoginForm } from './LoginForm'
import { RegisterForm } from './RegisterForm'

type AuthMode = 'main' | 'login' | 'register'

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('main')
  
  if (mode === 'login') {
    return <LoginForm onSwitchToRegister={() => setMode('register')} onBack={() => setMode('main')} />
  }
  
  if (mode === 'register') {
    return <RegisterForm onSwitchToLogin={() => setMode('login')} />
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📚 לימוד אידיש</h1>
          <p className="text-gray-600">ברוכים הבאים לפלטפורמת לימוד השפה האידיש!</p>
          <p className="text-gray-500 text-sm mt-1">למדו אידיש דרך משחקי טריוויה מהנים ואינטראקטיביים</p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => setMode('register')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-green-600 transition-colors"
          >
            🆕 הרשמה למתחילים
          </button>
          
          <button
            onClick={() => setMode('login')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-blue-600 transition-colors"
          >
            🔐 כניסה ללומדים קיימים
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">או</span>
            </div>
          </div>
          
          <button
            onClick={() => window.open('http://localhost:3002/admin', '_blank')}
            className="w-full bg-gray-700 text-white py-3 px-4 rounded-md text-lg font-medium hover:bg-gray-800 transition-colors"
          >
            👑 כניסת מנהל
          </button>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>למדו אידיש בצורה אינטראקטיבית ומהנה</p>
          <p>שפרו את הידע שלכם במילים, ביטויים ותרבות אידיש!</p>
        </div>
      </div>
    </div>
  )
}
