// Main App component - Loaded as global
function App() {
    const { useState, useEffect } = React;
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [view, setView] = useState('library');
    const [selectedWorkoutId, setSelectedWorkoutId] = useState(null);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved !== null ? JSON.parse(saved) : true;
    });
    
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
    }, [darkMode]);
    
    const handleLogin = (newToken) => {
        setToken(newToken);
    };
    
    const handleLogout = () => {
        if (confirm('Logout? Any unsaved changes will be lost.')) {
            localStorage.removeItem('token');
            localStorage.removeItem('userEmail');
            setToken(null);
        }
    };
    
    const handleSelectWorkout = (workoutId) => {
        setSelectedWorkoutId(workoutId);
        setView('tracker');
    };
    
    const handleCreateNew = (workoutId = null) => {
        setSelectedWorkoutId(workoutId);
        setView('tracker');
    };
    
    const handleBackToLibrary = () => {
        setView('library');
        setSelectedWorkoutId(null);
    };
    
    if (!token) {
        return <AuthScreen onLogin={handleLogin} darkMode={darkMode} setDarkMode={setDarkMode} />;
    }
    
    if (view === 'library') {
        return (
            <WorkoutLibrary
                onSelectWorkout={handleSelectWorkout}
                onCreateNew={handleCreateNew}
                onLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
            />
        );
    }
    
    return (
        <WorkoutTrackerWithCloud
            workoutId={selectedWorkoutId}
            onBack={handleBackToLibrary}
        />
    );
}
