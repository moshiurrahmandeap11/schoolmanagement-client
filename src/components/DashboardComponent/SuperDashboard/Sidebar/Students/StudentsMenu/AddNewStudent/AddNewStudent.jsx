import { useEffect, useState } from 'react';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../../../sharedItems/Mainbutton/Mainbutton';
import AcademicInformation from './AcademicInformation/AcademicInformation';
import AddressInformation from './AddressInformation/AddressInformation';
import FamilyInformation from './FamilyInformation/FamilyInformation';
import FeeInformation from './FeeInformation/FeeInformation';
import OtherSettings from './OtherInformation/OtherInformation';
import PersonalInformation from './PersonalInformation/PersonalInformation';

const AddNewStudent = ({ onBack, onSuccess, editData, mode = 'new' }) => {
    const [loading, setLoading] = useState(false);
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [batches, setBatches] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [activeTab, setActiveTab] = useState('personal');
    const [formData, setFormData] = useState({
        // Personal Information
        studentId: '',
        smartId: '',
        dakhelaNumber: '',
        name: '',
        dob: '',
        birthRegistration: '',
        gender: 'male',
        mobile: '',
        bloodGroup: '',
        photo: null,
        attachmentType: '',

        // Family Information
        fatherName: '',
        motherName: '',
        guardianName: '',
        guardianMobile: '',
        relation: '',
        guardianNid: '',

        // Address Information
        permanentVillage: '',
        permanentPostOffice: '',
        permanentDistrict: '',
        permanentThana: '',
        currentVillage: '',
        currentPostOffice: '',
        currentDistrict: '',
        currentThana: '',
        sameAsPermanent: false,

        // Academic Information
        classId: '',
        batchId: '',
        sectionId: '',
        sessionId: '',
        classRoll: '',
        additionalNote: '',
        status: 'active',
        studentType: 'non_residential',
        mentorId: '',

        // Fee Information
        admissionFee: '',
        monthlyFee: '',
        previousDues: '',
        sessionFee: '',
        boardingFee: '',
        otherFee: '',
        transportFee: '',
        residenceFee: '',

        // Other Settings
        sendAdmissionSMS: true,
        studentSerial: '',
        sendAttendanceSMS: true
    });
    const [errors, setErrors] = useState({});
    const [photoPreview, setPhotoPreview] = useState('');
    const [isDataLoaded, setIsDataLoaded] = useState(false);

    useEffect(() => {
        fetchDropdownData();
    }, []);

    useEffect(() => {
        if (editData && classes.length > 0 && isDataLoaded) {
            populateFormData(editData);
        }
    }, [editData, classes, isDataLoaded]);

    const fetchDropdownData = async () => {
        try {
            const [
                classesRes,
                sectionsRes,
                batchesRes,
                sessionsRes,
                teachersRes
            ] = await Promise.all([
                axiosInstance.get('/class'),
                axiosInstance.get('/sections'),
                axiosInstance.get('/batches'),
                axiosInstance.get('/sessions'),
                axiosInstance.get('/teacher-list')
            ]);

            if (classesRes.data.success) setClasses(classesRes.data.data);
            if (sectionsRes.data.success) setSections(sectionsRes.data.data);
            if (batchesRes.data.success) setBatches(batchesRes.data.data);
            if (sessionsRes.data.success) setSessions(sessionsRes.data.data);
            if (teachersRes.data.success) setTeachers(teachersRes.data.data);

            setIsDataLoaded(true);
        } catch (error) {
            console.error('Error fetching dropdown data:', error);
            showSweetAlert('error', 'ডেটা লোড করতে সমস্যা হয়েছে');
            setIsDataLoaded(true);
        }
    };

    const populateFormData = (studentData) => {
        console.log('Populating form with student data:', studentData);
        
        // Format date for input field (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
            if (!dateString) return '';
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return '';
                return date.toISOString().split('T')[0];
            } catch (error) {
                console.error('Error formatting date:', error);
                return '';
            }
        };

        // Parse numeric values safely
        const parseNumber = (value) => {
            if (value === null || value === undefined || value === '') return '';
            const num = Number(value);
            return isNaN(num) ? '' : num.toString();
        };

        // Parse boolean values safely
        const parseBoolean = (value) => {
            if (value === null || value === undefined) return true;
            return Boolean(value);
        };

        const newFormData = {
            // Personal Information
            studentId: studentData.studentId || '',
            smartId: studentData.smartId || '',
            dakhelaNumber: studentData.dakhelaNumber || '',
            name: studentData.name || '',
            dob: formatDateForInput(studentData.dob),
            birthRegistration: studentData.birthRegistration || '',
            gender: studentData.gender || 'male',
            mobile: studentData.mobile || '',
            bloodGroup: studentData.bloodGroup || '',
            photo: null,
            attachmentType: studentData.attachmentType || '',

            // Family Information
            fatherName: studentData.fatherName || '',
            motherName: studentData.motherName || '',
            guardianName: studentData.guardianName || '',
            guardianMobile: studentData.guardianMobile || '',
            relation: studentData.relation || '',
            guardianNid: studentData.guardianNid || '',

            // Address Information
            permanentVillage: studentData.permanentVillage || '',
            permanentPostOffice: studentData.permanentPostOffice || '',
            permanentDistrict: studentData.permanentDistrict || '',
            permanentThana: studentData.permanentThana || '',
            currentVillage: studentData.currentVillage || '',
            currentPostOffice: studentData.currentPostOffice || '',
            currentDistrict: studentData.currentDistrict || '',
            currentThana: studentData.currentThana || '',
            sameAsPermanent: parseBoolean(studentData.sameAsPermanent),

            // Academic Information
            classId: studentData.classId?._id || studentData.classId || '',
            batchId: studentData.batchId?._id || studentData.batchId || '',
            sectionId: studentData.sectionId?._id || studentData.sectionId || '',
            sessionId: studentData.sessionId?._id || studentData.sessionId || '',
            classRoll: parseNumber(studentData.classRoll),
            additionalNote: studentData.additionalNote || '',
            status: studentData.status || 'active',
            studentType: studentData.studentType || 'non_residential',
            mentorId: studentData.mentorId?._id || studentData.mentorId || '',

            // Fee Information
            admissionFee: parseNumber(studentData.admissionFee),
            monthlyFee: parseNumber(studentData.monthlyFee),
            previousDues: parseNumber(studentData.previousDues),
            sessionFee: parseNumber(studentData.sessionFee),
            boardingFee: parseNumber(studentData.boardingFee),
            otherFee: parseNumber(studentData.otherFee),
            transportFee: parseNumber(studentData.transportFee),
            residenceFee: parseNumber(studentData.residenceFee),

            // Other Settings
            sendAdmissionSMS: parseBoolean(studentData.sendAdmissionSMS),
            studentSerial: parseNumber(studentData.studentSerial),
            sendAttendanceSMS: parseBoolean(studentData.sendAttendanceSMS)
        };

        console.log('Setting form data:', newFormData);
        setFormData(newFormData);

        // Set photo preview if exists
        if (studentData.photo) {
            const fullPhotoUrl = `${axiosInstance.defaults.baseURL}${studentData.photo}`;
            console.log('Setting photo preview:', fullPhotoUrl);
            setPhotoPreview(fullPhotoUrl);
        } else {
            setPhotoPreview('');
        }
    };

    const showSweetAlert = (icon, title, text = '') => {
        Swal.fire({
            icon,
            title,
            text,
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
        });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'checkbox') {
            const newValue = checked;
            setFormData(prev => ({
                ...prev,
                [name]: newValue
            }));

            // Handle same as permanent address
            if (name === 'sameAsPermanent' && newValue) {
                setFormData(prev => ({
                    ...prev,
                    currentVillage: prev.permanentVillage,
                    currentPostOffice: prev.permanentPostOffice,
                    currentDistrict: prev.permanentDistrict,
                    currentThana: prev.permanentThana
                }));
            }
        } else if (type === 'file') {
            // File input handled separately in photo component
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handlePhotoChange = (file, preview) => {
        setFormData(prev => ({
            ...prev,
            photo: file
        }));
        setPhotoPreview(preview);
    };

    const clearError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Information Validation
        if (!formData.name.trim()) {
            newErrors.name = 'শিক্ষার্থীর নাম প্রয়োজন';
        }
        if (!formData.classId) {
            newErrors.classId = 'ক্লাস নির্বাচন করুন';
        }
        if (!formData.classRoll) {
            newErrors.classRoll = 'ক্লাস রোল প্রয়োজন';
        }
        if (!formData.dob) {
            newErrors.dob = 'জন্ম তারিখ প্রয়োজন';
        }
        if (!formData.gender) {
            newErrors.gender = 'লিঙ্গ নির্বাচন করুন';
        }

        // Family Information Validation
        if (!formData.fatherName.trim()) {
            newErrors.fatherName = 'পিতার নাম প্রয়োজন';
        }
        if (!formData.motherName.trim()) {
            newErrors.motherName = 'মায়ের নাম প্রয়োজন';
        }

        // Address Information Validation
        if (!formData.permanentVillage.trim()) {
            newErrors.permanentVillage = 'স্থায়ী ঠিকানার গ্রাম প্রয়োজন';
        }
        if (!formData.permanentPostOffice.trim()) {
            newErrors.permanentPostOffice = 'স্থায়ী ঠিকানার ডাকঘর প্রয়োজন';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setActiveTab('personal');
            showSweetAlert('error', 'অনুগ্রহ করে সকল প্রয়োজনীয় তথ্য পূরণ করুন');
            return;
        }

        try {
            setLoading(true);
            
            const submitData = new FormData();
            
            // Append all form data
            Object.keys(formData).forEach(key => {
                if (key === 'photo') {
                    if (formData[key]) {
                        submitData.append(key, formData[key]);
                    }
                } else if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
                    submitData.append(key, formData[key]);
                }
            });

            console.log('Submitting form data:', Object.fromEntries(submitData));

            let response;
            if (mode === 'edit' && editData) {
                // Update existing student
                response = await axiosInstance.put(`/students/${editData._id}`, submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Create new student
                response = await axiosInstance.post('/students', submitData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (response.data.success) {
                showSweetAlert('success', 
                    mode === 'edit' ? 'শিক্ষার্থী সফলভাবে আপডেট হয়েছে!' : 'শিক্ষার্থী সফলভাবে তৈরি হয়েছে!'
                );
                if (onSuccess) {
                    onSuccess();
                }
                
                if (mode === 'new') {
                    // Show success message with print option only for new students
                    const result = await Swal.fire({
                        title: 'সফল!',
                        text: 'শিক্ষার্থী সফলভাবে তৈরি হয়েছে। আপনি কি প্রিন্ট করতে চান?',
                        icon: 'success',
                        showCancelButton: true,
                        confirmButtonText: 'হ্যাঁ, প্রিন্ট করুন',
                        cancelButtonText: 'না, ফিরে যান',
                        reverseButtons: true
                    });

                    if (result.isConfirmed) {
                        handlePrint(response.data.data);
                    } else {
                        onBack();
                    }
                } else {
                    onBack();
                }
            } else {
                showSweetAlert('error', response.data.message || 
                    (mode === 'edit' ? 'শিক্ষার্থী আপডেট করতে সমস্যা হয়েছে' : 'শিক্ষার্থী তৈরি করতে সমস্যা হয়েছে')
                );
            }
        } catch (error) {
            console.error('Error saving student:', error);
            const errorMessage = error.response?.data?.message || 
                (mode === 'edit' ? 'শিক্ষার্থী আপডেট করতে সমস্যা হয়েছে' : 'শিক্ষার্থী তৈরি করতে সমস্যা হয়েছে');
            showSweetAlert('error', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = (studentData) => {
        // Print functionality here
        const printWindow = window.open('', '_blank');
        // ... existing print code
    };

    const tabs = [
        { id: 'personal', label: 'Personal Information' },
        { id: 'family', label: 'Family Information' },
        { id: 'address', label: 'Address Information' },
        { id: 'academic', label: 'Academic Information' },
        { id: 'fee', label: 'Fee Information' },
        { id: 'settings', label: 'Other Settings' }
    ];

    // Show loading while data is being loaded for edit mode
    if (mode === 'edit' && (!isDataLoaded || (editData && !formData.name))) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e90c9] mx-auto"></div>
                    <p className="mt-4 text-gray-600">শিক্ষার্থীর তথ্য লোড হচ্ছে...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
                <div className="flex items-center gap-4 p-4 sm:p-6">
                    <button
                        onClick={onBack}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <FaArrowLeft className="text-xl text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {mode === 'edit' ? 'শিক্ষার্থী এডিট করুন' : 'নতুন শিক্ষার্থী তৈরি করুন'}
                    </h1>
                    {mode === 'edit' && formData.studentId && (
                        <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            ID: {formData.studentId}
                        </span>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-full mx-auto">
                    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex overflow-x-auto">
                                {tabs.map(tab => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                                            activeTab === tab.id
                                                ? 'border-[#1e90c9] text-[#1e90c9]'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'personal' && (
                                <PersonalInformation
                                    formData={formData}
                                    errors={errors}
                                    photoPreview={photoPreview}
                                    onChange={handleInputChange}
                                    onPhotoChange={handlePhotoChange}
                                    clearError={clearError}
                                    showSweetAlert={showSweetAlert}
                                    isEdit={mode === 'edit'}
                                />
                            )}
                            {activeTab === 'family' && (
                                <FamilyInformation
                                    formData={formData}
                                    errors={errors}
                                    onChange={handleInputChange}
                                    clearError={clearError}
                                />
                            )}
                            {activeTab === 'address' && (
                                <AddressInformation
                                    formData={formData}
                                    errors={errors}
                                    onChange={handleInputChange}
                                    clearError={clearError}
                                />
                            )}
                            {activeTab === 'academic' && (
                                <AcademicInformation
                                    formData={formData}
                                    errors={errors}
                                    classes={classes}
                                    sections={sections}
                                    batches={batches}
                                    sessions={sessions}
                                    teachers={teachers}
                                    onChange={handleInputChange}
                                    clearError={clearError}
                                />
                            )}
                            {activeTab === 'fee' && (
                                <FeeInformation
                                    formData={formData}
                                    onChange={handleInputChange}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <OtherSettings
                                    formData={formData}
                                    onChange={handleInputChange}
                                />
                            )}
                        </div>

                        {/* Submit Buttons */}
                        <div className="flex gap-4 p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onBack}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                বাতিল করুন
                            </button>
                            <MainButton
                                type="submit"
                                disabled={loading}
                                className="rounded-md"
                            >
                                <FaSave className="text-sm mr-2" />
                                {loading 
                                    ? 'সেভ হচ্ছে...' 
                                    : mode === 'edit' 
                                        ? 'শিক্ষার্থী আপডেট করুন' 
                                        : 'শিক্ষার্থী সেভ করুন'
                                }
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddNewStudent;