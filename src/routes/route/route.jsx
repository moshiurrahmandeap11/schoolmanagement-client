import { createBrowserRouter } from "react-router";
import Login from "../../components/authItems/Login/Login";
import SignUp from "../../components/authItems/SignUp/SignUp";
import BlogDetails from "../../components/BlogNav/BlogDetails/BlogDetails";
import BlogNav from "../../components/BlogNav/BlogNav";
import NormalDashboard from "../../components/DashboardComponent/NormalDashboard/NormalDashboard";
import AdmissionFormAdmin from "../../components/DashboardComponent/SuperDashboard/Sidebar/AdmissionFormAdmin/AdmissionFormAdmin";
import SuperDashboard from "../../components/DashboardComponent/SuperDashboard/SuperDashboard";
import Downloads from "../../components/Downloads/Downloads";
import PhotoGalleryNav from "../../components/Gallary/PhotoGallaryNav/PhotoGalleryNav";
import VideoGallaryNav from "../../components/Gallary/VideoGallaryNav/VideoGallaryNav";
import AllNotices from "../../components/Notices/AllNotices/AllNotices";
import NoticeDetails from "../../components/Notices/NoticeDetails/NoticeDetails";
import Notices from "../../components/Notices/Notices";
import PrivacyPolicy from "../../components/PrivacyPolicy/PrivacyPolicy";
import ManagingCommittee from "../../components/sharedItems/Footer/SubFooter/ManagingCommittee/ManagingCommittee";
import UpazillaHistory from "../../components/sharedItems/Footer/SubFooter/UpazillaHistory/UpazillaHistory";
import ZillaHistory from "../../components/sharedItems/Footer/SubFooter/ZillaHistory/ZillaHistory";
import TermsAndConditions from "../../components/TermsAndCondtions/TermsAndConditions";
import AdminProtectedRoute from "../../hooks/ProtectedRoute/ProtectedRoute";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import RootLayout from "../../layouts/RootLayout/RootLayout";
import About from "../../pages/About/About";
import Announcement from "../../pages/Announcement/Announcement";
import Author from "../../pages/Author/Author";
import Contact from "../../pages/Contact/Contact";
import MultimediaClassroom from "../../pages/Home/AcademincInfo/MultimediaClassroom/MultimediaClassroom";
import Circulars from "../../pages/Home/DownloadInfo/Circulars/Circulars";
import Routine from "../../pages/Home/DownloadInfo/Routine/Routine";
import Home from "../../pages/Home/Home";
import PresidentDetails from "../../pages/Home/President/PresidentDetails/PresidentDetails";
import PrincipalSpeechDetails from "../../pages/Home/PrincipalSpeech/PrincipalSpeechDetails/PrincipalSpeechDetails";
import AdmissionInfo from "../../pages/Home/Students/AdmissionINfo/AdmissionInfo";
import ClassRoomsClient from "../../pages/Home/Students/ClassRoomsClient/ClassRoomsClient";
import SeatNumbers from "../../pages/Home/Students/SeatNumbers/SeatNumbers";
import StudentsInfo from "../../pages/Home/Students/StudentsInfo/StudentsInfo";
import HeadmasterList from "../../pages/Home/Teachers/HeadmasterList/HeadmasterList";
import HolidayList from "../../pages/Home/Teachers/HolidayList/HolidayList";
import TeachersList from "../../pages/Home/Teachers/TeachersList/TeachersList";
import WorkersList from "../../pages/Home/Teachers/WorkersList/WorkersList";
import Results from "../../pages/Results/Results";
import SchoolHistoryDetails from "../../pages/SchoolHistoryDetails/SchoolHistoryDetails";

export const route = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout></RootLayout>,
    children: [
        { index: true, element: <Home></Home> },
        { path: "/about", element: <About></About>},
        { path: "/author", element: <Author></Author>},
        { path: "/results", element: <Results></Results>},
        { path: "/contact", element: <Contact></Contact>},
        { path: "/terms-and-conditions", element: <TermsAndConditions></TermsAndConditions> },
        { path: "/privacy-policy", element: <PrivacyPolicy></PrivacyPolicy> },
        { path: "/announcement/:id", element: <Announcement></Announcement>},
        { path: "/school-history/:id", element: <SchoolHistoryDetails></SchoolHistoryDetails>},
        { path: "/principal-speech/:id", element: <PrincipalSpeechDetails></PrincipalSpeechDetails>},
        { path: "/president-speech/:id", element: <PresidentDetails></PresidentDetails>},
        { path: "/students-info", element: <StudentsInfo></StudentsInfo>},
        { path: "/seat-numbers", element: <SeatNumbers></SeatNumbers>},
        { path: "/class-rooms", element: <ClassRoomsClient></ClassRoomsClient>},
        { path: "/admission-info", element: <AdmissionInfo></AdmissionInfo>},
        { path: "/admission-form", element: <AdmissionFormAdmin></AdmissionFormAdmin>},
        { path: "/teachers-list", element: <TeachersList></TeachersList>},
        { path: "/staff-list", element: <WorkersList></WorkersList>},
        { path: "/head-teachers-list", element: <HeadmasterList></HeadmasterList>},
        { path: "/holiday-list", element: <HolidayList></HolidayList>},
        { path: "/video-gallery", element: <VideoGallaryNav></VideoGallaryNav>},
        { path: "/photo-gallery", element: <PhotoGalleryNav></PhotoGalleryNav>},
        { path: "/blog", element: <BlogNav></BlogNav>},
        { path: "/blog-details/:id", element: <BlogDetails></BlogDetails>},
        { path: "/managing-committee", element: <ManagingCommittee></ManagingCommittee>},
        { path: "/upazilla-history", element: <UpazillaHistory></UpazillaHistory>},
        { path: "/zilla-history", element: <ZillaHistory></ZillaHistory>},
        { path: "/downloads", element: <Downloads></Downloads>},
        { path: "/notices", element: <Notices></Notices>},
        { path: "/notice-details/:id", element: <NoticeDetails></NoticeDetails>},
        { path:"/all-notices", element: <AllNotices></AllNotices>},
        { path: "/routine", element: <Routine></Routine>},
        { path: "/circulars", element: <Circulars></Circulars>},
        { path: "/multimedia-classroom", element: <MultimediaClassroom></MultimediaClassroom>},
    ],
  },
  {
    path: "/auth",
    element: <AuthLayout></AuthLayout>,
    children: [
        {
            path: "login",
            element: <Login></Login>
        },
        {
            path: "signup",
            element: <SignUp></SignUp>
        }
    ]
  },
{
  path: "/",
  element: <DashboardLayout />,
  children: [
    {
      path: "dashboard",
      element: <NormalDashboard />
    },
    {
      path: "super/dashboard",
      element: (
        <AdminProtectedRoute>
          <SuperDashboard />
        </AdminProtectedRoute>
      )
    }
  ]
}
]);
