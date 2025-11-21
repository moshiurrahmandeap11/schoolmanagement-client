import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';
import AddNewJobs from './AddNewJobs/AddNewJobs';


const InstituteJobs = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);

    // Fetch jobs
    const fetchJobs = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/institute-jobs');
            if (response.data && response.data.success) {
                setJobs(response.data.data || []);
            } else {
                setError('জবস ডেটা লোড করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('জবস ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching jobs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    // Handle delete job
    const handleDeleteJob = async (id) => {
        if (!window.confirm('আপনি কি এই চাকুরী ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/institute-jobs/${id}`);
            if (response.data && response.data.success) {
                fetchJobs(); // Refresh list
            } else {
                setError('চাকুরী ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('চাকুরী ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting job:', err);
        }
    };

    // Handle edit job
    const handleEditJob = (job) => {
        setEditingJob(job);
        setShowAddForm(true);
    };

    // Handle toggle status
    const handleToggleStatus = async (id) => {
        try {
            const response = await axiosInstance.patch(`/institute-jobs/${id}/toggle-status`);
            if (response.data && response.data.success) {
                fetchJobs();
            } else {
                setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            setError('স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে');
            console.error('Error toggling status:', err);
        }
    };

    // Handle form close
    const handleFormClose = () => {
        setShowAddForm(false);
        setEditingJob(null);
        fetchJobs(); // Refresh list
    };

    // Format date in Bengali
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Truncate description for table view
    const truncateDescription = (description) => {
        const strippedText = description.replace(/<[^>]*>/g, '');
        return strippedText.length > 100 
            ? strippedText.substring(0, 100) + '...' 
            : strippedText;
    };

    // যদি ফর্ম শো করতে হয়
    if (showAddForm) {
        return (
            <AddNewJobs 
                job={editingJob}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-2xl font-bold ">
                                ইনস্টিটিউট চাকুরী
                            </h1>
                        </div>
                        <MainButton
                            onClick={() => setShowAddForm(true)}
                        >
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            <span>নতুন চাকুরী</span>
                        </MainButton>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {error && (
                            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : jobs.length === 0 ? (
                            <div className="text-center py-12">
                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">কোন চাকুরী নেই</h3>
                                <p className="text-gray-500 mb-4">এখনও কোন চাকুরী যোগ করা হয়নি</p>
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    প্রথম চাকুরী যোগ করুন
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                শিরোনাম
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                বিবরণ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                আবেদনের শেষ তারিখ
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                সংযোজন
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                অবস্থা
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                কাজ
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {jobs.map((job) => (
                                            <tr key={job._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {job.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-xs">
                                                        {truncateDescription(job.description)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {formatDate(job.applicationDeadline)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {job.attachment ? (
                                                        <a 
                                                            href={`${axiosInstance.defaults.baseURL}${job.attachment}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:text-blue-900 text-sm flex items-center space-x-1"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                            </svg>
                                                            <span>ফাইল</span>
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">নেই</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span 
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                            job.status === 'published' 
                                                                ? 'bg-[#1e90c9] text-white' 
                                                                : 'bg-yellow-100 text-yellow-800'
                                                        }`}
                                                        onClick={() => handleToggleStatus(job._id)}
                                                        title="স্ট্যাটাস পরিবর্তন করতে ক্লিক করুন"
                                                    >
                                                        {job.status === 'published' ? 'প্রকাশিত' : 'খসড়া'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => handleEditJob(job)}
                                                            className="text-blue-600 hover:text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                                                        >
                                                            এডিট
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteJob(job._id)}
                                                            className="text-red-600 hover:text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded"
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
                        )}

                        {/* Summary */}
                        {jobs.length > 0 && (
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">{jobs.length}</div>
                                        <div className="text-gray-600">মোট চাকুরী</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {jobs.filter(job => job.status === 'published').length}
                                        </div>
                                        <div className="text-gray-600">প্রকাশিত</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {jobs.filter(job => job.status === 'draft').length}
                                        </div>
                                        <div className="text-gray-600">খসড়া</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-[#1e90c9]">
                                            {jobs.filter(job => new Date(job.applicationDeadline) > new Date()).length}
                                        </div>
                                        <div className="text-gray-600">সক্রিয়</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstituteJobs;