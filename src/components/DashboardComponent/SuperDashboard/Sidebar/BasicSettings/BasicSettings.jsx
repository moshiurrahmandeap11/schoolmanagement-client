import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import MainButton from '../../../../sharedItems/Mainbutton/Mainbutton';


const BasicSettings = () => {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        // ভাষা এবং সাধারণ সেটিংস
        language: 'bangla',
        studentIdFormat: '',
        studentOrderBy: 'name',
        resultType: 'grade',
        failCountBySubjectNumber: 1,
        
        // চেকবক্স সেটিংস
        showRankingOnTabularResult: false,
        showRankingOnMarksheet: false,
        showCtNumber: false,
        countOptionalSubjectForGpa: false,
        showAttendanceOnResult: false,
        showFeeOnStudentPage: false,
        showFeeAllocationOnStudentPage: false,
        showInstituteWithBranch: false,
        marksheetContentInEnglish: false,
        generateFullYearFee: false,
        showInvoiceNumberField: false,
        showCollectorField: false,
        showSeatNumberInAdmitCard: false,
        hideFinanceForNonAdmin: false,
        showAddressDetails: false,
        showBatchAndSection: false,
        showCollectFeeListView: false,
        showExpenseCategoryListInExpense: false,
        showDekhalaNumber: false,
        showSubtotalWithExpenseItem: false,
        manageExpenseWithCategory: false,
        showIdCardPrint: false,
        guardianWillPayOnlinePaymentCharge: false,
        hideTeacherNumber: false,
        
        // সংখ্যাসূচক সেটিংস
        invoiceStartNumber: 1,
        voucherStartNumber: 1,
        
        // সময় সম্পর্কিত সেটিংস
        secondTimePunch: 30,
        attendanceType: 'both'
    });

    // সেটিংস লোড করুন
    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/basic-settings');
            
            if (response.data?.success && response.data.data) {
                setFormData(prev => ({
                    ...prev,
                    ...response.data.data
                }));
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            Swal.fire('Error!', 'সেটিংস লোড করতে সমস্যা হয়েছে', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    // ইনপুট পরিবর্তন হ্যান্ডলার
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : 
                   type === 'number' ? parseInt(value) || 0 : value
        }));
    };

    // ফর্ম সাবমিশন
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSaving(true);
            const response = await axiosInstance.post('/basic-settings', formData);
            
            if (response.data?.success) {
                Swal.fire('Success!', 'সেটিংস সফলভাবে সংরক্ষণ হয়েছে', 'success');
            } else {
                Swal.fire('Error!', response.data?.message || 'সমস্যা হয়েছে', 'error');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            Swal.fire('Error!', 'সেটিংস সংরক্ষণ করতে সমস্যা হয়েছে', 'error');
        } finally {
            setSaving(false);
        }
    };

    // ফর্ম রিসেট
    const handleReset = () => {
        Swal.fire({
            title: 'নিশ্চিত করুন?',
            text: 'আপনি কি ডিফল্ট সেটিংসে ফিরে যেতে চান?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'হ্যাঁ',
            cancelButtonText: 'না'
        }).then((result) => {
            if (result.isConfirmed) {
                setFormData({
                    language: 'bangla',
                    studentIdFormat: '',
                    studentOrderBy: 'name',
                    resultType: 'grade',
                    failCountBySubjectNumber: 1,
                    showRankingOnTabularResult: false,
                    showRankingOnMarksheet: false,
                    showCtNumber: false,
                    countOptionalSubjectForGpa: false,
                    showAttendanceOnResult: false,
                    invoiceStartNumber: 1,
                    voucherStartNumber: 1,
                    showFeeOnStudentPage: false,
                    showFeeAllocationOnStudentPage: false,
                    showInstituteWithBranch: false,
                    marksheetContentInEnglish: false,
                    generateFullYearFee: false,
                    showInvoiceNumberField: false,
                    showCollectorField: false,
                    showSeatNumberInAdmitCard: false,
                    hideFinanceForNonAdmin: false,
                    secondTimePunch: 30,
                    attendanceType: 'both',
                    showAddressDetails: false,
                    showBatchAndSection: false,
                    showCollectFeeListView: false,
                    showExpenseCategoryListInExpense: false,
                    showDekhalaNumber: false,
                    showSubtotalWithExpenseItem: false,
                    manageExpenseWithCategory: false,
                    showIdCardPrint: false,
                    guardianWillPayOnlinePaymentCharge: false,
                    hideTeacherNumber: false
                });
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4">
                        <h1 className="text-2xl font-bold ">
                            বেসিক সেটিংস
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-8">
                            {/* Section 1: Language and Basic Settings */}
                            <div className="border-b border-gray-200 pb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    ভাষা এবং সাধারণ সেটিংস
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Language */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            ভাষা
                                        </label>
                                        <select
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        >
                                            <option value="bangla">বাংলা</option>
                                            <option value="english">English</option>
                                        </select>
                                    </div>

                                    {/* Student ID Format */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            শিক্ষার্থীর আইডি ফরম্যাট
                                        </label>
                                        <input
                                            type="text"
                                            name="studentIdFormat"
                                            value={formData.studentIdFormat}
                                            onChange={handleInputChange}
                                            placeholder="উদাহরণ: STU-{year}-{serial}"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                    </div>

                                    {/* Student Order By */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Student Order By
                                        </label>
                                        <select
                                            name="studentOrderBy"
                                            value={formData.studentOrderBy}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        >
                                            <option value="name">নাম অনুসারে</option>
                                            <option value="roll">রোল অনুসারে</option>
                                            <option value="id">আইডি অনুসারে</option>
                                        </select>
                                    </div>

                                    {/* Result Type */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Result Type
                                        </label>
                                        <select
                                            name="resultType"
                                            value={formData.resultType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        >
                                            <option value="grade">গ্রেড</option>
                                            <option value="marks">নম্বর</option>
                                            <option value="both">উভয়</option>
                                        </select>
                                    </div>

                                    {/* Fail Count By Subject Number */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fail Count By Subject Number
                                        </label>
                                        <input
                                            type="number"
                                            name="failCountBySubjectNumber"
                                            value={formData.failCountBySubjectNumber}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="10"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Result and Marksheet Settings */}
                            <div className="border-b border-gray-200 pb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    রেজাল্ট এবং মার্কশিট সেটিংস
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Checkbox
                                        name="showRankingOnTabularResult"
                                        label="Show Ranking on Tabular Result"
                                        checked={formData.showRankingOnTabularResult}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showRankingOnMarksheet"
                                        label="Show Ranking on Marksheet"
                                        checked={formData.showRankingOnMarksheet}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showCtNumber"
                                        label="Show CT Number"
                                        checked={formData.showCtNumber}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="countOptionalSubjectForGpa"
                                        label="Count Optional Subject for GPA"
                                        checked={formData.countOptionalSubjectForGpa}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showAttendanceOnResult"
                                        label="Show Attendance on Result"
                                        checked={formData.showAttendanceOnResult}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="marksheetContentInEnglish"
                                        label="Marksheet Content in English"
                                        checked={formData.marksheetContentInEnglish}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Section 3: Fee and Finance Settings */}
                            <div className="border-b border-gray-200 pb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    ফি এবং ফাইন্যান্স সেটিংস
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Invoice Start Number
                                        </label>
                                        <input
                                            type="number"
                                            name="invoiceStartNumber"
                                            value={formData.invoiceStartNumber}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Voucher Start Number
                                        </label>
                                        <input
                                            type="number"
                                            name="voucherStartNumber"
                                            value={formData.voucherStartNumber}
                                            onChange={handleInputChange}
                                            min="1"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Checkbox
                                        name="showFeeOnStudentPage"
                                        label="Show Fee on Student Page"
                                        checked={formData.showFeeOnStudentPage}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showFeeAllocationOnStudentPage"
                                        label="Show Fee Allocation on Student Page"
                                        checked={formData.showFeeAllocationOnStudentPage}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="generateFullYearFee"
                                        label="Generate Full Year Fee"
                                        checked={formData.generateFullYearFee}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showInvoiceNumberField"
                                        label="Show Invoice Number Field"
                                        checked={formData.showInvoiceNumberField}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showCollectorField"
                                        label="Show Collector Field"
                                        checked={formData.showCollectorField}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="hideFinanceForNonAdmin"
                                        label="Hide Finance for Non-Admin"
                                        checked={formData.hideFinanceForNonAdmin}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="guardianWillPayOnlinePaymentCharge"
                                        label="Guardian Will Pay Online Payment Charge"
                                        checked={formData.guardianWillPayOnlinePaymentCharge}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            {/* Section 4: Attendance and Other Settings */}
                            <div className="border-b border-gray-200 pb-8">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                    উপস্থিতি এবং অন্যান্য সেটিংস
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Second Time Punch (মিনিট)
                                        </label>
                                        <input
                                            type="number"
                                            name="secondTimePunch"
                                            value={formData.secondTimePunch}
                                            onChange={handleInputChange}
                                            min="1"
                                            max="120"
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            প্রতিষতানের ধরন
                                        </label>
                                        <select
                                            name="attendanceType"
                                            value={formData.attendanceType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1e90c9]"
                                        >
                                            <option value="both">উভয়</option>
                                            <option value="manual">ম্যানুয়াল</option>
                                            <option value="automatic">অটোমেটিক</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <Checkbox
                                        name="showInstituteWithBranch"
                                        label="Show Institute with Branch"
                                        checked={formData.showInstituteWithBranch}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showSeatNumberInAdmitCard"
                                        label="Show Seat Number in Admit Card"
                                        checked={formData.showSeatNumberInAdmitCard}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showAddressDetails"
                                        label="Show Address Details"
                                        checked={formData.showAddressDetails}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showBatchAndSection"
                                        label="Show Batch and Section"
                                        checked={formData.showBatchAndSection}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showCollectFeeListView"
                                        label="Show Collect Fee List View"
                                        checked={formData.showCollectFeeListView}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showExpenseCategoryListInExpense"
                                        label="Show Expense Category List in Expense"
                                        checked={formData.showExpenseCategoryListInExpense}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showDekhalaNumber"
                                        label="Show Dekhala Number"
                                        checked={formData.showDekhalaNumber}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showSubtotalWithExpenseItem"
                                        label="Show Subtotal with Expense Item"
                                        checked={formData.showSubtotalWithExpenseItem}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="manageExpenseWithCategory"
                                        label="Manage Expense with Category"
                                        checked={formData.manageExpenseWithCategory}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="showIdCardPrint"
                                        label="Show ID Card Print"
                                        checked={formData.showIdCardPrint}
                                        onChange={handleInputChange}
                                    />
                                    <Checkbox
                                        name="hideTeacherNumber"
                                        label="Hide Teacher Number"
                                        checked={formData.hideTeacherNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-end pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-medium"
                                disabled={saving}
                            >
                                রিসেট করুন
                            </button>
                            <MainButton
                                type="submit"
                                disabled={saving}
                                className='rounded-md'
                            >
                                {saving ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        সংরক্ষণ হচ্ছে...
                                    </span>
                                ) : (
                                    'সেটিংস সংরক্ষণ করুন'
                                )}
                            </MainButton>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

// Reusable Checkbox Component
const Checkbox = ({ name, label, checked, onChange }) => (
    <div className="flex items-center">
        <input
            type="checkbox"
            name={name}
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            id={name}
        />
        <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
            {label}
        </label>
    </div>
);

export default BasicSettings;