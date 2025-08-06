import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

export function AdminDashboard() {
  const { logout } = useAuthStore()
  
  useEffect(() => {
    // מעביר אוטומטית לדשבורד הישן
    window.location.href = 'http://localhost:3002'
  }, [])
  
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold mb-2">מעביר לדשבורד הניהול...</h2>
        <p className="text-gray-300">אם לא נפתח אוטומטית, לחץ על הקישור למטה</p>
        <a 
          href="http://localhost:3002" 
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block mt-4 bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
        >
          פתח דשבורד ניהול
        </a>
        <div className="mt-6">
          <button
            onClick={logout}
            className="text-red-400 hover:text-red-300 text-sm"
          >
            יציאה
          </button>
        </div>
      </div>
    </div>
  )
}
