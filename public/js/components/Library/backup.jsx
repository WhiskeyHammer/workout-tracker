// WorkoutLibrary component - Loaded as global
function WorkoutLibrary({ onSelectWorkout, onCreateNew, onLogout }) {
    const { useState, useEffect } = React;
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editingWorkout, setEditingWorkout] = useState(null);
    const [editName, setEditName] = useState('');
    
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
    
    const deleteWorkout = async (id, name) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        
        try {
            const response = await api.call(`/workouts/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                setWorkouts(workouts.filter(w => w._id !== id));
            } else {
                alert('Failed to delete workout');
            }
        } catch (err) {
            alert('Error deleting workout');
        }
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
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">💪 My Workouts</h1>
                        <p className="text-sm text-gray-600">{userEmail}</p>
                    </div>
                    <button
                        onClick={onLogout}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            
            <div className="max-w-4xl mx-auto mb-6">
                <button
                    onClick={onCreateNew}
                    className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors font-medium text-lg"
                >
                    + Create New Workout
                </button>
            </div>
            
            <div className="max-w-4xl mx-auto">
                {loading ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Loading workouts...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                ) : workouts.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <p className="text-xl text-gray-600 mb-4">No workouts yet</p>
                        <p className="text-gray-500">Create your first workout to get started!</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {workouts.map(workout => (
                                <div
                                    key={workout._id}
                                    className="bg-white rounded-xl shadow-sm p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                                >
                                    <div className="flex-1">
                                        {editingWorkout === workout._id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={editName}
                                                    onChange={(e) => setEditName(e.target.value)}
                                                    className="flex-1 px-3 py-2 border-2 border-blue-500 rounded-lg text-lg font-bold focus:outline-none"
                                                    autoFocus
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveWorkoutName(workout._id);
                                                        if (e.key === 'Escape') cancelEditingName();
                                                    }}
                                                />
                                                <button
                                                    onClick={() => saveWorkoutName(workout._id)}
                                                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    onClick={cancelEditingName}
                                                    className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        ) : (
                                            <div
                                                className={editMode ? "cursor-pointer" : "cursor-pointer"}
                                                onClick={() => editMode ? startEditingName(workout) : onSelectWorkout(workout._id)}
                                            >
                                                <h3 className="text-lg font-bold text-gray-900">{workout.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Last updated: {formatDate(workout.updatedAt)}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    {editingWorkout !== workout._id && (
                                        <div className="flex items-center gap-2">
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
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                {editMode ? 'Done Editing' : 'Edit Workouts'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
