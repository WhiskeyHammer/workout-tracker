// AuthScreen component - Loaded as global
function AuthScreen({ onLogin, darkMode, setDarkMode }) {
    const { useState } = React;
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [forgotError, setForgotError] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetSuccess, setResetSuccess] = useState(false);
    
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
    
    const handleVerifyEmail = async (e) => {
        e.preventDefault();
        setForgotError('');
        setForgotLoading(true);
        
        try {
            const baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000/api'
                : '/api';
            
            const response = await fetch(`${baseUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Email not found');
            }
            
            setEmailVerified(true);
        } catch (err) {
            setForgotError(err.message);
        } finally {
            setForgotLoading(false);
        }
    };
    
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setForgotError('');
        
        if (!resetCode) {
            setForgotError('Please enter the reset code');
            return;
        }
        if (!newPassword || newPassword.length < 6) {
            setForgotError('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setForgotError('Passwords do not match');
            return;
        }
        
        setForgotLoading(true);
        
        try {
            const baseUrl = window.location.hostname === 'localhost' 
                ? 'http://localhost:3000/api'
                : '/api';
            
            const response = await fetch(`${baseUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: forgotEmail, 
                    code: resetCode, 
                    newPassword: newPassword 
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to reset password');
            }
            
            setResetSuccess(true);
        } catch (err) {
            setForgotError(err.message);
        } finally {
            setForgotLoading(false);
        }
    };
    
    const resetForgotState = () => {
        setShowForgotPassword(false);
        setForgotEmail('');
        setForgotError('');
        setEmailVerified(false);
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
        setResetSuccess(false);
    };
    
    if (showForgotPassword) {
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
                        <p className={`transition-colors ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Reset your password</p>
                    </div>
                    
                    {resetSuccess ? (
                        <div className="space-y-4">
                            <div className={`border px-4 py-3 rounded-lg text-sm ${darkMode ? 'bg-green-900/30 border-green-800 text-green-400' : 'bg-green-50 border-green-200 text-green-700'}`}>
                                Password reset successful! You can now log in.
                            </div>
                            <button
                                onClick={resetForgotState}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Back to Login
                            </button>
                        </div>
                    ) : !emailVerified ? (
                        <form onSubmit={handleVerifyEmail} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email Address</label>
                                <input
                                    type="email"
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                            
                            {forgotError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {forgotError}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {forgotLoading ? 'Checking...' : 'Continue'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Reset Code</label>
                                <input
                                    type="text"
                                    value={resetCode}
                                    onChange={(e) => setResetCode(e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors text-center text-2xl tracking-widest ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    placeholder="••••"
                                    maxLength="4"
                                    required
                                    autoFocus
                                />
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                            </div>
                            
                            <div>
                                <label className={`block text-sm font-medium mb-2 transition-colors ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Confirm Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'}`}
                                    placeholder="••••••••"
                                    required
                                    minLength="6"
                                />
                            </div>
                            
                            {forgotError && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                    {forgotError}
                                </div>
                            )}
                            
                            <button
                                type="submit"
                                disabled={forgotLoading}
                                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                            >
                                {forgotLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}
                    
                    {!resetSuccess && (
                        <div className="mt-6 text-center">
                            <button
                                onClick={resetForgotState}
                                className={`text-sm font-medium transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                ← Back to Login
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    
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
                    
                    {isLogin && (
                        <div className="text-right">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForgotPassword(true);
                                    setForgotEmail(email);
                                    setError('');
                                }}
                                className={`text-sm font-medium transition-colors ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}
                            >
                                Forgot password?
                            </button>
                        </div>
                    )}
                    
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