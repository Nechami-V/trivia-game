import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Settings,
  Search,
  Filter,
  Download,
  Upload,
  Play,
  Pause,
  MoreVertical
} from 'lucide-react';
import { apiService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import QuestionForm from '../components/QuestionForm';
import QuestionList from '../components/QuestionList';

const Games = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuestionsModalOpen, setIsQuestionsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState('all');

  const queryClient = useQueryClient();

  // Form hooks
  const createForm = useForm();
  const editForm = useForm();

  // Queries
  const { 
    data: gamesData, 
    isLoading: isLoadingGames, 
    error: gamesError 
  } = useQuery(
    ['games', { search: searchTerm, active: filterActive }],
    () => apiService.getGames({ 
      search: searchTerm || undefined,
      active: filterActive !== 'all' ? filterActive === 'active' : undefined
    }),
    {
      refetchOnWindowFocus: false,
      retry: 1
    }
  );

  // Mutations
  const createGameMutation = useMutation(
    (gameData) => apiService.createGame(gameData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['games']);
        toast.success('המשחק נוצר בהצלחה!');
        setIsCreateModalOpen(false);
        createForm.reset();
      },
      onError: (error) => {
        console.error('Error creating game:', error);
        toast.error(error.message || 'שגיאה ביצירת המשחק');
      }
    }
  );

  const updateGameMutation = useMutation(
    ({ id, data }) => apiService.updateGame(id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['games']);
        toast.success('המשחק עודכן בהצלחה!');
        setIsEditModalOpen(false);
        setSelectedGame(null);
      },
      onError: (error) => {
        console.error('Error updating game:', error);
        toast.error(error.message || 'שגיאה בעדכון המשחק');
      }
    }
  );

  const deleteGameMutation = useMutation(
    (gameId) => apiService.deleteGame(gameId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['games']);
        toast.success('המשחק נמחק בהצלחה!');
        setIsDeleteModalOpen(false);
        setSelectedGame(null);
      },
      onError: (error) => {
        console.error('Error deleting game:', error);
        toast.error(error.message || 'שגיאה במחיקת המשחק');
      }
    }
  );

  // Handlers
  const handleCreateGame = (data) => {
    createGameMutation.mutate(data);
  };

  const handleEditGame = (data) => {
    if (selectedGame) {
      updateGameMutation.mutate({ id: selectedGame._id, data });
    }
  };

  const handleDeleteGame = () => {
    if (selectedGame) {
      deleteGameMutation.mutate(selectedGame._id);
    }
  };

  const openEditModal = (game) => {
    setSelectedGame(game);
    editForm.reset({
      name: game.name,
      description: game.description,
      image: game.image || '',
      maxQuestions: game.maxQuestions || 10,
      passingScore: game.passingScore || 60,
      isActive: game.isActive
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (game) => {
    setSelectedGame(game);
    setIsDeleteModalOpen(true);
  };

  const openQuestionsModal = (game) => {
    setSelectedGame(game);
    setIsQuestionsModalOpen(true);
  };

  const games = gamesData?.data?.games || gamesData?.games || [];

  if (gamesError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">שגיאה בטעינת המשחקים</h3>
          <p className="text-red-600 text-sm mt-1">
            {gamesError.message || 'אירעה שגיאה בטעינת נתוני המשחקים'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" dir="rtl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">ניהול פעילויות לימוד</h1>
        <p className="text-gray-600">נהלו את פעילויות הלימוד, השאלות והגדרות הלימוד</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="חיפוש משחקים..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">כל המשחקים</option>
                <option value="active">פעילים</option>
                <option value="inactive">לא פעילים</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              משחק חדש
            </button>
          </div>
        </div>
      </div>

      {/* Games Grid */}
      {isLoadingGames ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game._id}
              game={game}
              onEdit={openEditModal}
              onDelete={openDeleteModal}
              onViewQuestions={openQuestionsModal}
            />
          ))}
          
          {games.length === 0 && (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 text-lg mb-2">אין משחקים להצגה</div>
              <p className="text-gray-500 text-sm">
                {searchTerm ? 'נסה לשנות את מונחי החיפוש' : 'צור משחק ראשון כדי להתחיל'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Create Game Modal */}
      {isCreateModalOpen && (
        <GameModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            createForm.reset();
          }}
          title="יצירת משחק חדש"
          form={createForm}
          onSubmit={handleCreateGame}
          isLoading={createGameMutation.isLoading}
        />
      )}

      {/* Edit Game Modal */}
      {isEditModalOpen && selectedGame && (
        <GameModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedGame(null);
          }}
          title="עריכת משחק"
          form={editForm}
          onSubmit={handleEditGame}
          isLoading={updateGameMutation.isLoading}
          isEdit={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedGame && (
        <DeleteModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedGame(null);
          }}
          onConfirm={handleDeleteGame}
          gameName={selectedGame.name}
          isLoading={deleteGameMutation.isLoading}
        />
      )}

      {/* Game Questions Modal */}
      {isQuestionsModalOpen && selectedGame && (
        <GameQuestionsModal
          isOpen={isQuestionsModalOpen}
          onClose={() => {
            setIsQuestionsModalOpen(false);
            setSelectedGame(null);
          }}
          game={selectedGame}
        />
      )}
    </div>
  );
};

// Game Card Component
const GameCard = ({ game, onEdit, onDelete, onViewQuestions }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Game Image */}
      <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-100 relative">
        {game.image ? (
          <img
            src={game.image}
            alt={game.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl text-blue-300">🎮</div>
          </div>
        )}
        
        {/* Status Badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            game.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {game.isActive ? 'פעיל' : 'לא פעיל'}
          </span>
        </div>

        {/* Action Menu */}
        <div className="absolute top-3 left-3">
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-32">
                <button
                  onClick={() => {
                    onEdit(game);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  עריכה
                </button>
                <button
                  onClick={() => {
                    onViewQuestions(game);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Settings className="w-4 h-4" />
                  שאלות
                </button>
                <button
                  onClick={() => {
                    onDelete(game);
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  מחיקה
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Game Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 mb-2">{game.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{game.description}</p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">שאלות:</span>
            <span className="font-medium mr-1">{game.totalQuestions || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">נוחק:</span>
            <span className="font-medium mr-1">{game.totalPlays || 0}</span>
          </div>
          <div>
            <span className="text-gray-500">ציון עובר:</span>
            <span className="font-medium mr-1">{game.passingScore || 60}%</span>
          </div>
          <div>
            <span className="text-gray-500">ממוצע:</span>
            <span className="font-medium mr-1">{game.averageScore || 0}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Modal Component
const GameModal = ({ isOpen, onClose, title, form, onSubmit, isLoading, isEdit = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-90vh overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">{title}</h2>
          
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Game Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שם המשחק *
              </label>
              <input
                type="text"
                {...form.register('name', { 
                  required: 'שם המשחק הוא שדה חובה',
                  minLength: { value: 2, message: 'שם המשחק חייב להיות לפחות 2 תווים' },
                  maxLength: { value: 100, message: 'שם המשחק לא יכול להיות יותר מ-100 תווים' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="הכנס שם למשחק"
              />
              {form.formState.errors.name && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                תיאור המשחק *
              </label>
              <textarea
                {...form.register('description', { 
                  required: 'תיאור המשחק הוא שדה חובה',
                  minLength: { value: 5, message: 'תיאור המשחק חייב להיות לפחות 5 תווים' },
                  maxLength: { value: 500, message: 'תיאור המשחק לא יכול להיות יותר מ-500 תווים' }
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="הכנס תיאור למשחק"
              />
              {form.formState.errors.description && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                כתובת תמונה
              </label>
              <input
                type="url"
                {...form.register('image')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {/* Max Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                מספר שאלות מקסימלי
              </label>
              <input
                type="number"
                {...form.register('maxQuestions', { 
                  min: { value: 1, message: 'מספר שאלות חייב להיות לפחות 1' },
                  max: { value: 1000, message: 'מספר שאלות לא יכול להיות יותר מ-1000' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="10"
                min="1"
                max="1000"
              />
              {form.formState.errors.maxQuestions && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.maxQuestions.message}</p>
              )}
            </div>

            {/* Passing Score */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ציון עובר (%)
              </label>
              <input
                type="number"
                {...form.register('passingScore', { 
                  min: { value: 0, message: 'ציון עובר חייב להיות לפחות 0' },
                  max: { value: 100, message: 'ציון עובר לא יכול להיות יותר מ-100' }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="60"
                min="0"
                max="100"
              />
              {form.formState.errors.passingScore && (
                <p className="text-red-600 text-sm mt-1">{form.formState.errors.passingScore.message}</p>
              )}
            </div>

            {/* Active Status (only for edit) */}
            {isEdit && (
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    {...form.register('isActive')}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">משחק פעיל</span>
                </label>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading && <LoadingSpinner size="sm" />}
                {isEdit ? 'עדכן משחק' : 'צור משחק'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300"
              >
                ביטול
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Delete Modal Component
const DeleteModal = ({ isOpen, onClose, onConfirm, gameName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">אישור מחיקה</h2>
          <p className="text-gray-600 mb-6">
            האם אתה בטוח שברצונך למחוק את המשחק <strong>"{gameName}"</strong>?
            <br />
            פעולה זו אינה הפיכה.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading && <LoadingSpinner size="sm" />}
              מחק משחק
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 disabled:opacity-50"
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Game Questions Modal Component
const GameQuestionsModal = ({ isOpen, onClose, game }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const queryClient = useQueryClient();

  // Questions Query
  const { 
    data: questionsData, 
    isLoading: isLoadingQuestions, 
    error: questionsError 
  } = useQuery(
    ['gameQuestions', game?.id, { search: searchTerm, page: currentPage }],
    () => apiService.getGameQuestions(game.id, {
      search: searchTerm || undefined,
      page: currentPage,
      limit: 20
    }),
    {
      enabled: !!game?.id && isOpen,
      refetchOnWindowFocus: false,
      keepPreviousData: true
    }
  );

  // Create Question Mutation
  const createQuestionMutation = useMutation(
    (questionData) => apiService.createGameQuestion(game.id, questionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['gameQuestions', game.id]);
        queryClient.invalidateQueries(['games']);
        setShowAddForm(false);
        toast.success('השאלה נוספה בהצלחה!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'שגיאה בהוספת השאלה');
      }
    }
  );

  // Update Question Mutation
  const updateQuestionMutation = useMutation(
    ({ questionId, questionData }) => 
      apiService.updateGameQuestion(game.id, questionId, questionData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['gameQuestions', game.id]);
        setEditingQuestion(null);
        toast.success('השאלה עודכנה בהצלחה!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'שגיאה בעדכון השאלה');
      }
    }
  );

  // Delete Question Mutation
  const deleteQuestionMutation = useMutation(
    (questionId) => apiService.deleteGameQuestion(game.id, questionId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['gameQuestions', game.id]);
        queryClient.invalidateQueries(['games']);
        toast.success('השאלה נמחקה בהצלחה!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'שגיאה במחיקת השאלה');
      }
    }
  );

  // Handlers
  const handleCreateQuestion = (questionData) => {
    createQuestionMutation.mutate(questionData);
  };

  const handleUpdateQuestion = (questionData) => {
    updateQuestionMutation.mutate({
      questionId: editingQuestion._id,
      questionData
    });
  };

  const handleDeleteQuestion = (questionId) => {
    deleteQuestionMutation.mutate(questionId);
  };

  const handleToggleQuestionStatus = (questionId, isActive) => {
    updateQuestionMutation.mutate({
      questionId,
      questionData: { isActive }
    });
  };

  const handleEditQuestion = (question) => {
    setEditingQuestion(question);
    setShowAddForm(false);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCloseModal = () => {
    setShowAddForm(false);
    setEditingQuestion(null);
    setSearchTerm('');
    setCurrentPage(1);
    onClose();
  };

  if (!isOpen) return null;

  const questions = questionsData?.data?.questions || [];
  const pagination = questionsData?.data?.pagination;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-90vh overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                ניהול שאלות: {game?.name}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {pagination?.totalQuestions || 0} שאלות סך הכל
              </p>
            </div>
            <div className="flex items-center gap-2">
              {!showAddForm && !editingQuestion && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} />
                  הוסף שאלה
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 p-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {showAddForm && (
            <div className="mb-6">
              <QuestionForm
                onSubmit={handleCreateQuestion}
                onCancel={() => setShowAddForm(false)}
                isLoading={createQuestionMutation.isLoading}
              />
            </div>
          )}

          {editingQuestion && (
            <div className="mb-6">
              <QuestionForm
                question={editingQuestion}
                onSubmit={handleUpdateQuestion}
                onCancel={() => setEditingQuestion(null)}
                isLoading={updateQuestionMutation.isLoading}
              />
            </div>
          )}

          {!showAddForm && !editingQuestion && (
            <QuestionList
              questions={questions}
              onEdit={handleEditQuestion}
              onDelete={handleDeleteQuestion}
              onToggleStatus={handleToggleQuestionStatus}
              isLoading={isLoadingQuestions}
              pagination={pagination}
              onPageChange={handlePageChange}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          )}

          {questionsError && (
            <div className="text-center py-12">
              <p className="text-red-500">
                שגיאה בטעינת השאלות: {questionsError.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Games;
