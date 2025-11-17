import { useEffect, useState } from 'react';
import { GrContact } from 'react-icons/gr';
import { useNavigate } from 'react-router';
import Loader from '../../../components/sharedItems/Loader/Loader';
import MainButton from '../../../components/sharedItems/Mainbutton/Mainbutton';
import axiosInstance from '../../../hooks/axiosInstance/axiosInstance';

const PrincipalSpeech = () => {
    const [speech, setSpeech] = useState(null);
    const [loading, setLoading] = useState(true);
    const [displayText, setDisplayText] = useState('');
    const [isTruncated, setIsTruncated] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSpeech();
    }, []);

    useEffect(() => {
        if (speech?.body) {
            // Strip HTML tags and get plain text
            const plainText = speech.body.replace(/<[^>]*>/g, '');
            
            // Check if text is longer than 40 characters
            if (plainText.length > 40) {
                setDisplayText(plainText.substring(0, 160) + '...');
                setIsTruncated(true);
            } else {
                setDisplayText(plainText);
                setIsTruncated(false);
            }
        }
    }, [speech]);

    const fetchSpeech = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/speeches');
            
            if (response.data.success) {
                const principalSpeech = response.data.data.find(s => s.type === 'principal' && s.isActive);
                setSpeech(principalSpeech);
            }
        } catch (error) {
            console.error('Error fetching principal speech:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReadMore = () => {
        if (speech?._id) {
            navigate(`/principal-speech/${speech._id}`);
        }
    };

    const imageUrl = axiosInstance.defaults.baseURL;
    const imageLink = speech?.image;
    const image = imageUrl + imageLink;

    if (loading) {
        return <Loader></Loader>;
    }

    if (!speech) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-2xl my-2 mx-2 px-5 bg-[#051939] sm:text-xl py-3 font-bold text-white leading-tight flex items-center gap-2 rounded">
                    <GrContact className="text-white text-xl" />
                    প্রধান শিক্ষকের বাণী
                </h2>
                <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                        <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-lg">প্রধান শিক্ষকের বাণী এখনো যুক্ত করা হয়নি</p>
                    <p className="text-gray-400 text-sm mt-2">শীঘ্রই আপডেট করা হবে</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <h2 className="text-2xl my-2 mx-2 px-5 bg-[#016496] sm:text-xl py-3 font-bold text-white leading-tight flex items-center gap-2 rounded">
                <GrContact className="text-white text-xl" />
                প্রধান শিক্ষকের বাণী
            </h2>
            
            <div className="p-6">
                <div className={`${speech.image ? 'flex flex-col md:flex-row gap-6 items-start' : ''}`}>
                    {/* Image Section - Right Side */}
                    {speech.image && (
                        <div className="md:w-1/3 flex justify-center md:justify-end order-2 md:order-2">
                            <div className="w-48 h-48 rounded-sm overflow-hidden border border-gray-200 shadow-md">
                                <img 
                                    src={image} 
                                    alt="প্রধান শিক্ষক"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    )}

                    {/* Speech Content */}
                    <div className={`${speech.image ? 'md:w-2/3 order-1 md:order-1' : 'w-full'}`}>
                        <div className="text-gray-700 leading-relaxed text-justify">
                            <p className="mb-4">{displayText}</p>
                            
                            {isTruncated && (
                                <MainButton
                                    onClick={handleReadMore}
                                >
                                    আরও পড়ুন
                                </MainButton>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrincipalSpeech;