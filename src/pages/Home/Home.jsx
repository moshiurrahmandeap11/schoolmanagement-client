import React from "react";
import Banner from "./Banner/Banner";
import Recently from "./Recently/Recently";
import HistorySchool from "./HistorySchool/HistorySchool";
import President from "./President/President";
import PrincipalSpeech from "./PrincipalSpeech/PrincipalSpeech";
import Students from "./Students/Students";
import Teachers from "./Teachers/Teachers";
import DownloadInfo from "./DownloadInfo/DownloadInfo";
import AcademicInfo from "./AcademincInfo/AcademicInfo";
import Login from "../../components/authItems/Login/Login";
import Notices from "../../components/Notices/Notices";
import FacebookPage from "../../components/FacebookPage/FacebookPage";
import GovtImage from "../../components/GovtImage/GovtImage";
import { BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router";
import AllTeachersAndWorkers from "./AllTeachersAndWorkers/AllTeachersAndWorkers";

const Home = () => {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50">
      <Banner />
      <Recently />
      
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Side - Main Content (w-9/12) */}
          <div className="lg:w-9/12 space-y-8">
            
            {/* History Section */}
            <HistorySchool />
            
            {/* President and Principal Section - Side by Side */}
            <div className="flex flex-col md:flex-row gap-6 shadow-md bg-gray-50 p-2">
              <div className="md:w-1/2">
                <President />
              </div>
              <div className="md:w-1/2">
                <PrincipalSpeech />
              </div>
            </div>
            
            {/* Grid 4 Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div className="col-span-1">
                <Students />
              </div>
              <div className="col-span-1">
                <Teachers />
              </div>
              <div className="col-span-1">
                <DownloadInfo />
              </div>
              <div className="col-span-1">
                <AcademicInfo />
              </div>
            </div>
          </div>
          
          {/* Right Side - Sidebar (w-3/12) */}
          <div onClick={() => navigate("/auth/login")} className="lg:w-3/12 space-y-6 cursor-pointer">
            <div className="flex items-center gap-2 border-2 px-2 py-2">
                <span><BsArrowRight></BsArrowRight></span>
                <span> লগইন</span>
            </div>
            <Notices />
            <FacebookPage />
            <GovtImage />
          </div>
          <div>
          </div>
        </div>
            <AllTeachersAndWorkers></AllTeachersAndWorkers>
      </div>
    </div>
  );
};

export default Home;