// src/components/ShutdownGuard/ShutdownGuard.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../../../../hooks/axiosInstance/axiosInstance";
import { useWebsiteStatus } from "../../ClassRoomsClient/WebsiteStatusContext/WebsiteStatusContext";


const ShutdownGuard = ({ children }) => {
  const { websiteStatus, loading, maintenanceMessage } = useWebsiteStatus();
const [message, setMessage] = useState([])

useEffect(() => {
  const tryFetching = async () => {
    try {
      const res = await axiosInstance.get("/shutdown/status")
      setMessage(res.data) 
    } catch (error) {
      console.log("error", error);
    }
  }
  
  tryFetching()
}, [])

  // লোডিং অবস্থায়
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-3xl animate-pulse">লোড হচ্ছে...</div>
      </div>
    );
  }

  // শাটডাউন হলে পুরো সাইট বন্ধ!
  if (websiteStatus === 'shutdown') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center max-w-3xl">
          <h1 className="text-7xl md:text-9xl font-extrabold text-red-600 mb-8 tracking-widest animate-pulse">
            WEBSITE OFFLINE
          </h1>
          
          <div className="bg-red-950 border-4 border-red-700 rounded-3xl p-10 shadow-2xl">
            <p className="text-3xl md:text-5xl text-red-400 mb-8">
              ওয়েবসাইট বন্ধ করা হয়েছে
            </p>

            {maintenanceMessage && (
              <div className="bg-black bg-opacity-70 rounded-2xl p-8 my-10 border-2 border-red-600">
                <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                  {message.maintenanceMessage}
                </p>
              </div>
            )}

            <p className="text-gray-300 text-lg mt-10">
              দয়া করে পরে আবার চেষ্টা করুন।
            </p>
          </div>
        </div>
      </div>
    );
  }

  // সব ঠিক থাকলে → নরমাল সাইট দেখাও
  return children;
};

export default ShutdownGuard;