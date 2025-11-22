import { useEffect, useState } from 'react';
import { FaArrowLeft, FaCheckSquare, FaSquare } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../sharedItems/Mainbutton/Mainbutton';

const StudentsClassUpdate = ({ onBack }) => {
    const [formData, setFormData] = useState({
        currentClass: '',
        batch: '',
        section: '',
        activeSession: '',
        monthlyFeeFrom: '',
        sendAttendanceSMS: false,
        migrateTo: '',
        nextSession: '',
        nextClass: '',
        nextBatch: '',
        nextSection: ''
    });

    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    // Dropdowns
    const [classes, setClasses] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sections, setSections] = useState([]);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    // Fetch all required data
    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [studentsRes, classesRes, batchesRes, sectionsRes, sessionsRes] = await Promise.all([
                axiosInstance.get('/students'),
                axiosInstance.get('/class'),
                axiosInstance.get('/batches'),
                axiosInstance.get('/sections'),
                axiosInstance.get('/sessions')
            ]);

            if (studentsRes.data.success) setStudents(studentsRes.data.data || []);
            if (classesRes.data.success) setClasses(classesRes.data.data || []);
            if (batchesRes.data.success) setBatches(batchesRes.data.data || []);
            if (sectionsRes.data.success) setSections(sectionsRes.data.data || []);
            if (sessionsRes.data.success) setSessions(sessionsRes.data.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            Swal.fire('Error', 'ডাটা লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Real-time filtering whenever any dropdown changes
    useEffect(() => {
        let filtered = students;

        if (formData.currentClass) {
            filtered = filtered.filter(s => 
                (s.classId?._id || s.classId) === formData.currentClass
            );
        }
        if (formData.batch) {
            filtered = filtered.filter(s => 
                (s.batchId?._id || s.batchId) === formData.batch
            );
        }
        if (formData.section) {
            filtered = filtered.filter(s => 
                (s.sectionId?._id || s.sectionId) === formData.section
            );
        }
        if (formData.activeSession) {
            filtered = filtered.filter(s => 
                (s.sessionId?._id || s.sessionId) === formData.activeSession
            );
        }

        setFilteredStudents(filtered);
        // Auto-select all if no individual selection
        if (selectedStudents.length === 0 && filtered.length > 0) {
            setSelectedStudents(filtered.map(s => s._id));
        }
    }, [formData.currentClass, formData.batch, formData.section, formData.activeSession, students]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Reset dependent fields
        if (name === 'currentClass') {
            setFormData(prev => ({ ...prev, batch: '', section: '', activeSession: '' }));
        }
        if (name === 'migrateTo' && value !== 'promote') {
            setFormData(prev => ({
                ...prev,
                nextSession: '',
                nextClass: '',
                nextBatch: '',
                nextSection: ''
            }));
        }
    };

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const selectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s._id));
        }
    };

// handleSubmit ফাংশনটা এমন হবে (শুধু প্রমোশনের জন্য)

const handleSubmit = async (e) => {
    e.preventDefault();

    if (selectedStudents.length === 0) {
        Swal.fire('Warning', 'কমপক্ষে একজন শিক্ষার্থী নির্বাচন করুন', 'warning');
        return;
    }

    if (formData.migrateTo === 'promote' && (!formData.nextSession || !formData.nextClass)) {
        Swal.fire('Warning', 'প্রমোশনের জন্য Next Session ও Next Class নির্বাচন করুন', 'warning');
        return;
    }

    setLoading(true);

    try {
        const promises = selectedStudents.map(async (studentId) => {
            const student = students.find(s => s._id === studentId);
            if (!student) return null;

            // Create update data object
            const updateData = {
                updatedAt: new Date()
            };

            // If promotion is enabled
            if (formData.migrateTo === 'promote') {
                // Directly update current academic info to new values
                updateData.sessionId = formData.nextSession;
                updateData.classId = formData.nextClass;
                
                // Get display names for the new values
                const nextSessionObj = sessions.find(s => s._id === formData.nextSession);
                const nextClassObj = classes.find(c => c._id === formData.nextClass);
                const nextBatchObj = batches.find(b => b._id === formData.nextBatch);
                const nextSectionObj = sections.find(s => s._id === formData.nextSection);

                // Update display names
                updateData.sessionName = nextSessionObj?.year || nextSessionObj?.name || nextSessionObj?.sessionName;
                updateData.className = nextClassObj?.name;
                updateData.batchName = nextBatchObj?.name || null;
                updateData.sectionName = nextSectionObj?.name || null;

                // Update IDs (if provided)
                if (formData.nextBatch) {
                    updateData.batchId = formData.nextBatch;
                }
                if (formData.nextSection) {
                    updateData.sectionId = formData.nextSection;
                }

                // Also store next academic info for reference
                updateData.nextSessionId = formData.nextSession;
                updateData.nextClassId = formData.nextClass;
                updateData.nextBatchId = formData.nextBatch || null;
                updateData.nextSectionId = formData.nextSection || null;

            } else {
                // Regular update - update current fields if provided
                if (formData.currentClass) {
                    const classObj = classes.find(c => c._id === formData.currentClass);
                    updateData.classId = formData.currentClass;
                    updateData.className = classObj?.name;
                }
                if (formData.batch) {
                    const batchObj = batches.find(b => b._id === formData.batch);
                    updateData.batchId = formData.batch;
                    updateData.batchName = batchObj?.name;
                }
                if (formData.section) {
                    const sectionObj = sections.find(s => s._id === formData.section);
                    updateData.sectionId = formData.section;
                    updateData.sectionName = sectionObj?.name;
                }
                if (formData.activeSession) {
                    const sessionObj = sessions.find(s => s._id === formData.activeSession);
                    updateData.sessionId = formData.activeSession;
                    updateData.sessionName = sessionObj?.year || sessionObj?.name || sessionObj?.sessionName;
                }
            }

            // Update additional settings
            updateData.sendAttendanceSMS = formData.sendAttendanceSMS;
            
            if (formData.monthlyFeeFrom) {
                updateData.monthlyFeeFrom = formData.monthlyFeeFrom;
            }

            console.log('Updating student:', student.name, updateData);
            return axiosInstance.put(`/students/${studentId}`, updateData);
        });

        const results = await Promise.all(promises);
        const successfulUpdates = results.filter(result => result?.data?.success);

        const successMessage = formData.migrateTo === 'promote' 
            ? `${successfulUpdates.length} জন শিক্ষার্থী পরবর্তী ক্লাসে প্রমোশন পেয়েছে!`
            : `${successfulUpdates.length} জন শিক্ষার্থীর তথ্য সফলভাবে আপডেট হয়েছে`;

        Swal.fire({
            icon: 'success',
            title: 'সফল!',
            text: successMessage,
            timer: 3000
        });

        // Show detailed update info
        if (formData.migrateTo === 'promote') {
            const nextClass = classes.find(c => c._id === formData.nextClass)?.name;
            const nextSession = sessions.find(s => s._id === formData.nextSession)?.year || 
                              sessions.find(s => s._id === formData.nextSession)?.name;
            
            Swal.fire({
                title: 'প্রমোশন ডিটেইলস',
                html: `
                    <div class="text-left">
                        <p><strong>নতুন ক্লাস:</strong> ${nextClass}</p>
                        <p><strong>নতুন সেশন:</strong> ${nextSession}</p>
                        <p><strong>মোট শিক্ষার্থী:</strong> ${successfulUpdates.length} জন</p>
                    </div>
                `,
                icon: 'info',
                confirmButtonText: 'ওকে'
            });
        }

        // Reset form
        setFormData({
            currentClass: '',
            batch: '',
            section: '',
            activeSession: '',
            monthlyFeeFrom: '',
            sendAttendanceSMS: false,
            migrateTo: '',
            nextSession: '',
            nextClass: '',
            nextBatch: '',
            nextSection: ''
        });
        setSelectedStudents([]);

        // Refresh data
        fetchAllData();

    } catch (error) {
        console.error('Error updating students:', error);
        const errorMessage = error.response?.data?.message || 'আপডেট করতে সমস্যা হয়েছে';
        Swal.fire('Error', errorMessage, 'error');
    } finally {
        setLoading(false);
    }
};

// Helper function to get display name
const getDisplayName = (item) => {
    if (!item) return 'N/A';
    return item.name || item.year || item.sessionName || 'N/A';
};

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="bg-white border-b shadow-sm sticky top-0 z-10">
                <div className="flex items-center justify-between p-4 sm:p-6">
                    <div className="flex items-center gap-4">
                        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg">
                            <FaArrowLeft className="text-xl" />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800">
                            শিক্ষার্থীদের ক্লাস আপডেট
                        </h1>
                    </div>
                </div>
            </div>

            <div className="p-6 max-w-full mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Current Filters */}
                        <div className="bg-blue-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-[#1e90c9] mb-6">বর্তমান একাডেমিক তথ্য ফিল্টার</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">ক্লাস *</label>
                                    <select name="currentClass" value={formData.currentClass} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#1e90c9]">
                                        <option value="">-- সিলেক্ট করুন --</option>
                                        {classes.map(c => (
                                            <option key={c._id} value={c._id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">ব্যাচ</label>
                                    <select name="batch" value={formData.batch} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                        <option value="">-- সব ব্যাচ --</option>
                                        {batches.map(b => (
                                            <option key={b._id} value={b._id}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">সেকশন</label>
                                    <select name="section" value={formData.section} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                        <option value="">-- সব সেকশন --</option>
                                        {sections.map(s => (
                                            <option key={s._id} value={s._id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">সেশন</label>
                                    <select name="activeSession" value={formData.activeSession} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                        <option value="">-- সব সেশন --</option>
                                        {sessions.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.year || s.name || s.sessionName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="bg-gray-50 p-6 rounded-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold">
                                    শিক্ষার্থী নির্বাচন করুন 
                                    <span className="text-sm text-gray-600 ml-2">
                                        ({filteredStudents.length} জন পাওয়া গেছে)
                                    </span>
                                </h3>
                                {filteredStudents.length > 0 && (
                                    <button type="button" onClick={selectAll} className="text-[#1e90c9] text-sm font-medium flex items-center gap-1">
                                        {selectedStudents.length === filteredStudents.length ? <FaCheckSquare /> : <FaSquare />}
                                        {selectedStudents.length === filteredStudents.length ? 'সব ডিসিলেক্ট' : 'সব সিলেক্ট করুন'}
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white">
                                {filteredStudents.length === 0 ? (
                                    <p className="text-center text-gray-500 col-span-full py-8">
                                        কোন শিক্ষার্থী পাওয়া যায়নি
                                    </p>
                                ) : (
                                    filteredStudents.map(student => (
                                        <div
                                            key={student._id}
                                            onClick={() => toggleStudent(student._id)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${
                                                selectedStudents.includes(student._id)
                                                    ? 'bg-green-100 border-green-400 shadow-md'
                                                    : 'bg-white border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-gray-800">{student.name}</p>
                                                    <p className="text-xs text-gray-600">
                                                        ID: {student.studentId} | রোল: {student.classRoll || 'N/A'}
                                                    </p>
                                                </div>
                                                {selectedStudents.includes(student._id) && (
                                                    <FaCheckSquare className="text-green-600" />
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <p className="mt-3 text-sm font-medium text-gray-700">
                                নির্বাচিত: {selectedStudents.length} জন
                            </p>
                        </div>

                        {/* Migration */}
                        <div className="bg-purple-50 p-6 rounded-xl">
                            <h3 className="text-lg font-bold text-purple-800 mb-4">পরবর্তী সেশনে প্রমোশন</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <select name="migrateTo" value={formData.migrateTo} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                    <option value="">-- প্রমোশন করবেন? --</option>
                                    <option value="promote">হ্যাঁ, পরবর্তী ক্লাসে প্রমোশন</option>
                                </select>
                            </div>

                            {formData.migrateTo === 'promote' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 bg-white p-4 rounded-lg border-2 border-purple-200">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Next Session *</label>
                                        <select name="nextSession" value={formData.nextSession} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg">
                                            <option value="">-- সিলেক্ট --</option>
                                            {sessions.map(s => (
                                                <option key={s._id} value={s._id}>
                                                    {s.year || s.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Next Class *</label>
                                        <select name="nextClass" value={formData.nextClass} onChange={handleChange} required className="w-full px-4 py-3 border rounded-lg">
                                            <option value="">-- সিলেক্ট --</option>
                                            {classes.map(c => (
                                                <option key={c._id} value={c._id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Next Batch</label>
                                        <select name="nextBatch" value={formData.nextBatch} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                            <option value="">-- ঐচ্ছিক --</option>
                                            {batches.map(b => (
                                                <option key={b._id} value={b._id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Next Section</label>
                                        <select name="nextSection" value={formData.nextSection} onChange={handleChange} className="w-full px-4 py-3 border rounded-lg">
                                            <option value="">-- ঐচ্ছিক --</option>
                                            {sections.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end gap-4 pt-6 border-t">
                            <button type="button" onClick={onBack} className="px-6 py-3 border rounded-lg hover:bg-gray-50">
                                বাতিল
                            </button>
                            <MainButton type="submit" disabled={loading || selectedStudents.length === 0}>
                                {loading ? "আপডেট হচ্ছে..." : `${selectedStudents.length} জন আপডেট করুন`}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default StudentsClassUpdate;