import { useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../../Loader/Loader';

const UpazillaHistory = () => {
    const [upazillaData, setUpazillaData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchUpazillaData();
    }, []);

    const fetchUpazillaData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/area-history/upazilla');
            
            if (response.data.success) {
                setUpazillaData(response.data.data);
            } else {
                setError('Failed to load upazilla history');
            }
        } catch (error) {
            console.error('Error fetching upazilla data:', error);
            setError('Failed to load upazilla history');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-red-200 p-8 text-center max-w-md w-full">
                    <div className="text-red-500 text-4xl mb-3">⚠️</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">লোড করতে সমস্যা</h3>
                    <p className="text-red-500 text-sm mb-4">{error}</p>
                    <button
                        onClick={fetchUpazillaData}
                        className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                    >
                        আবার চেষ্টা করুন
                    </button>
                </div>
            </div>
        );
    }

    if (!upazillaData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center max-w-md w-full">
                    <div className="text-6xl mb-4">🏛️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">উপজেলা ইতিহাস পাওয়া যায়নি</h3>
                    <p className="text-gray-600">শীঘ্রই উপজেলা ইতিহাস আপডেট করা হবে</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Main Content */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Map Section */}
                    {upazillaData.googleMapLocation && (
                        <div className="relative h-80 sm:h-96 lg:h-[500px]">
                            <iframe
                                src={upazillaData.googleMapLocation}
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="বুড়িচং উপজেলা ম্যাপ"
                                className="absolute inset-0"
                            />
                        </div>
                    )}

                    {/* Description Section */}
                    <div className="p-6 sm:p-8 lg:p-12">
                        <div className="max-w-4xl mx-auto">
                            {/* History Title */}
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-800 mb-4">
                                    উপজেলা পরিচিতি
                                </h2>
                            </div>

                            {/* History Content */}
                            <div 
                                className="prose prose-lg max-w-none 
                                          prose-headings:text-gray-800 prose-headings:font-bold
                                          prose-h2:text-2xl prose-h3:text-xl
                                          prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-justify
                                          prose-strong:text-gray-900
                                          prose-em:text-gray-600
                                          prose-ul:text-gray-700 prose-ol:text-gray-700
                                          prose-li:text-gray-700
                                          prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:px-6 prose-blockquote:py-4
                                          prose-blockquote:rounded-lg
                                          prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                                          prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                                          prose-table:border-gray-300 prose-table:rounded-lg
                                          prose-th:bg-gray-100 prose-th:text-gray-800
                                          prose-td:border-gray-300"
                                dangerouslySetInnerHTML={{ __html: upazillaData.description }}
                            />

                            {/* Last Updated */}
                            {upazillaData.updatedAt && (
                                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                                    <p className="text-sm text-gray-500">
                                        সর্বশেষ আপডেট: {new Date(upazillaData.updatedAt).toLocaleDateString('bn-BD', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .prose {
                    line-height: 1.8;
                }
                
                .prose p {
                    margin-bottom: 1.5em;
                    text-align: justify;
                }
                
                .prose h2 {
                    margin-top: 2em;
                    margin-bottom: 1em;
                    border-bottom: 2px solid #e5e7eb;
                    padding-bottom: 0.5em;
                }
                
                .prose h3 {
                    margin-top: 1.5em;
                    margin-bottom: 0.75em;
                }
                
                .prose ul, .prose ol {
                    margin-bottom: 1.5em;
                }
                
                .prose li {
                    margin-bottom: 0.5em;
                }
                
                .prose blockquote {
                    margin: 2em 0;
                    font-style: italic;
                }
                
                .prose img {
                    margin: 2em auto;
                }

                /* Responsive improvements */
                @media (max-width: 640px) {
                    .prose {
                        font-size: 0.95rem;
                    }
                    
                    .prose h2 {
                        font-size: 1.5rem;
                    }
                    
                    .prose h3 {
                        font-size: 1.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default UpazillaHistory;