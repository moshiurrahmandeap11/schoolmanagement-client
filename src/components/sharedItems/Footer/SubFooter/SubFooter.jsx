import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router';
import axiosInstance from '../../../../hooks/axiosInstance/axiosInstance';
import Loader from '../../Loader/Loader';

const SubFooter = () => {
    const [contactData, setContactData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchContactData();
    }, []);

    const fetchContactData = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/contact-info');
            
            if (response.data.success) {
                setContactData(response.data.data);
            } else {
                setError('Failed to load contact information');
            }
        } catch (error) {
            console.error('Error fetching contact data:', error);
            setError('Failed to load contact information');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-slate-600 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !contactData) {
        return (
            <div className="bg-slate-600 text-white py-12 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* পরিচিতি Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">পরিচিতি</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start">
                                <Link to={"/school-history/68f6b049363d04a4cde04a85"}>
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>বিদ্যালয়ের ইতিহাস</span>
                                </Link>
                            </li>
                            <li className="flex items-start">
                                <Link to={"/managing-committee"}>
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>ম্যানেজিং কমিটি</span>
                                </Link>
                            </li>
                            <li className="flex items-start">
                                <Link to={"/upazilla-history"}>
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>উপজেলার ইতিহাস</span>
                                </Link>
                            </li>
                            <li className="flex items-start">
                                <Link to={"/zilla-history"}>
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>জেলার ইতিহাস</span>
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* গুরুত্বপূর্ণ লিংক Section */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">গুরুত্বপূর্ণ লিংক</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start">
                                <a href="https://shed.gov.bd/" target='_blank' rel="noopener noreferrer">
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>শিক্ষা মন্ত্রণালয়</span>
                                </a>
                            </li>
                            <li className="flex items-start">
                                <a href="https://shed.gov.bd/" target='_blank' rel="noopener noreferrer">
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>মাধ্যমিক ও উচ্চ শিক্ষা বিভাগ</span>
                                </a>
                            </li>
                            <li className="flex items-start">
                                <a href="https://banbeis.gov.bd/" target='_blank' rel="noopener noreferrer">
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>ব্যানবেইজ</span>
                                </a>
                            </li>
                            <li className="flex items-start">
                                <a href="https://moedu.portal.gov.bd/site/page/85e59742-134c-4888-bd08-bf286f038fdd" target='_blank' rel="noopener noreferrer">
                                    <span className="text-yellow-400 mr-2">+</span>
                                    <span className='hover:underline'>সেকেরেপ</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* যোগাযোগ Section - Fallback Data */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">যোগাযোগ</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start">
                                <MapPin className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                                <span>সুচীপাড়া, শাহরাষ্টি, চাঁদপুর।</span>
                            </li>
                            <li className="flex items-start">
                                <Phone className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                                <span>+8801309-103968, +8801715-631556</span>
                            </li>
                            <li className="flex items-start">
                                <Mail className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                                <span>suchiparahighschool@gmail.com</span>
                            </li>
                            <li className="flex items-start">
                                <Star className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                                <span>EIIN- 103968</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-slate-600 text-white py-12 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* পরিচিতি Section */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">পরিচিতি</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                            <Link to={"/school-history/68f6b049363d04a4cde04a85"}>
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>বিদ্যালয়ের ইতিহাস</span>
                            </Link>
                        </li>
                        <li className="flex items-start">
                            <Link to={"/managing-committee"}>
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>ম্যানেজিং কমিটি</span>
                            </Link>
                        </li>
                        <li className="flex items-start">
                            <Link to={"/upazilla-history"}>
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>উপজেলার ইতিহাস</span>
                            </Link>
                        </li>
                        <li className="flex items-start">
                            <Link to={"/zilla-history"}>
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>জেলার ইতিহাস</span>
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* গুরুত্বপূর্ণ লিংক Section */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">গুরুত্বপূর্ণ লিংক</h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start">
                            <a href="https://shed.gov.bd/" target='_blank' rel="noopener noreferrer">
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>শিক্ষা মন্ত্রণালয়</span>
                            </a>
                        </li>
                        <li className="flex items-start">
                            <a href="https://shed.gov.bd/" target='_blank' rel="noopener noreferrer">
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>মাধ্যমিক ও উচ্চ শিক্ষা বিভাগ</span>
                            </a>
                        </li>
                        <li className="flex items-start">
                            <a href="https://banbeis.gov.bd/" target='_blank' rel="noopener noreferrer">
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>ব্যানবেইজ</span>
                            </a>
                        </li>
                        <li className="flex items-start">
                            <a href="https://moedu.portal.gov.bd/site/page/85e59742-134c-4888-bd08-bf286f038fdd" target='_blank' rel="noopener noreferrer">
                                <span className="text-yellow-400 mr-2">+</span>
                                <span className='hover:underline'>সেকেরেপ</span>
                            </a>
                        </li>
                    </ul>
                </div>

                {/* যোগাযোগ Section - Dynamic from API */}
                <div>
                    <h3 className="text-xl font-bold mb-6 border-b-2 border-yellow-400 pb-2 inline-block">যোগাযোগ</h3>
                    <ul className="space-y-4 text-sm">
                        <li className="flex items-start">
                            <MapPin className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                            <span>{contactData.address}</span>
                        </li>
                        <li className="flex items-start">
                            <Phone className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                            <span>
                                {contactData.phone1}
                                {contactData.phone2 && `, ${contactData.phone2}`}
                            </span>
                        </li>
                        <li className="flex items-start">
                            <Mail className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                            <span>{contactData.email}</span>
                        </li>
                        <li className="flex items-start">
                            <Star className="w-4 h-4 text-yellow-400 mr-3 mt-1 flex-shrink-0" />
                            <span>EIIN- {contactData.eiin}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SubFooter;