import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import AddNewTeacherShift from './AddNewTeacherShift/AddNewTeacherShift';


const TeacherShift = () => {
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // Fetch teacher shifts
    const fetchShifts = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/teacher-list');
            
            if (response.data && response.data.success) {
                // Filter teachers who have shift data
                const teachersWithShifts = response.data.data.filter(teacher => 
                    teacher.shiftName || teacher.teacherEntryTime || teacher.teacherExitTime
                );
                setShifts(teachersWithShifts);
            } else {
                setShifts([]);
            }
        } catch (err) {
            setError('শিফট ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching shifts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // Handle delete shift
    const handleDelete = async (teacherId) => {
        if (!window.confirm('আপনি কি এই শিক্ষকের শিফট ডিলিট করতে চান?')) {
            return;
        }

        try {
            setLoading(true);
            // Remove shift data from teacher
            await axiosInstance.put(`/teacher-list/${teacherId}`, {
                shiftName: '',
                teacherEntryTime: '',
                teacherExitTime: '',
                countLateAfter: '',
                countEarlyExitBefore: '',
                sendSms: false,
                smsType: '',
                absentAfter: ''
            });
            setError('');
            fetchShifts(); // Refresh list
        } catch (err) {
            setError('শিফট ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting shift:', err);
        } finally {
            setLoading(false);
        }
    };

    // Handle edit shift
    const handleEdit = (teacher) => {
        // For now, we'll just show an alert. You can implement a proper edit form
        alert(`এডিট করা হবে: ${teacher.shiftName || 'No Shift Name'}`);
        // You can implement edit functionality here
    };

    if (showAddForm) {
        return (
            <AddNewTeacherShift 
                onBack={() => setShowAddForm(false)}
                onSuccess={() => {
                    setShowAddForm(false);
                    fetchShifts();
                }}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-white">
                            শিক্ষক শিফট
                        </h1>
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                        >
                            New Teacher Shift
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                <span className="ml-2 text-gray-600">লোড হচ্ছে...</span>
                            </div>
                        ) : shifts.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Shift Name
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিক্ষকবৃন্দ
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Entry Time
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Exit Time
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Late Count
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Early Exit Count
                                            </th>
                                            <th className="px-4 py-3 border-b border-gray-200 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                এডিট / ডিলিট
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {shifts.map((teacher, index) => (
                                            <tr key={teacher._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.shiftName || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.name} - {teacher.designation}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.teacherEntryTime || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.teacherExitTime || 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.countLateAfter ? `${teacher.countLateAfter} মিনিট` : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    {teacher.countEarlyExitBefore ? `${teacher.countEarlyExitBefore} মিনিট` : 'N/A'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(teacher)}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(teacher._id)}
                                                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-xs"
                                                        >
                                                            ডিলিট
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-gray-200 rounded-lg">
                                <p className="text-gray-500">কোন শিক্ষক শিফট পাওয়া যায়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
                                >
                                    প্রথম শিফট যোগ করুন
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherShift;