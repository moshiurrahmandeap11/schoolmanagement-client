import { useState } from 'react';
import { FaExclamationTriangle, FaPlay, FaPowerOff, FaTools } from 'react-icons/fa';
import Swal from 'sweetalert2';
import { useWebsiteStatus } from '../ClassRoomsClient/WebsiteStatusContext/WebsiteStatusContext';

const MoshiurLogin = () => {
    const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
    const [maintenanceMessage, setMaintenanceMessage] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    
    const { 
        websiteStatus, 
        shutdownWebsite, 
        restartWebsite,
        maintenanceMessage: currentMessage 
    } = useWebsiteStatus();

    const handleMaintenanceMode = async () => {
        if (!maintenanceMessage.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'মেসেজ প্রয়োজন',
                text: 'দয়া করে রক্ষণাবেক্ষণ মেসেজ লিখুন',
                confirmButtonColor: '#1e90c9'
            });
            return;
        }

        setActionLoading(true);
        
        const result = await shutdownWebsite(maintenanceMessage);
        
        setActionLoading(false);
        
        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'সফল!',
                text: result.message,
                confirmButtonColor: '#1e90c9'
            });
            setShowMaintenanceModal(false);
            setMaintenanceMessage('');
            
            // /shutdown এ রিডাইরেক্ট করবে
            window.location.href = '/shutdown';
        } else {
            Swal.fire({
                icon: 'error',
                title: 'ত্রুটি!',
                text: result.message,
                confirmButtonColor: '#1e90c9'
            });
        }
    };

    const handleRestartWebsite = async () => {
        const { value: confirm } = await Swal.fire({
            title: 'ওয়েবসাইট চালু করুন',
            text: 'আপনি কি নিশ্চিত যে ওয়েবসাইট আবার চালু করতে চান?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#1e90c9',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ, চালু করুন',
            cancelButtonText: 'না, বাতিল করুন'
        });

        if (confirm) {
            setActionLoading(true);
            const result = await restartWebsite();
            setActionLoading(false);

            if (result.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'সফল!',
                    text: result.message,
                    confirmButtonColor: '#1e90c9'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'ত্রুটি!',
                    text: result.message,
                    confirmButtonColor: '#1e90c9'
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">🔧</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            মশিউর কন্ট্রোল প্যানেল
                        </h1>
                        <p className="text-gray-600">
                            ওয়েবসাইট ম্যানেজমেন্ট টুলস
                        </p>
                    </div>

                    {/* Current Status */}
                    <div className={`p-4 rounded-lg mb-6 ${
                        websiteStatus === 'running' 
                            ? 'bg-green-50 border border-green-200' 
                            : 'bg-red-50 border border-red-200'
                    }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    websiteStatus === 'running' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <span className="font-medium text-gray-800">
                                    বর্তমান স্ট্যাটাস: 
                                    <span className={`ml-2 ${
                                        websiteStatus === 'running' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {websiteStatus === 'running' ? 'চালু' : 'বন্ধ'}
                                    </span>
                                </span>
                            </div>
                            {websiteStatus === 'shutdown' && (
                                <button
                                    onClick={handleRestartWebsite}
                                    disabled={actionLoading}
                                    className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50"
                                >
                                    <FaPlay className="text-xs" />
                                    {actionLoading ? 'লোডিং...' : 'চালু করুন'}
                                </button>
                            )}
                        </div>
                        
                        {websiteStatus === 'shutdown' && currentMessage && (
                            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                    <p className="text-sm text-yellow-800">{currentMessage}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Maintenance Mode Button */}
                    <button
                        onClick={() => setShowMaintenanceModal(true)}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold mb-4"
                    >
                        <FaTools />
                        ওয়েবসাইট মেইনটেনেন্স মোড
                    </button>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => window.location.href = '/super/dashboard'}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            <FaPowerOff />
                            অ্যাডমিন ড্যাশবোর্ড
                        </button>
                        <button
                            onClick={() => window.location.href = '/'}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        >
                            হোম পেজ
                        </button>
                    </div>
                </div>

                {/* Maintenance Modal */}
                {showMaintenanceModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <FaTools className="text-orange-500" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">
                                    মেইনটেনেন্স মোড
                                </h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        রক্ষণাবেক্ষণ মেসেজ *
                                    </label>
                                    <textarea
                                        value={maintenanceMessage}
                                        onChange={(e) => setMaintenanceMessage(e.target.value)}
                                        placeholder="ব্যবহারকারীদের জন্য মেসেজ লিখুন..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                                        rows="4"
                                    />
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <div className="flex items-start gap-2">
                                        <FaExclamationTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm text-yellow-800 font-medium mb-1">
                                                সতর্কতা
                                            </p>
                                            <p className="text-xs text-yellow-700">
                                                এটি ওয়েবসাইট বন্ধ করে দিবে এবং সকল ব্যবহারকারীকে শাটডাউন পেজ দেখাবে।
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleMaintenanceMode}
                                    disabled={actionLoading || !maintenanceMessage.trim()}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {actionLoading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            প্রসেসিং...
                                        </>
                                    ) : (
                                        <>
                                            <FaPowerOff />
                                            শাটডাউন করুন
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowMaintenanceModal(false);
                                        setMaintenanceMessage('');
                                    }}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    বাতিল
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MoshiurLogin;