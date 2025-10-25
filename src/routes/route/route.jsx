import { createBrowserRouter } from "react-router";
import RootLayout from "../../layouts/RootLayout/RootLayout";
import Home from "../../pages/Home/Home";
import AuthLayout from "../../layouts/AuthLayout/AuthLayout";
import Login from "../../components/authItems/Login/Login";
import SignUp from "../../components/authItems/SignUp/SignUp";
import TermsAndConditions from "../../components/TermsAndCondtions/TermsAndConditions";
import PrivacyPolicy from "../../components/PrivacyPolicy/PrivacyPolicy";
import About from "../../pages/About/About";
import Author from "../../pages/Author/Author";
import Results from "../../pages/Results/Results";
import Contact from "../../pages/Contact/Contact";
import DashboardLayout from "../../layouts/DashboardLayout/DashboardLayout";
import NormalDashboard from "../../components/DashboardComponent/NormalDashboard/NormalDashboard";
import SuperDashboard from "../../components/DashboardComponent/SuperDashboard/SuperDashboard";
import Announcement from "../../pages/Announcement/Announcement";
import SchoolHistoryDetails from "../../pages/SchoolHistoryDetails/SchoolHistoryDetails";
import PrincipalSpeechDetails from "../../pages/Home/PrincipalSpeech/PrincipalSpeechDetails/PrincipalSpeechDetails";
import PresidentDetails from "../../pages/Home/President/PresidentDetails/PresidentDetails";
import StudentsInfo from "../../pages/Home/Students/StudentsInfo/StudentsInfo";
import SeatNumbers from "../../pages/Home/Students/SeatNumbers/SeatNumbers";
import ClassRoomsClient from "../../pages/Home/Students/ClassRoomsClient/ClassRoomsClient";
import AdmissionInfo from "../../pages/Home/Students/AdmissionINfo/AdmissionInfo";
import AdmissionForm from "../../pages/Home/Students/AdmissionForm/AdmissionForm";
import TeachersList from "../../pages/Home/Teachers/TeachersList/TeachersList";
import WorkersList from "../../pages/Home/Teachers/WorkersList/WorkersList";
import HeadmasterList from "../../pages/Home/Teachers/HeadmasterList/HeadmasterList";
import HolidayList from "../../pages/Home/Teachers/HolidayList/HolidayList";

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
        { path: "/admission-form", element: <AdmissionForm></AdmissionForm>},
        { path: "/teachers-list", element: <TeachersList></TeachersList>},
        { path: "/staff-list", element: <WorkersList></WorkersList>},
        { path: "/head-teachers-list", element: <HeadmasterList></HeadmasterList>},
        { path: "/holiday-list", element: <HolidayList></HolidayList>},
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
    element: <DashboardLayout></DashboardLayout>,
    children: [
      {
        path: "dashboard",
        element: <NormalDashboard></NormalDashboard>
      },
      {
        path: "super/dashboard",
        element: <SuperDashboard></SuperDashboard>
      }
    ]
  }
]);
