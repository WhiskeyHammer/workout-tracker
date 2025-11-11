// AuthScreen component - Loaded as global
function AuthScreen({ onLogin, darkMode, setDarkMode }) {
    const { useState } = React;
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const endpoint = isLogin ? '/auth/login' : '/auth/register';
            const response = await api.call(endpoint, {
                method: 'POST',
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }
            
            localStorage.setItem('token', data.token);
            localStorage.setItem('userEmail', data.user.email);
            onLogin(data.token);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className={`min-h-screen flex items-center justify-center p-4 transition-colors ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-blue-500 to-purple-600'}`}>
            <div className={`rounded-2xl shadow-2xl p-8 max-w-md w-full transition-colors ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-white/20 hover:bg-white/30'}`}
                >
                    {darkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-white" />}
                </button>
                <div className="text-center mb-8">
                    <h1 className={`text-3xl font-bold mb-2 transition-colors ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>💪 Workout Tracker</h1>
                    <p className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Track your progress in the cloud</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                            placeholder="you@example.com"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                            placeholder="••••••••"
                            required
                            minLength="6"
                        />
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                    
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                    >
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>
                
                <div className="mt-6 text-center">
                    <button
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError('');
                        }}
                        className={`text-sm font-medium transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                    >
                        {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
                    </button>
                </div>
            </div>
        </div>
    );
}
