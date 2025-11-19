import { useEffect, useState } from 'react';
import { GrContact, GrFormPrevious } from 'react-icons/gr';
import { useNavigate, useParams } from 'react-router';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import MainButton from '../../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';

const PresidentDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [speech, setSpeech] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (id) {
            fetchSpeechDetails();
        }
    }, [id]);

    const fetchSpeechDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/speeches/${id}`);
            
            if (response.data.success) {
                setSpeech(response.data.data);
            } else {
                setError('স্পিচ লোড করতে সমস্যা হয়েছে');
            }
        } catch (error) {
            console.error('Error fetching speech details:', error);
            setError('স্পিচ ডিটেইলস লোড করতে সমস্যা হয়েছে');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const imageUrl = axiosInstance.defaults.baseURL;
    const imageLink = speech?.image;
    const image = imageUrl + imageLink;

    if (loading) {
        return <Loader></Loader>
    }

    if (error) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-700 text-sm sm:text-base shadow-sm"
                        >
                            <GrFormPrevious className="text-lg" />
                            <span className="hidden xs:inline">পিছনে যান</span>
                            <span className="xs:hidden">পিছনে</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="text-center py-8 sm:py-12">
                            <div className="text-red-400 mb-4">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">ত্রুটি!</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">{error}</p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleGoBack}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    পিছনে যান
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    হোমপেজে যান
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!speech) {
        return (
            <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 py-4 sm:py-6 lg:py-8">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                    {/* Back Button */}
                    <div className="mb-4 sm:mb-6">
                        <button
                            onClick={handleGoBack}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-gray-700 text-sm sm:text-base shadow-sm"
                        >
                            <GrFormPrevious className="text-lg" />
                            <span className="hidden xs:inline">পিছনে যান</span>
                            <span className="xs:hidden">পিছনে</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
                        <div className="text-center py-8 sm:py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">স্পিচ পাওয়া যায়নি</h3>
                            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 max-w-md mx-auto leading-relaxed">
                                আপনি যে স্পিচটি খুঁজছেন তা পাওয়া যায়নি। হতে পারে এটি ডিলিট হয়ে গেছে বা সরিয়ে নেওয়া হয়েছে।
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={handleGoBack}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    পিছনে যান
                                </button>
                                <button
                                    onClick={handleGoHome}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all duration-200 text-sm sm:text-base font-medium shadow-sm hover:shadow-md"
                                >
                                    হোমপেজে যান
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50/30 py-4 sm:py-6 lg:py-8">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                {/* Back Button */}
                <div className="mb-4 sm:mb-6">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-all duration-200 text-gray-700 text-sm sm:text-base shadow-sm hover:shadow-md"
                    >
                        <GrFormPrevious className="text-lg" />
                        <span className="hidden xs:inline">পিছনে যান</span>
                        <span className="xs:hidden">পিছনে</span>
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-2 sm:mb-3">
                            <GrContact className="text-white text-xl sm:text-2xl shrink-0" />
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight">
                                সভাপতির বাণী
                            </h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex flex-col xl:flex-row gap-6 lg:gap-8 items-start">
                            {/* Image Section */}
                            {speech.image && (
                                <div className="w-full xl:w-1/3 flex justify-center order-2 xl:order-1">
                                    <div className="w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 xl:w-72 xl:h-72 rounded-lg overflow-hidden border border-gray-200 shadow-lg bg-gray-100">
                                        <img 
                                            src={image} 
                                            alt="সভাপতি"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="hidden w-full h-full items-center justify-center bg-gray-200">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Speech Content */}
                            <div className={`${speech.image ? 'w-full xl:w-2/3 order-1 xl:order-2' : 'w-full'}`}>
                                <div 
                                    className="text-gray-700 leading-relaxed text-justify prose prose-sm sm:prose-base lg:prose-lg max-w-none
                                    prose-headings:text-gray-900
                                    prose-p:text-gray-700
                                    prose-strong:text-gray-900
                                    prose-em:text-gray-700
                                    prose-ul:text-gray-700
                                    prose-ol:text-gray-700
                                    prose-li:text-gray-700
                                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                    prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50
                                    prose-img:rounded-lg prose-img:shadow-sm"
                                    dangerouslySetInnerHTML={{ __html: speech.body }}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-200">
                            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 text-xs sm:text-sm text-gray-500">
                                <div className="space-y-2">
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">প্রকাশের তারিখ:</span>
                                        <span>{new Date(speech.createdAt).toLocaleDateString('bn-BD', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-700">সর্বশেষ আপডেট:</span>
                                        <span>{new Date(speech.updatedAt).toLocaleDateString('bn-BD', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</span>
                                    </p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                                    speech.isActive 
                                        ? 'bg-green-100 text-green-800 border border-green-200' 
                                        : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                    {speech.isActive ? ' সক্রিয়' : '❌ নিষ্ক্রিয়'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Actions */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <MainButton
                        onClick={handleGoBack}
                    >
                        পিছনে যান
                    </MainButton>
                    <MainButton
                        onClick={handleGoHome}
                    >
                        হোমপেজে ফিরে যান
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default PresidentDetails;