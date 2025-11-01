import React from 'react';
import { MapPin, Phone, Mail, Star } from 'lucide-react';
import { Link } from 'react-router';

const SubFooter = () => {
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
                            <span className="text-yellow-400 mr-2">+</span>
                            <span>শিক্ষা মন্ত্রণালয়</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 mr-2">+</span>
                            <span>মাধ্যমিক ও উচ্চ শিক্ষা বিভাগ</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 mr-2">+</span>
                            <span>ব্যানবেইজ</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-yellow-400 mr-2">+</span>
                            <span>সেকেরেপ</span>
                        </li>
                    </ul>
                </div>

                {/* যোগাযোগ Section */}
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
};

export default SubFooter;