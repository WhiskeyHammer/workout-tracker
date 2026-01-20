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
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [infoModalContent, setInfoModalContent] = useState({ title: '', message: '' });
    
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
            setInfoModalContent({
                title: 'Error',
                message: 'Failed to load workout'
            });
            setShowInfoModal(true);
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
    
    const openDebugLogs = () => {
        if (window.showDebugLogs) {
            window.showDebugLogs();
        }
    };
    
    const saveWorkout = async () => {
        if (!workoutName.trim()) {
            setInfoModalContent({
                title: 'Invalid Name',
                message: 'Please enter a workout name'
            });
            setShowInfoModal(true);
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
            setInfoModalContent({
                title: 'Invalid Name',
                message: 'Please enter a workout name'
            });
            setShowInfoModal(true);
            return;
        }
        
        // VALIDATION: Check if exercises exist
        if (!exercises || exercises.length === 0) {
            setInfoModalContent({
                title: 'Cannot Complete Workout',
                message: 'No exercises to save. Please add exercises first.'
            });
            setShowInfoModal(true);
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
                    setInfoModalContent({
                        title: 'Error',
                        message: 'Failed to create workout template'
                    });
                    setShowInfoModal(true);
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
                setInfoModalContent({
                    title: 'Cannot Complete Workout',
                    message: 'No valid exercises to save.'
                });
                setShowInfoModal(true);
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
                        onClick={openDebugLogs}
                        className={`p-2 rounded-lg transition-colors flex-shrink-0 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                        title="View debug logs"
                    >
                        <svg className={`w-6 h-6 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                            <path d="M12 11h4"></path>
                            <path d="M12 16h4"></path>
                            <path d="M8 11h.01"></path>
                            <path d="M8 16h.01"></path>
                        </svg>
                    </button>
                    
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
                    initialEditMode={false}
                />
            )}
            {showInfoModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 pt-[15vh]">
                    <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            {infoModalContent.title}
                        </h2>
                        <p className={`mb-6 whitespace-pre-line transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {infoModalContent.message}
                        </p>
                        <button
                            onClick={() => setShowInfoModal(false)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}