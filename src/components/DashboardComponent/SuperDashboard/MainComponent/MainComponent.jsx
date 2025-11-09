// MainComponent/MainComponent.jsx
import AdmissionFormAdmin from "../Sidebar/AdmissionFormAdmin/AdmissionFormAdmin";
import AdmissionInfoAdmin from "../Sidebar/AdmissionInfo/AdmissionInfoAdmin";
import BlogsAdmin from "../Sidebar/BlogsAdmin/BlogsAdmin";
import CircularAdmin from "../Sidebar/CircularAdmin/CircularAdmin";
import ClassRooms from "../Sidebar/ClassRooms/ClassRooms";
import ContactInfoAdmin from "../Sidebar/ContactInfoAdmin/ContactInfoAdmin";
import HeadmastersListAdmin from "../Sidebar/HeadmastersListAdmin/HeadmastersListAdmin";
import HolidayListAdmin from "../Sidebar/HolidayListAdmin/HolidayListAdmin";
import ManagingCommitteeAdmin from "../Sidebar/ManagingCommitteeAdmin/ManagingCommitteeAdmin";
import NoticesAdmin from "../Sidebar/NoticesAdmin/NoticesAdmin";
import PhotoGallaryAdmin from "../Sidebar/PhotoGallaryAdmin/PhotoGallaryAdmin";
import RecentlyAdmin from "../Sidebar/RecentlyAdmin/RecentlyAdmin";
import RoutineAdmin from "../Sidebar/RoutineAdmin/RoutineAdmin";
import SchoolHistory from "../Sidebar/SchoolHistory/SchoolHistory";
import SDashboardItems from "../Sidebar/SDashboardItems/SDashboardItems";
import Settings from "../Sidebar/Settings/Settings";
import SpeechAdmin from "../Sidebar/SpeechAdmin/SpeechAdmin";
import StudentsAdmin from "../Sidebar/StudentsAdmin/StudentsAdmin";
import TeacherListAdmin from "../Sidebar/TeachersListAdmin/TeacherListAdmin";
import TotalSeats from "../Sidebar/TotalSeats/TotalSeats";
import UpazillaHistoryAdmin from "../Sidebar/UpazillaHistoryAdmin/UpazillaHistoryAdmin";
import VideoGallaryAdmin from "../Sidebar/VideoGallaryAdmin/VideoGallaryAdmin";
import WorkersListAdmin from "../Sidebar/WorkersListAdmin/WorkersListAdmin";
import ZillaHistoryAdmin from "../Sidebar/ZillaHistoryAdmin/ZillaHistoryAdmin";

// সব SDashboardItems কম্পোনেন্ট
import Batch from "../Sidebar/Class/Batch/Batch";
import Section from "../Sidebar/Class/Section/Section";
import Session from "../Sidebar/Class/Session/Session";
import Subjects from "../Sidebar/Class/Subjects/Subjects";
import AcademicManagement from "../Sidebar/SDashboardItems/AcademicManagement/AcademicManagement";
import AccountsManagement from "../Sidebar/SDashboardItems/AccountsManagement/AccountsManagement";
import AttendanceManagement from "../Sidebar/SDashboardItems/AttendanceManagement/AttendanceManagement";
import BranchManagement from "../Sidebar/SDashboardItems/Branch/Branch";
import CertificateManagement from "../Sidebar/SDashboardItems/CertificateManagement/CertificateManagement";
import DepartmentManagement from "../Sidebar/SDashboardItems/DepartmentManagement/DepartmentManagement";
import DonationManagement from "../Sidebar/SDashboardItems/DonationManagement/DonationManagement";
import ExaminationManagement from "../Sidebar/SDashboardItems/ExaminationManagement/ExaminationManagement";
import FeeManagement from "../Sidebar/SDashboardItems/FeeManagement/FeeManagement";
import PrintManagement from "../Sidebar/SDashboardItems/PrintManagement/PrintManagement";
import SalaryBonusManagement from "../Sidebar/SDashboardItems/SalaryBonusManagement/SalaryBonusManagement";
import SMSManagement from "../Sidebar/SDashboardItems/SMSManagement/SMSManagement";
import InstituteInfo from "../Sidebar/SDashboardItems/WebsiteManagement/InstitueInfo/InstituteInfo";
import PrivacyPolicy from "../Sidebar/SDashboardItems/WebsiteManagement/PrivacyPolicy/PrivacyPolicy";
import SocialLinks from "../Sidebar/SDashboardItems/WebsiteManagement/SocialLinks/SocialLinks";
import WebsiteManagement from "../Sidebar/SDashboardItems/WebsiteManagement/WebsiteManagement";
import StudentsMenu from "../Sidebar/Students/StudentsMenu/StudentsMenu";

const MainComponent = ({ activeMenu, onDashboardItemClick }) => { // প্রপ রিসিভ করা হলো
  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <SDashboardItems onItemClick={onDashboardItemClick} />; // প্রপ পাস

      case "branch-management":
        return <BranchManagement />;
      case "donation-management":
        return <DonationManagement />;
      case "certificate-management":
        return <CertificateManagement />;
      case "salary-bonus-management":
        return <SalaryBonusManagement />;
      case "website-management":
        return <WebsiteManagement />;
      case "academic-management":
        return <AcademicManagement />;
      case "examination-management":
        return <ExaminationManagement />;
      case "accounts-management":
        return <AccountsManagement />;
      case "fee-management":
        return <FeeManagement />;
      case "print-management":
        return <PrintManagement />;
      case "sms-management":
        return <SMSManagement />;
      case "attendance-management":
        return <AttendanceManagement />;
      case "department-management":
        return <DepartmentManagement />;
      case "teachers-staffs":
        return <TeacherListAdmin></TeacherListAdmin>
      case "institute-info":
        return <InstituteInfo></InstituteInfo>
      case "update-images":
        return <Settings></Settings>
      case "history":
        return <SchoolHistory></SchoolHistory>
      case "social-links":
        return <SocialLinks></SocialLinks>
      case "privacy-policy":
        return <PrivacyPolicy></PrivacyPolicy>

      case "announcement":
        return <RecentlyAdmin />;
      case "school-history":
        return <SchoolHistory />;
      case "speech":
        return <SpeechAdmin />;
      case "students":
        return <StudentsAdmin />;
      case "total-seats":
        return <TotalSeats />;
      case "class-rooms":
        return <ClassRooms />;
      case "admission-info":
        return <AdmissionInfoAdmin />;
      case "admission-form":
        return <AdmissionFormAdmin />;
      case "teacher-list":
        return <TeacherListAdmin />;
      case "workers-list":
        return <WorkersListAdmin />;
      case "headmasters-list":
        return <HeadmastersListAdmin />;
      case "off-days":
        return <HolidayListAdmin />;
      case "circular":
        return <CircularAdmin />;
      case "video-gallery":
        return <VideoGallaryAdmin />;
      case "photo-gallery":
        return <PhotoGallaryAdmin />;
      case "blogs":
        return <BlogsAdmin />;
      case "managing":
        return <ManagingCommitteeAdmin />;
      case "upazilla-history":
        return <UpazillaHistoryAdmin />;
      case "zilla-history":
        return <ZillaHistoryAdmin />;
      case "contact-info":
        return <ContactInfoAdmin />;
      case "notice":
        return <NoticesAdmin />;
      case "routine":
        return <RoutineAdmin />;
      case "settings":
        return <Settings />;
      case "section":
        return <Section></Section>
      case "patthokrom":
        return <Subjects></Subjects>
      case "students-submenu":
        return <StudentsMenu></StudentsMenu>
      case "session":
        return <Session></Session>
      case "batch":
        return <Batch></Batch>

      case "profile":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">ব্যবহারকারী প্রোফাইল</h1>
              <p className="text-gray-600 mt-2">আপনার প্রোফাইল তথ্য দেখুন এবং এডিট করুন।</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">A</span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">আপনার নাম</h2>
                  <p className="text-gray-600">অ্যাডমিন ব্যবহারকারী</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><p className="font-medium">পুরো নাম:</p><p>আপনার পুরো নাম</p></div>
                <div><p className="font-medium">ইমেইল:</p><p>your@email.com</p></div>
                <div><p className="font-medium">ভূমিকা:</p><p>অ্যাডমিন</p></div>
                <div><p className="font-medium">সদস্য since:</p><p>১ জানুয়ারি, ২০২৪</p></div>
              </div>
              <div className="mt-6 flex gap-4">
                <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                  প্রোফাইল এডিট করুন
                </button>
                <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  পাসওয়ার্ড পরিবর্তন
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                সুপার ড্যাশবোর্ডে স্বাগতম
              </h1>
              <p className="text-gray-600 text-lg">
                বাম পাশের মেনু থেকে কোনো অপশন সিলেক্ট করুন
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <main className="flex-1 bg-gray-50 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="p-4 sm:p-6 lg:p-8">
        {renderContent()}
      </div>
    </main>
  );
};

export default MainComponent;