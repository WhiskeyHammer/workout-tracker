// WorkoutLibrary component - Loaded as global
function WorkoutLibrary({ onSelectWorkout, onCreateNew, onLogout, darkMode, setDarkMode }) {
    const { useState, useEffect } = React;
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [editName, setEditName] = useState('');
    const [showNewWorkoutModal, setShowNewWorkoutModal] = useState(false);
    const [newWorkoutName, setNewWorkoutName] = useState('');
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState(null);
    
    const userEmail = localStorage.getItem('userEmail');
    
    useEffect(() => {
        loadWorkouts();
    }, []);
    
    const loadWorkouts = async () => {
        setLoading(true);
        try {
            const response = await api.call('/workouts');
            if (response.ok) {
                const data = await response.json();
                setWorkouts(data);
            } else {
                setError('Failed to load workouts');
            }
        } catch (err) {
            setError('Error loading workouts');
        } finally {
            setLoading(false);
        }
    };
    
    const moveWorkout = async (workoutId, direction) => {
        try {
            const response = await api.call(`/workouts/${workoutId}/reorder`, {
                method: 'POST',
                body: JSON.stringify({ direction })
            });
            
            if (response.ok) {
                const data = await response.json();
                setWorkouts(data.workouts);
            } else {
                alert('Failed to reorder workout');
            }
        } catch (err) {
            alert('Error reordering workout');
        }
    };
    
    const deleteWorkout = async (id, name) => {
        setWorkoutToDelete({ id, name });
        setShowDeleteConfirmModal(true);
    };
    
    const confirmDelete = async () => {
        if (!workoutToDelete) return;
        
        try {
            const response = await api.call(`/workouts/${workoutToDelete.id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setWorkouts(workouts.filter(w => w._id !== workoutToDelete.id));
            } else {
                alert('Failed to delete workout');
            }
        } catch (err) {
            alert('Error deleting workout');
        } finally {
            setShowDeleteConfirmModal(false);
            setWorkoutToDelete(null);
        }
    };
    
    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setWorkoutToDelete(null);
    };

    const startEditingName = (workout) => {
        setEditingWorkout(workout._id);
        setEditName(workout.name);
    };

    const cancelEditingName = () => {
        setEditingWorkout(null);
        setEditName('');
    };

    const saveWorkoutName = async (id) => {
        if (!editName.trim()) {
            alert('Workout name cannot be empty');
            return;
        }

        try {
            const workout = workouts.find(w => w._id === id);
            const response = await api.call(`/workouts/${id}`, {
                method: 'PUT',
                body: JSON.stringify({
                    ...workout,
                    name: editName.trim()
                })
            });

            if (response.ok) {
                setWorkouts(workouts.map(w => 
                    w._id === id ? { ...w, name: editName.trim() } : w
                ));
                cancelEditingName();
            } else {
                alert('Failed to update workout name');
            }
        } catch (err) {
            alert('Error updating workout name');
        }
    };
    
    return (
        <div className={`min-h-screen p-4 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
            <div className="max-w-4xl mx-auto mb-6">
                <div className={`rounded-xl shadow-sm p-4 flex items-center justify-between transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <h1 className={`text-2xl font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>💪 My Workouts</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
                            title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                        >
                            {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-gray-700" />}
                        </button>
                        <button
                            onClick={onLogout}
                            className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            title={`Logout (${userEmail})`}
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={() => setShowNewWorkoutModal(true)}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                    + Create New Workout
                </button>
            </div>
            
            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className={`text-center py-12 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <p>Loading workouts...</p>
                    </div>
                ) : error ? (
                    <div className={`border px-4 py-3 rounded-lg ${darkMode ? 'bg-red-900/30 border-red-800 text-red-400' : 'bg-red-50 border-red-200 text-red-700'}`}>
                        {error}
                    </div>
                ) : workouts.length === 0 ? (
                    <div className={`rounded-xl shadow-sm p-12 text-center transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <p className={`text-xl mb-4 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>No workouts yet</p>
                        <p className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Create your first workout to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {workouts.map((workout, index) => (
                                <div
                                    key={workout._id}
                                    className={`rounded-xl shadow-sm p-4 flex items-center justify-between transition-all ${darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white hover:shadow-md'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        {editingWorkout === workout._id ? (
                                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 min-w-0 px-3 py-2 border-2 border-blue-500 rounded-lg text-lg font-bold focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveWorkoutName(workout._id);
                                                        if (e.key === 'Escape') cancelEditingName();
                                                    }}
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => saveWorkoutName(workout._id)}
                                                        className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelEditingName}
                                                        className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div
                                                className={editMode ? "cursor-pointer" : "cursor-pointer"}
                                                onClick={() => editMode ? startEditingName(workout) : onSelectWorkout(workout._id)}
                                            >
                                                <h3 className={`text-lg font-bold transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{workout.name}</h3>
                                                <p className={`text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Last updated: {formatDate(workout.updatedAt)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {editingWorkout !== workout._id && (
                                        <div className="flex items-center gap-2">
                                            {editMode && (
                                                <div className="flex flex-col gap-1">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveWorkout(workout._id, 'up');
                                                        }}
                                                        disabled={index === 0}
                                                        className={`p-1 rounded transition-colors ${
                                                            index === 0
                                                                ? 'opacity-30 cursor-not-allowed'
                                                                : darkMode
                                                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                        }`}
                                                        title="Move up"
                                                    >
                                                        <ChevronUp className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            moveWorkout(workout._id, 'down');
                                                        }}
                                                        disabled={index === workouts.length - 1}
                                                        className={`p-1 rounded transition-colors ${
                                                            index === workouts.length - 1
                                                                ? 'opacity-30 cursor-not-allowed'
                                                                : darkMode
                                                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                                        }`}
                                                        title="Move down"
                                                    >
                                                        <ChevronDown className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => onSelectWorkout(workout._id)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Start
                                            </button>
                                            {editMode && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteWorkout(workout._id, workout.name);
                                                    }}
                                                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="max-w-4xl mx-auto">
                            <button
                                onClick={() => setEditMode(!editMode)}
                                className={`w-full py-3 rounded-xl font-medium transition-colors ${
                                    editMode
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : darkMode
                                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {editMode ? 'Done Editing' : 'Edit Workouts'}
                            </button>
                        </div>
                    </>
                )}
                
                {/* Cache version display */}
                <div className="text-center mt-8 pb-4">
                    <p className={`text-xs transition-colors ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                        v5
                    </p>
                </div>
            </div>

            {showDeleteConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Delete Workout?
                        </h2>
                        <p className={`mb-2 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Are you sure you want to delete <span className={`font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>"{workoutToDelete?.name}"</span>?
                        </p>
                        <p className={`mb-6 text-sm transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelDelete}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showNewWorkoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Create New Workout
                        </h2>
                        <p className={`mb-4 text-sm transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Enter a name for your new workout
                        </p>
                        <input
                            type="text"
                            value={newWorkoutName}
                            onChange={(e) => setNewWorkoutName(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newWorkoutName.trim()) {
                                    handleCreateNewWorkout();
                                }
                                if (e.key === 'Escape') {
                                    setShowNewWorkoutModal(false);
                                    setNewWorkoutName('');
                                }
                            }}
                            placeholder="e.g., Upper Body Day"
                            className={`w-full px-4 py-3 border-2 rounded-lg text-lg focus:outline-none mb-6 transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'border-gray-300 text-gray-900 focus:border-blue-500'}`}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowNewWorkoutModal(false);
                                    setNewWorkoutName('');
                                }}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateNewWorkout}
                                disabled={!newWorkoutName.trim()}
                                className={`flex-1 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:cursor-not-allowed ${darkMode ? 'disabled:bg-gray-600' : 'disabled:bg-gray-300'}`}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    async function handleCreateNewWorkout() {
        if (!newWorkoutName.trim()) return;
        
        try {
            // Create the workout with the name
            const response = await api.call('/workouts', {
                method: 'POST',
                body: JSON.stringify({
                    name: newWorkoutName.trim(),
                    data: {
                        exercises: [],
                        nextWeights: {},
                        weightsSet: []
                    },
                    exerciseNotes: {}
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                setShowNewWorkoutModal(false);
                setNewWorkoutName('');
                // Navigate to the new workout
                onCreateNew(result.workout._id);
            } else {
                alert('Failed to create workout');
            }
        } catch (err) {
            alert('Error creating workout');
        }
    }
}
