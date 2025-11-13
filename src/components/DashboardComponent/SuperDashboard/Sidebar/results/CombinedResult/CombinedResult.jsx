import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../../hooks/axiosInstance/axiosInstance';

const CombinedResult = () => {
    const [results, setResults] = useState([]);
    const [examCategories, setExamCategories] = useState([]);
    const [combinedResults, setCombinedResults] = useState([]);
    const [selectedResults, setSelectedResults] = useState([]);
    const [selectedExamCategories, setSelectedExamCategories] = useState([]);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState('');

    // Fetch data
    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch results and exam categories in parallel
            const [resultsRes, examCategoriesRes, combinedResultsRes] = await Promise.all([
                axiosInstance.get('/results'),
                axiosInstance.get('/exam-categories'),
                axiosInstance.get('/combined-result')
            ]);

            if (resultsRes.data?.success) setResults(resultsRes.data.data || []);
            if (examCategoriesRes.data?.success) setExamCategories(examCategoriesRes.data.data || []);
            if (combinedResultsRes.data?.success) setCombinedResults(combinedResultsRes.data.data || []);

        } catch (err) {
            setError('ডেটা লোড করতে সমস্যা হয়েছে');
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle result selection
    const handleResultSelect = (resultId) => {
        setSelectedResults(prev => 
            prev.includes(resultId) 
                ? prev.filter(id => id !== resultId)
                : [...prev, resultId]
        );
    };

    // Handle exam category selection
    const handleExamCategorySelect = (categoryId) => {
        setSelectedExamCategories(prev => 
            prev.includes(categoryId) 
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    // Select all results
    const handleSelectAllResults = () => {
        if (selectedResults.length === results.length) {
            setSelectedResults([]);
        } else {
            setSelectedResults(results.map(result => result._id));
        }
    };

    // Select all exam categories
    const handleSelectAllExamCategories = () => {
        if (selectedExamCategories.length === examCategories.length) {
            setSelectedExamCategories([]);
        } else {
            setSelectedExamCategories(examCategories.map(cat => cat._id));
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!name.trim()) {
            setError('কম্বাইন্ড রেজাল্টের নাম প্রয়োজন');
            return;
        }

        if (selectedResults.length === 0) {
            setError('অন্তত একটি রেজাল্ট সিলেক্ট করুন');
            return;
        }

        if (selectedExamCategories.length === 0) {
            setError('অন্তত একটি এক্সাম ক্যাটাগরি সিলেক্ট করুন');
            return;
        }

        setSubmitting(true);

        try {
            const payload = {
                name: name.trim(),
                description: description.trim(),
                selectedResults: selectedResults,
                examCategories: selectedExamCategories
            };

            const response = await axiosInstance.post('/combined-result', payload);

            if (response.data && response.data.success) {
                alert('কম্বাইন্ড রেজাল্ট সফলভাবে তৈরি হয়েছে');
                // Reset form
                setName('');
                setDescription('');
                setSelectedResults([]);
                setSelectedExamCategories([]);
                // Refresh list
                fetchData();
            } else {
                setError(response.data?.message || 'সমস্যা হয়েছে');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'সার্ভার সমস্যা হয়েছে');
            console.error('Error creating combined result:', err);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle delete combined result
    const handleDelete = async (id) => {
        if (!window.confirm('আপনি কি নিশ্চিত যে আপনি এই কম্বাইন্ড রেজাল্ট ডিলিট করতে চান?')) {
            return;
        }

        try {
            const response = await axiosInstance.delete(`/combined-result/${id}`);
            if (response.data && response.data.success) {
                alert('কম্বাইন্ড রেজাল্ট সফলভাবে ডিলিট হয়েছে');
                fetchData();
            } else {
                alert(response.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'ডিলিট করতে সমস্যা হয়েছে');
            console.error('Error deleting combined result:', err);
        }
    };

    // Handle download combined result as PDF
    const handleDownloadPDF = async (combinedResult) => {
        setDownloading(true);

        try {
            // Dynamic import for jsPDF
            const { jsPDF } = await import('jspdf');
            
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.setTextColor(40, 40, 40);
            doc.text('কম্বাইন্ড রেজাল্ট রিপোর্ট', 105, 20, { align: 'center' });
            
            // Add combined result details
            doc.setFontSize(12);
            doc.setTextColor(100, 100, 100);
            
            let yPosition = 40;
            
            // Basic information
            doc.text(`কম্বাইন্ড রেজাল্টের নাম: ${combinedResult.name}`, 20, yPosition);
            if (combinedResult.description) {
                doc.text(`বিবরণ: ${combinedResult.description}`, 20, yPosition + 8);
                yPosition += 16;
            } else {
                yPosition += 8;
            }
            
            doc.text(`মোট রেজাল্ট: ${combinedResult.totalResults} টি`, 20, yPosition);
            doc.text(`মোট এক্সাম ক্যাটাগরি: ${combinedResult.totalExamCategories} টি`, 20, yPosition + 8);
            doc.text(`তৈরির তারিখ: ${new Date(combinedResult.createdAt).toLocaleDateString('bn-BD')}`, 20, yPosition + 16);
            
            yPosition += 30;
            
            // Selected Results Section
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('সিলেক্টেড রেজাল্টসমূহ:', 20, yPosition);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            yPosition += 10;
            
            // Get selected results details
            const selectedResultsDetails = results.filter(result => 
                combinedResult.selectedResults.includes(result._id)
            );
            
            // Table header for results
            doc.setFillColor(41, 128, 185);
            doc.setTextColor(255, 255, 255);
            doc.rect(20, yPosition, 170, 8, 'F');
            doc.text('ছাত্রের নাম', 25, yPosition + 6);
            doc.text('আইডি', 80, yPosition + 6);
            doc.text('গ্রেড', 120, yPosition + 6);
            doc.text('মার্কস', 150, yPosition + 6);
            
            yPosition += 12;
            doc.setTextColor(0, 0, 0);
            
            // Results rows
            selectedResultsDetails.forEach((result, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(20, yPosition, 170, 8, 'F');
                }
                
                doc.text(result.studentName, 25, yPosition + 6);
                doc.text(result.studentId, 80, yPosition + 6);
                doc.text(result.averageLetterGrade, 120, yPosition + 6);
                doc.text(result.averageMarks.toString(), 155, yPosition + 6);
                
                yPosition += 8;
            });
            
            yPosition += 15;
            
            // Selected Exam Categories Section
            if (yPosition > 250) {
                doc.addPage();
                yPosition = 20;
            }
            
            doc.setFontSize(14);
            doc.setTextColor(40, 40, 40);
            doc.text('সিলেক্টেড এক্সাম ক্যাটাগরিসমূহ:', 20, yPosition);
            
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            yPosition += 10;
            
            // Get selected exam categories details
            const selectedCategoriesDetails = examCategories.filter(category => 
                combinedResult.examCategories.includes(category._id)
            );
            
            // Table header for categories
            doc.setFillColor(41, 128, 185);
            doc.setTextColor(255, 255, 255);
            doc.rect(20, yPosition, 170, 8, 'F');
            doc.text('ক্যাটাগরি নাম', 25, yPosition + 6);
            doc.text('মোট মার্কস', 100, yPosition + 6);
            doc.text('পাস মার্কস', 140, yPosition + 6);
            
            yPosition += 12;
            doc.setTextColor(0, 0, 0);
            
            // Categories rows
            selectedCategoriesDetails.forEach((category, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }
                
                // Alternate row colors
                if (index % 2 === 0) {
                    doc.setFillColor(240, 240, 240);
                    doc.rect(20, yPosition, 170, 8, 'F');
                }
                
                doc.text(category.name, 25, yPosition + 6);
                doc.text(category.totalMarks.toString(), 105, yPosition + 6);
                doc.text(category.passMarks.toString(), 145, yPosition + 6);
                
                yPosition += 8;
            });
            
            // Add footer to all pages
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(150, 150, 150);
                doc.text(
                    `পৃষ্ঠা ${i} / ${pageCount} - ডাউনলোডের তারিখ: ${new Date().toLocaleDateString('bn-BD')}`,
                    105,
                    doc.internal.pageSize.height - 10,
                    { align: 'center' }
                );
            }
            
            // Download PDF
            const fileName = `combined-result-${combinedResult.name}-${new Date().getTime()}.pdf`;
            doc.save(fileName);
            
            alert('কম্বাইন্ড রেজাল্ট PDF সফলভাবে ডাউনলোড হয়েছে');
            
        } catch (err) {
            console.error('Error generating PDF:', err);
            alert('PDF তৈরি করতে সমস্যা হয়েছে');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-full mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">কম্বাইন্ড রেজাল্ট ম্যানেজমেন্ট</h1>
                    <p className="text-gray-600 mt-2">বিভিন্ন রেজাল্ট এবং এক্সাম ক্যাটাগরি কম্বাইন করুন</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="ml-3 text-gray-600">ডেটা লোড হচ্ছে...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Side - Selection Form */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">নতুন কম্বাইন্ড রেজাল্ট তৈরি করুন</h2>
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        কম্বাইন্ড রেজাল্টের নাম <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="কম্বাইন্ড রেজাল্টের নাম লিখুন"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                        required
                                    />
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        বিবরণ
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="কম্বাইন্ড রেজাল্টের বিবরণ লিখুন"
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                                    />
                                </div>

                                {/* Results Selection */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            রেজাল্ট সিলেক্ট করুন <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllResults}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedResults.length === results.length ? 'সব আনসিলেক্ট করুন' : 'সব সিলেক্ট করুন'}
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {results.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">কোন রেজাল্ট পাওয়া যায়নি</p>
                                        ) : (
                                            results.map((result) => (
                                                <div key={result._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedResults.includes(result._id)}
                                                        onChange={() => handleResultSelect(result._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{result.studentName}</p>
                                                        <p className="text-xs text-gray-500">
                                                            ID: {result.studentId} | Grade: {result.averageLetterGrade} | Marks: {result.averageMarks}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        সিলেক্টেড: {selectedResults.length} টি রেজাল্ট
                                    </p>
                                </div>

                                {/* Exam Categories Selection */}
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            এক্সাম ক্যাটাগরি সিলেক্ট করুন <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={handleSelectAllExamCategories}
                                            className="text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            {selectedExamCategories.length === examCategories.length ? 'সব আনসিলেক্ট করুন' : 'সব সিলেক্ট করুন'}
                                        </button>
                                    </div>
                                    
                                    <div className="max-h-60 overflow-y-auto space-y-2">
                                        {examCategories.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">কোন এক্সাম ক্যাটাগরি পাওয়া যায়নি</p>
                                        ) : (
                                            examCategories.map((category) => (
                                                <div key={category._id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedExamCategories.includes(category._id)}
                                                        onChange={() => handleExamCategorySelect(category._id)}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{category.name}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Total Marks: {category.totalMarks} | Pass Marks: {category.passMarks}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        সিলেক্টেড: {selectedExamCategories.length} টি ক্যাটাগরি
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full py-3 rounded-lg font-medium text-white transition-colors duration-200 flex items-center justify-center space-x-2 ${
                                        submitting
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                                    }`}
                                >
                                    {submitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            <span>কম্বাইন হচ্ছে...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path>
                                            </svg>
                                            <span>Combined Result</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* Right Side - Combined Results List */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-semibold text-gray-800 mb-6">কম্বাইন্ড রেজাল্ট লিস্ট</h2>
                            
                            {combinedResults.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <p className="mt-4 text-lg font-medium text-gray-900">কোন কম্বাইন্ড রেজাল্ট পাওয়া যায়নি</p>
                                    <p className="mt-2 text-gray-600">নতুন কম্বাইন্ড রেজাল্ট তৈরি করুন</p>
                                </div>
                            ) : (
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {combinedResults.map((combined) => (
                                        <div key={combined._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{combined.name}</h3>
                                                    {combined.description && (
                                                        <p className="text-sm text-gray-600 mt-1">{combined.description}</p>
                                                    )}
                                                </div>
                                                <div className="flex space-x-2">
                                                    <button
                                                        onClick={() => handleDownloadPDF(combined)}
                                                        disabled={downloading}
                                                        className="p-1 text-green-600 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1 rounded transition-colors duration-200"
                                                        title="PDF ডাউনলোড করুন"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(combined._id)}
                                                        className="p-1 text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded transition-colors duration-200"
                                                        title="ডিলিট করুন"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-600">রেজাল্ট: {combined.totalResults} টি</p>
                                                    <p className="text-gray-600">ক্যাটাগরি: {combined.totalExamCategories} টি</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-600">
                                                        তৈরি: {new Date(combined.createdAt).toLocaleDateString('bn-BD')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CombinedResult;