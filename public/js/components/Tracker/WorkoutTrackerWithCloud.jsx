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
        try {
            // First, get the workout template
            const workoutResponse = await api.call(`/workouts/${id}`);
            if (workoutResponse.ok) {
                const workout = await workoutResponse.json();
                setWorkoutName(workout.name);
                setCurrentWorkoutId(workout._id);
                
                console.log('=== LOADED WORKOUT TEMPLATE ===');
                console.log('Workout name:', workout.name);
                console.log('Template has exercises:', workout.data?.exercises?.length || 0);
                
                // Check if the template has saved exercises (from previous editing/auto-save)
                const hasTemplateExercises = workout.data?.exercises?.length > 0;
                
                if (hasTemplateExercises) {
                    // Load the template data (in-progress or previously saved workout)
                    console.log('✅ Loading saved exercises from template');
                    loadTemplateData(workout);
                } else {
                    // No template exercises, try to load the most recent completed session for auto-import
                    try {
                        const sessionResponse = await api.call(`/workout-sessions/workout/${id}/latest`);
                        if (sessionResponse.ok) {
                            const session = await sessionResponse.json();
                            console.log('=== LOADED LATEST SESSION ===');
                            console.log('Session date:', session.completedAt);
                            console.log('Number of exercise groups:', session.exercises?.length);
                            
                            if (session.exercises && session.exercises.length > 0) {
                                console.log('✅ Setting autoImportData from latest session');
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
                        } else {
                            console.log('No previous session found, starting fresh');
                        }
                    } catch (sessionErr) {
                        console.log('No session available, starting fresh');
                    }
                }
            }
        } catch (err) {
            console.error('Error loading workout:', err);
            alert('Failed to load workout');
        } finally {
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
            console.error('Save error:', error);
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
                console.log('No workoutId found, creating workout template first...');
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
                    console.log('✅ Workout template created:', workoutIdToUse);
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
            
            // LOG TO CONSOLE for comparison
            console.log('=== EXPORT DATA (FORMATTED FOR SAVE) ===');
            console.log(JSON.stringify(completedSessionData, null, 2));
            console.log('=== SUMMARY ===');
            console.log('Number of exercise groups:', exercisesArray.length);
            console.log('Exercise details:');
            exercisesArray.forEach((group, idx) => {
                console.log(`  ${idx + 1}. ${group.exercise} - ${group.sets.length} sets, notes: "${group.exerciseNotes}"`);
            });
            console.log('Next weights:', nextWeightValues);
            console.log('Weights set for:', Array.from(exercisesWithWeightSet));
            
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
            
            console.log('=== SESSION DATA TO SAVE ===');
            console.log('workoutId:', workoutIdToUse);
            console.log('workoutName:', workoutName);
            console.log('Number of exercises:', exercisesArray.length);
            
            // SAVE NEW SESSION TO MONGODB (creates historical record)
            const response = await api.call('/workout-sessions', {
                method: 'POST',
                body: JSON.stringify(sessionData)
            });
            
            if (response.ok) {
                const result = await response.json();
                console.log('✅ Workout session successfully saved to MongoDB');
                console.log('Session ID:', result.session._id);
                
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
                
                if (clearTemplateResponse.ok) {
                    console.log('✅ Template cleared for next workout');
                }
                
                setSaveStatus('saved');
                setTimeout(() => {
                    setSaveStatus('');
                    onBack();
                }, 1000);
            } else {
                console.error('❌ Failed to save workout session to MongoDB');
                const errorData = await response.json();
                console.error('Error details:', errorData);
                setSaveStatus('error');
                setTimeout(() => setSaveStatus(''), 3000);
            }
        } catch (error) {
            console.error('❌ Save error:', error);
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
                        <span className="text-sm text-green-600 flex-shrink-0">✓ Saved!</span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="text-sm text-red-600 flex-shrink-0">Error</span>
                    )}
                </div>
            </div>
            
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
        </div>
    );
}
