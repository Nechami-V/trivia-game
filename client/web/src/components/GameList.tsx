import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export function GameList() {
  const { games, fetchGames, startGame } = useGameStore()
  
  useEffect(() => {
    fetchGames()
  }, [fetchGames])
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">בחרו פעילות לימוד אידיש</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((game) => (
          <div key={game._id} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-2">{game.title}</h3>
            <p className="text-gray-600 mb-4">{game.description}</p>
            <p className="text-sm text-gray-500 mb-4">
              {game.questions.length} שאלות
            </p>
            <button
              onClick={() => startGame(game._id)}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
            >
              התחילו ללמוד
            </button>
          </div>
        ))}
      </div>
      
      {games.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">אין פעילויות לימוד זמינות כרגע</p>
        </div>
      )}
    </div>
  )
}
