// WorkoutTrackerWithCloud component - Loaded as global
function WorkoutTrackerWithCloud({ workoutId, onBack }) {
    const { useState, useEffect, useRef } = React;
    const [saveStatus, setSaveStatus] = useState('');
    const [workoutName, setWorkoutName] = useState('New Workout');
    const [currentWorkoutId, setCurrentWorkoutId] = useState(workoutId);
    const [exercises, setExercises] = useState([]);
    const [exerciseNotes, setExerciseNotes] = useState({});
    const [nextWeightValues, setNextWeightValues] = useState({});
    const [exercisesWithWeightSet, setExercisesWithWeightSet] = useState(new Set());
    const [darkMode, setDarkMode] = useState(true);
    const [autoImportData, setAutoImportData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const isInitialLoadRef = useRef(true);
    
    useEffect(() => {
        if (workoutId) {
            loadWorkout(workoutId);
        }
    }, [workoutId]);
    
    // Auto-save workout template when exercises, notes, or weights change
    useEffect(() => {
        // Only auto-save if NOT in initial load, we have exercises, and a workout ID
        if (!isInitialLoadRef.current && currentWorkoutId && exercises.length > 0) {
            const timeoutId = setTimeout(() => {
                saveWorkout();
            }, 1000); // Debounce saves by 1 second
            
            return () => clearTimeout(timeoutId);
        }
    }, [exercises, exerciseNotes, nextWeightValues, exercisesWithWeightSet]);
    
    const loadWorkout = async (id) => {
        setIsLoading(true);
        try {
            // First, get the workout template
            const workoutResponse = await api.call(`/workouts/${id}`);
            if (workoutResponse.ok) {
                const workout = await workoutResponse.json();
                setWorkoutName(workout.name);
                setCurrentWorkoutId(workout._id);
                
                // Check if the template has saved exercises (from previous editing/auto-save)
                const hasTemplateExercises = workout.data?.exercises?.length > 0;
                
                if (hasTemplateExercises) {
                    // Load the template data (in-progress or previously saved workout)
                    loadTemplateData(workout);
                } else {
                    // No template exercises, try to load the most recent completed session for auto-import
                    try {
                        const sessionResponse = await api.call(`/workout-sessions/workout/${id}/latest`);
                        if (sessionResponse.ok) {
                            const session = await sessionResponse.json();
                            
                            if (session.exercises && session.exercises.length > 0) {
                                // Pass session data to WorkoutTracker for auto-import
                                // Exercise notes from session will be shown as "imported" notes with copy button
                                setAutoImportData({
                                    exercises: session.exercises,
                                    nextWeights: session.nextWeights || {},
                                    weightsSet: session.weightsSet || []
                                });
                                // Don't set exerciseNotes here - let them start empty
                                // WorkoutTracker will display imported notes with "Copy from previous" button
                            }
                        }
                    } catch (sessionErr) {
                        // No session available, starting fresh
                    }
                }
            }
        } catch (err) {
            alert('Failed to load workout');
        } finally {
            // Loading complete - allow WorkoutTracker to render
            setIsLoading(false);
            // Mark initial load as complete to enable auto-save
            // Use setTimeout to ensure this happens after React processes the state updates
            setTimeout(() => {
                isInitialLoadRef.current = false;
            }, 100);
        }
    };
    
    const loadTemplateData = (workout) => {
        if (workout.data) {
            if (workout.data.exercises) {
                setExercises(workout.data.exercises);
            }
            if (workout.data.nextWeights) {
                setNextWeightValues(workout.data.nextWeights);
            }
            if (workout.data.weightsSet) {
                setExercisesWithWeightSet(new Set(workout.data.weightsSet));
            }
        }
        if (workout.exerciseNotes) {
            setExerciseNotes(workout.exerciseNotes);
        }
    };
    
    const saveWorkout = async () => {
        if (!workoutName.trim()) {
            alert('Please enter a workout name');
            return;
        }
        
        setSaveStatus('saving');
        
        try {
            const workoutData = {
                name: workoutName,
                data: {
                    exercises: exercises,
                    nextWeights: nextWeightValues,
                    weightsSet: Array.from(exercisesWithWeightSet)
                },
                exerciseNotes: exerciseNotes
            };
            
            let response;
            if (currentWorkoutId) {
                response = await api.call(`/workouts/${currentWorkoutId}`, {
                    method: 'PUT',
                    body: JSON.stringify(workoutData)
                });
            } else {
                response = await api.call('/workouts', {
                    method: 'POST',
                    body: JSON.stringify(workoutData)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    setCurrentWorkoutId(result.workout._id);
                }
            }
            
            if (response.ok) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus(''), 2000);
                return true;
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(''), 3000);
                return false;
            }
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
            return false;
        }
    };

    const handleComplete = async () => {
        if (!workoutName.trim()) {
            alert('Please enter a workout name');
            return;
        }
        
        // VALIDATION: Check if exercises exist
        if (!exercises || exercises.length === 0) {
            alert('Cannot complete workout: No exercises to save. Please add exercises first.');
            return;
        }
        
        setSaveStatus('saving');
        
        try {
            // Ensure we have a workoutId (create workout template if needed)
            let workoutIdToUse = currentWorkoutId;
            
            if (!workoutIdToUse) {
                const workoutData = {
                    name: workoutName,
                    data: {
                        exercises: [],
                        nextWeights: {},
                        weightsSet: []
                    },
                    exerciseNotes: {}
                };
                
                const createResponse = await api.call('/workouts', {
                    method: 'POST',
                    body: JSON.stringify(workoutData)
                });
                
                if (createResponse.ok) {
                    const result = await createResponse.json();
                    workoutIdToUse = result.workout._id;
                    setCurrentWorkoutId(workoutIdToUse);
                } else {
                    alert('Failed to create workout template');
                    setSaveStatus('');
                    return;
                }
            }
            
            // USE EXPORT LOGIC: Group exercises by name for proper formatting
            const grouped = {};
            exercises.forEach((ex) => {
                const exerciseName = ex.exercise || ex.name || 'Exercise';
                if (!grouped[exerciseName]) {
                    grouped[exerciseName] = {
                        exercise: exerciseName,
                        exerciseNotes: exerciseNotes[exerciseName] || '',
                        sets: []
                    };
                }
                // Remove exercise/name from set data to avoid duplication
                const { exercise, name, ...setData } = ex;
                grouped[exerciseName].sets.push(setData);
            });
            
            const exercisesArray = Object.values(grouped);
            
            // ADDITIONAL VALIDATION: Verify we have valid exercise data
            if (exercisesArray.length === 0) {
                alert('Cannot complete workout: No valid exercises to save.');
                setSaveStatus('');
                return;
            }
            
            // CREATE EXPORT DATA using the export function logic
            const completedSessionData = {
                exercises: exercisesArray,
                nextWeights: nextWeightValues,
                weightsSet: Array.from(exercisesWithWeightSet),
                completedAt: new Date().toISOString()
            };
            
            // PREPARE SESSION DATA for MongoDB - Create new session (historical record)
            const sessionData = {
                workoutId: workoutIdToUse,
                workoutName: workoutName,
                exercises: exercisesArray,
                nextWeights: nextWeightValues,
                weightsSet: Array.from(exercisesWithWeightSet),
                exerciseNotes: exerciseNotes,
                completedAt: completedSessionData.completedAt
            };
            
            // SAVE NEW SESSION TO MONGODB (creates historical record)
            const response = await api.call('/workout-sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Clear the template exercises after completing workout
                // This ensures next time we load, we import from the completed session
                const clearTemplateResponse = await api.call(`/workouts/${workoutIdToUse}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        name: workoutName,
                        data: {
                            exercises: [],
                            nextWeights: {},
                            weightsSet: []
                        },
                        exerciseNotes: {}
                    })
                });
                
                setSaveStatus('saved');
                setTimeout(() => {
                    setSaveStatus('');
                    onBack();
                }, 1000);
            } else {
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (error) {
            setSaveStatus('error');
            setTimeout(() => setSaveStatus(''), 3000);
        }
    };

    const handleBackClick = () => {
        onBack();
    };
    
    return (
        <div>
            <div className={`border-b shadow-sm transition-colors ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="w-full px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={handleBackClick}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Back to library"
                    >
                        <ArrowLeft className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`} />
                    </button>
                    
                    <h1 className={`text-xl font-bold min-w-0 flex-1 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {workoutName}
                    </h1>
                    
                    {saveStatus === 'saving' && (
                        <span className="text-sm text-blue-600 flex-shrink-0">Saving...</span>
                    )}
                    {saveStatus === 'saved' && (
                        <span className="zz_sync_success text-sm text-green-600 flex-shrink-0">✓ Saved!</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-sm text-red-600 flex-shrink-0">Error</span>
                    )}
                    
                    <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="Toggle dark mode"
                    >
                        {darkMode ? (
                            <Sun className="w-6 h-6 text-gray-200" />
                        ) : (
                            <Moon className="w-6 h-6 text-gray-900" />
                        )}
                    </button>
                </div>
            </div>
            
            {isLoading ? (
                <div className={`flex items-center justify-center min-h-screen transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-solid border-blue-600 border-r-transparent mb-4"></div>
                        <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading workout...</p>
                    </div>
                </div>
            ) : (
                <WorkoutTracker
                    exercises={exercises}
                    setExercises={setExercises}
                    exerciseNotes={exerciseNotes}
                    setExerciseNotes={setExerciseNotes}
                    nextWeightValues={nextWeightValues}
                    setNextWeightValues={setNextWeightValues}
                    exercisesWithWeightSet={exercisesWithWeightSet}
                    setExercisesWithWeightSet={setExercisesWithWeightSet}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                    hideFileUpload={true}
                    onComplete={handleComplete}
                    autoImportData={autoImportData}
                />
            )}
        </div>
    );
}
