// Main App component - Loaded as global
function App() {
    const { useState, useEffect } = React;
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [view, setView] = useState('library');
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);
    
    // Handle browser back/forward button navigation
    useEffect(() => {
        const handlePopState = (event) => {
            if (event.state) {
                setView(event.state.view || 'library');
                setSelectedWorkoutId(event.state.workoutId || null);
            } else {
                // No state, go back to library
                setView('library');
                setSelectedWorkoutId(null);
            }
        };
        
        // Set initial history state
        if (!window.history.state) {
            window.history.replaceState({ view: 'library', workoutId: null }, '', window.location.pathname);
        }
        
        window.addEventListener('popstate', handlePopState);
        
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);
    
    const handleLogin = (newToken) => {
        setToken(newToken);
    };
    
    const handleLogout = () => {
        setShowLogoutModal(true);
    };
    
    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
        setToken(null);
        setShowLogoutModal(false);
    };
    
    const cancelLogout = () => {
        setShowLogoutModal(false);
    };
    
    const handleSelectWorkout = (workoutId) => {
        setSelectedWorkoutId(workoutId);
        setView('tracker');
        // Push new history state when navigating to tracker
        window.history.pushState({ view: 'tracker', workoutId: workoutId }, '', window.location.pathname);
    };
    
    const handleCreateNew = (workoutId = null) => {
        setSelectedWorkoutId(workoutId);
        setView('tracker');
        // Push new history state when navigating to tracker
        window.history.pushState({ view: 'tracker', workoutId: workoutId }, '', window.location.pathname);
    };
    
    const handleBackToLibrary = () => {
        setView('library');
        setSelectedWorkoutId(null);
        // Go back in history instead of just updating state
        window.history.back();
    };
    
    if (!token) {
        return <AuthScreen onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;
    }
    
    if (view === 'library') {
        return (
            <>
                <WorkoutLibrary
                    onSelectWorkout={handleSelectWorkout}
                    onCreateNew={handleCreateNew}
                    onLogout={handleLogout}
                    darkMode={darkMode}
                    setDarkMode={setDarkMode}
                />
                
                {showLogoutModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                            <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                Logout?
                            </h2>
                            <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Any unsaved changes will be lost.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={cancelLogout}
                                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </>
        );
    }
    
    return (
        <>
            <WorkoutTrackerWithCloud
                workoutId={selectedWorkoutId}
                onBack={handleBackToLibrary}
            />
            
            {showLogoutModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className={`rounded-2xl p-6 max-w-md w-full shadow-2xl transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                        <h2 className={`text-xl font-bold mb-4 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                            Logout?
                        </h2>
                        <p className={`mb-6 transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Any unsaved changes will be lost.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={cancelLogout}
                                className={`flex-1 py-3 rounded-lg font-medium transition-colors ${darkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
