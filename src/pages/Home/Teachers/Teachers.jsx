import { GiHamburgerMenu } from 'react-icons/gi';
import { useNavigate } from 'react-router';
import icon from "../../../../public/Teacher-Icon.png";

const Teachers = () => {
    const navigate = useNavigate();
    
    const teacherInfo = [
        { 
            text: "শিক্ষকমণ্ডলীর তালিকা", 
            path: "/teachers-list" 
        },
        { 
            text: "কর্মকর্তা-কর্মচারীদের তালিকা", 
            path: "/staff-list" 
        },
        { 
            text: "প্রধান শিক্ষকগণের নামের তালিকা", 
            path: "/head-teachers-list" 
        },
        { 
            text: "ছুটির তালিকা", 
            path: "/holiday-list" 
        },
        { 
            text: "সার্কুলার", 
            path: "/circulars" 
        }
    ];

    const handleItemClick = (path) => {
        navigate(path);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <h2 className="text-2xl my-2 mx-2 px-5 bg-[#016496] sm:text-xl py-3 font-bold text-white leading-tight flex items-center gap-2 rounded">
                <GiHamburgerMenu className="text-white text-lg sm:text-xl flex-shrink-0" />
                শিক্ষক ও কর্মচারীবৃন্দ
            </h2>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
                {/* Horizontal Layout - Image and List side by side */}
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4 sm:gap-6 lg:gap-8">
                    {/* Image Section */}
                    <div className="flex-shrink-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-36 lg:h-36 bg-gray-100 rounded-full flex items-center justify-center">
                            <img 
                                src={icon} 
                                alt="শিক্ষক ও কর্মচারী আইকন"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    {/* Information List */}
                    <div className="flex-1 w-full">
                        <div>
                            {teacherInfo.map((item, index) => (
                                <div 
                                    key={index}
                                    onClick={() => handleItemClick(item.path)}
                                    className="flex items-center gap-3 cursor-pointer group"
                                >
                                    {/* Check Mark */}
                                    <svg className="w-3 h-3 text-[#06874A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                    
                                    {/* Text with Hover Underline */}
                                    <span className="text-gray-700 text-sm sm:text-base font-medium leading-relaxed group-hover:text-[#06874A] transition-colors duration-200 relative">
                                        {item.text}
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#06874A] transition-all duration-200 group-hover:w-full"></span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Teachers;