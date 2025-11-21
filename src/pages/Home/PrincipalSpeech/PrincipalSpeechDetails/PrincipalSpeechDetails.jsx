import { useEffect, useState } from 'react';
import { GrContact, GrFormPrevious } from 'react-icons/gr';
import { useNavigate, useParams } from 'react-router';
import Loader from '../../../../components/sharedItems/Loader/Loader';
import MainButton from '../../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance, { baseImageURL } from '../../../../hooks/axiosInstance/axiosInstance';

const PrincipalSpeechDetails = () => {
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


    if (loading) {
        return <Loader></Loader>
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-12">
                            <div className="text-red-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">ত্রুটি!</h3>
                            <p className="text-gray-600 mb-6">{error}</p>
                            <button
                                onClick={handleGoBack}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                পিছনে যান
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!speech) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="text-center py-12">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">স্পিচ পাওয়া যায়নি</h3>
                            <p className="text-gray-600 mb-6">আপনি যে স্পিচটি খুঁজছেন তা পাওয়া যায়নি</p>
                            <button
                                onClick={handleGoBack}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                            >
                                পিছনে যান
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1e90c9] transition-colors text-gray-700"
                    >
                        <GrFormPrevious className="text-lg" />
                        পিছনে যান
                    </button>
                </div>

                {/* Main Content Card */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-[#051939] text-white p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <GrContact className="text-white text-2xl" />
                            <h1 className="text-3xl font-bold">প্রধান শিক্ষকের বাণী</h1>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                            {/* Image Section */}
                            {speech.image && (
                                <div className="lg:w-1/3 flex justify-center">
                                    <div className="w-64 h-64 rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                                        <img 
                                            src={`${baseImageURL}${speech?.image}`} 
                                            alt="প্রধান শিক্ষক"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Speech Content */}
                            <div className={`${speech.image ? 'lg:w-2/3' : 'w-full'}`}>
                                <div 
                                    className="text-gray-700 leading-relaxed text-justify prose prose-lg max-w-none"
                                    dangerouslySetInnerHTML={{ __html: speech.body }}
                                />
                            </div>
                        </div>

                        {/* Metadata */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm text-gray-500">
                                <div>
                                    <p><strong>প্রকাশের তারিখ:</strong> {new Date(speech.createdAt).toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                    <p><strong>সর্বশেষ আপডেট:</strong> {new Date(speech.updatedAt).toLocaleDateString('bn-BD', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    speech.isActive 
                                        ? 'bg-[#1e90c9] text-white' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {speech.isActive ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Actions */}
                <div className="mt-6 flex justify-center">
                    <MainButton
                        onClick={handleGoBack}
                    >
                        হোমপেজে ফিরে যান
                    </MainButton>
                </div>
            </div>
        </div>
    );
};

export default PrincipalSpeechDetails;