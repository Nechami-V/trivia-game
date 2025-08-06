import { create } from 'zustand'
import axios from 'axios'

interface User {
  id: string
  username: string
  email: string
  isAdmin?: boolean
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  adminLogin: (username: string, password: string) => Promise<void>
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (username: string, password: string) => {
    try {
      // נסה תחילה לחפש לפי email
      let loginData = { email: username, password }
      
      // אם זה לא נראה כמו email, נשלח כ-username (במידה והשרת תומך)
      if (!username.includes('@')) {
        // אם השרת לא תומך ב-username, נציג הודעה מתאימה
        throw new Error('Please use your email address to login')
      }
      
      const response = await axios.post('/api/auth/login', loginData)
      
      const { user, token } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ user: { id: user.id, username: user.name, email: user.email }, isAuthenticated: true })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },
  
  register: async (username: string, email: string, password: string) => {
    try {
      console.log('Sending registration data:', { name: username, email, password: '***' })
      
      const response = await axios.post('/api/auth/register', {
        name: username,  // השרת מצפה לשדה 'name'
        email,
        password
      })
      
      console.log('Registration successful:', response.data)
      const { user, token } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ user: { id: user.id, username: user.name, email: user.email }, isAuthenticated: true })
    } catch (error: any) {
      console.error('Registration failed:', error.response?.data || error.message)
      throw error
    }
  },
  
  adminLogin: async (username: string, password: string) => {
    try {
      const response = await axios.post('/api/admin/login', {
        username,  // השרת מצפה ל-username לא לemail
        password
      })
      
      const { admin, token } = response.data
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      set({ 
        user: { 
          id: admin.id, 
          username: admin.username, 
          email: admin.email || admin.username + '@admin.local', 
          isAdmin: true 
        }, 
        isAuthenticated: true 
      })
    } catch (error) {
      console.error('Admin login failed:', error)
      throw error
    }
  },
  
  logout: () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    set({ user: null, isAuthenticated: false })
  }
}))
