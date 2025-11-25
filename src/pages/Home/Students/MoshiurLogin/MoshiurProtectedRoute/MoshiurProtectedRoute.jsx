import { useState } from 'react';
import { FaEye, FaEyeSlash, FaLock, FaUser } from 'react-icons/fa';
import Swal from 'sweetalert2';

const MoshiurProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [credentials, setCredentials] = useState({
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // হার্ড কোডেড ক্রেডেনশিয়াল
    const CORRECT_USERNAME = 'rah4tv4u@gmail.com';
    const CORRECT_PASSWORD = 'rafuMBBS';

    const handleLogin = async (e) => {
        e.preventDefault();
        
        if (!credentials.username || !credentials.password) {
            Swal.fire({
                icon: 'warning',
                title: 'অনুগ্রহ করে পূরণ করুন',
                text: 'ইউজারনেম এবং পাসওয়ার্ড দিন',
                confirmButtonColor: '#1e90c9'
            });
            return;
        }

        setLoading(true);

        // সরাসরি ভেরিফিকেশন - কোনো API কল নেই
        setTimeout(() => {
            if (credentials.username === CORRECT_USERNAME && 
                credentials.password === CORRECT_PASSWORD) {
                
                setIsAuthenticated(true);
                Swal.fire({
                    icon: 'success',
                    title: 'লগিন সফল!',
                    text: 'মশিউর অ্যাডমিন প্যানেলে স্বাগতম',
                    confirmButtonColor: '#1e90c9'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'লগিন ব্যর্থ!',
                    text: 'ভুল ইউজারনেম বা পাসওয়ার্ড',
                    confirmButtonColor: '#1e90c9'
                });
                setCredentials({
                    username: '',
                    password: ''
                });
            }
            setLoading(false);
        }, 1000);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCredentials({
            username: '',
            password: ''
        });
        Swal.fire({
            icon: 'info',
            title: 'লগআউট সফল!',
            text: 'আপনি সফলভাবে লগআউট হয়েছেন',
            confirmButtonColor: '#1e90c9'
        });
    };

    // যদি অথেনটিকেটেড না হয়, লগিন ফর্ম দেখাবে
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-8">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FaLock className="text-2xl text-blue-600" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                                মশিউর প্রটেক্টেড এক্সেস
                            </h1>
                            <p className="text-gray-600">
                                শুধুমাত্র অথোরাইজড ইউজারের জন্য
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-6">
                            {/* ইউজারনেম ফিল্ড */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ইউজারনেম *
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={credentials.username}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            username: e.target.value
                                        }))}
                                        placeholder="moshiur@admin.jsx"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                                </div>
                            </div>

                            {/* পাসওয়ার্ড ফিল্ড */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    পাসওয়ার্ড *
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={credentials.password}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            password: e.target.value
                                        }))}
                                        placeholder="admin123"
                                        className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                    />
                                    <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                                    </button>
                                </div>
                            </div>

                            {/* লগিন বাটন */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        লগিন হচ্ছে...
                                    </>
                                ) : (
                                    <>
                                        <FaLock className="text-sm" />
                                        লগিন করুন
                                    </>
                                )}
                            </button>
                        </form>

                        {/* হিন্ট */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                                ক্রেডেনশিয়াল হিন্ট:
                            </h3>
                            <div className="text-xs text-gray-600 space-y-1">
                                <p>ইউজারনেম: <span className="font-mono">moshiur@admin.jsx</span></p>
                                <p>পাসওয়ার্ড: <span className="font-mono">admin123</span></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // যদি অথেনটিকেটেড হয়, চিলড্রেন দেখাবে + লগআউট বাটন
    return (
        <div className="relative">
            {/* লগআউট বাটন */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
                >
                    <FaLock className="text-sm" />
                    লগআউট
                </button>
            </div>

            {/* মূল কন্টেন্ট */}
            {children}
        </div>
    );
};

export default MoshiurProtectedRoute;