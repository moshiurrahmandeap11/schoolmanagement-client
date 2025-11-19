import { useEffect, useState } from 'react';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';


const WorkersList = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterDepartment, setFilterDepartment] = useState('');
    const [filterDesignation, setFilterDesignation] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchWorkers();
    }, []);

    const fetchWorkers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/workers-list');
            
            if (response.data.success) {
                setWorkers(response.data.data);
            } else {
                setError('Failed to load workers');
            }
        } catch (error) {
            console.error('Error fetching workers:', error);
            setError('Failed to load workers list');
        } finally {
            setLoading(false);
        }
    };

    // Filter workers based on search and filters
    const filteredWorkers = workers.filter(worker => {
        const matchesSearch = worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            worker.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            worker.department?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesDepartment = !filterDepartment || worker.department === filterDepartment;
        const matchesDesignation = !filterDesignation || worker.designation === filterDesignation;
        
        return matchesSearch && matchesDepartment && matchesDesignation;
    });

    // Get unique departments and designations for filters
    const departments = [...new Set(workers.map(worker => worker.department).filter(Boolean))];
    const designations = [...new Set(workers.map(worker => worker.designation).filter(Boolean))];

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
                            <p className="text-gray-600 text-lg">Loading workers...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Unable to Load Workers</h2>
                        <p className="text-red-500 mb-6">{error}</p>
                        <button
                            onClick={fetchWorkers}
                            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                        কর্মকর্তা ও কর্মচারীদের তালিকা
                    </h1>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{workers.length}</div>
                        <div className="text-sm text-gray-600">Total Workers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">
                            {workers.filter(w => w.isActive).length}
                        </div>
                        <div className="text-sm text-gray-600">Active Workers</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{departments.length}</div>
                        <div className="text-sm text-gray-600">Departments</div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
                        <div className="text-2xl font-bold text-[#1e90c9] mb-1">{designations.length}</div>
                        <div className="text-sm text-gray-600">Designations</div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search Input */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Workers
                            </label>
                            <input
                                type="text"
                                placeholder="Search by name, designation, or department..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            />
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Department
                            </label>
                            <select
                                value={filterDepartment}
                                onChange={(e) => setFilterDepartment(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        {/* Designation Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Filter by Designation
                            </label>
                            <select
                                value={filterDesignation}
                                onChange={(e) => setFilterDesignation(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                            >
                                <option value="">All Designations</option>
                                {designations.map(designation => (
                                    <option key={designation} value={designation}>{designation}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {filteredWorkers.length} of {workers.length} workers
                    </p>
                    {(searchTerm || filterDepartment || filterDesignation) && (
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setFilterDepartment('');
                                setFilterDesignation('');
                            }}
                            className="text-[#1e90c9] text-sm font-medium"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>

                {/* Workers Grid */}
                {filteredWorkers.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-6xl mb-4">👷</div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">No Workers Found</h3>
                        <p className="text-gray-600">
                            {searchTerm || filterDepartment || filterDesignation 
                                ? 'No workers match your search criteria.' 
                                : 'No workers available at the moment.'
                            }
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredWorkers.map((worker) => (
                            <div 
                                key={worker._id} 
                                className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {/* Worker Photo */}
                                <div className="relative h-48 bg-linear-to-br from-green-50 to-emerald-100">
                                    {worker.photo ? (
                                        <img
                                            src={`${baseImageURL}${worker.photo}`}
                                            alt={worker.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <div className="text-6xl text-green-300">
                                                👷
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Status Badge */}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                                        worker.isActive 
                                            ? 'bg-[#1e90c9] text-white' 
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {worker.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Worker Info */}
                                <div className="p-4">
                                    {/* Name and Designation */}
                                    <div className="mb-3">
                                        <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
                                            {worker.name}
                                        </h3>
                                        <p className="text-sm text-[#1e90c9] font-medium">
                                            {worker.designation}
                                        </p>
                                    </div>

                                    {/* Department and Work Details */}
                                    <div className="space-y-2 mb-4">
                                        {worker.department && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium mr-2">Department:</span>
                                                <span className="text-gray-800">{worker.department}</span>
                                            </div>
                                        )}
                                        {worker.workShift && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium mr-2">Shift:</span>
                                                <span className="text-gray-800">{worker.workShift}</span>
                                            </div>
                                        )}
                                        {worker.experience && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="font-medium mr-2">Experience:</span>
                                                <span className="text-gray-800">{worker.experience} years</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Info */}
                                    <div className="border-t border-gray-100 pt-3 space-y-2">
                                        {worker.mobile && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">📱</span>
                                                <span>{worker.mobile}</span>
                                            </div>
                                        )}
                                        {worker.email && (
                                            <div className="flex items-center text-sm text-gray-600">
                                                <span className="mr-2">✉️</span>
                                                <span className="truncate">{worker.email}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Responsibilities */}
                                    {worker.responsibilities && (
                                        <div className="mt-3 pt-3 border-t border-gray-100">
                                            <p className="text-xs text-gray-500 line-clamp-2">
                                                <span className="font-medium">Responsibilities:</span> {worker.responsibilities}
                                            </p>
                                        </div>
                                    )}

                                    {/* Additional Info */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {worker.gender && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
                                                {worker.gender}
                                            </span>
                                        )}
                                        {worker.bloodGroup && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                                {worker.bloodGroup}
                                            </span>
                                        )}
                                    </div>

                                    {/* Joining Date */}
                                    {worker.joiningDate && (
                                        <div className="mt-3 text-xs text-gray-500">
                                            Joined: {new Date(worker.joiningDate).toLocaleDateString()}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Friendly Cards (Alternative Layout) */}
                {filteredWorkers.length > 0 && (
                    <div className="lg:hidden mt-8">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Workers List</h3>
                        <div className="space-y-4">
                            {filteredWorkers.map((worker) => (
                                <div 
                                    key={worker._id} 
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
                                >
                                    <div className="flex items-start space-x-4">
                                        {/* Worker Avatar */}
                                        <div className="shrink-0">
                                            {worker.photo ? (
                                                <img
                                                    src={worker.photo}
                                                    alt={worker.name}
                                                    className="w-16 h-16 rounded-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-bold text-lg">
                                                        {worker.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Worker Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                                {worker.name}
                                            </h4>
                                            <p className="text-sm text-green-600 mb-1">
                                                {worker.designation}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-2">
                                                {worker.department && `${worker.department} • `}{worker.workShift}
                                            </p>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                {worker.mobile && <span>📱 {worker.mobile}</span>}
                                                <span className={`px-2 py-1 rounded-full text-xs ${
                                                    worker.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {worker.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .line-clamp-1 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 1;
                }
                .line-clamp-2 {
                    overflow: hidden;
                    display: -webkit-box;
                    -webkit-box-orient: vertical;
                    -webkit-line-clamp: 2;
                }
            `}</style>
        </div>
    );
};

export default WorkersList;