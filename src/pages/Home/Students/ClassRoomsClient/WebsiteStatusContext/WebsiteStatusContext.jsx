import { createContext, useContext, useEffect, useState } from 'react';
import axiosInstance from '../../../../../hooks/axiosInstance/axiosInstance';


const WebsiteStatusContext = createContext();

export const useWebsiteStatus = () => {
  const context = useContext(WebsiteStatusContext);
  if (!context) {
    throw new Error('useWebsiteStatus must be used within WebsiteStatusProvider');
  }
  return context;
};

export const WebsiteStatusProvider = ({ children }) => {
  const [websiteStatus, setWebsiteStatus] = useState('running');
  const [loading, setLoading] = useState(true);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  // ওয়েবসাইট স্ট্যাটাস চেক করবে
  const checkWebsiteStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/shutdown/status');
      setWebsiteStatus(response.data.status);
      
      // যদি শাটডাউন থাকে, তাহলে মেসেজ সেট করবে
      if (response.data.status === 'shutdown') {
        setMaintenanceMessage('ওয়েবসাইটটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ রয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
      }
    } catch (error) {
      console.error('Error checking website status:', error);
      setWebsiteStatus('running'); // ডিফল্ট হিসেবে running সেট করবে
    } finally {
      setLoading(false);
    }
  };


// ওয়েবসাইট শাটডাউন করবে
const shutdownWebsite = async (message) => {
  try {
    const response = await axiosInstance.post('/shutdown/trigger', {
      maintenanceMessage: message
    });

    if (response.data.success) {
      setWebsiteStatus('shutdown');
      setMaintenanceMessage(message);
      return { success: true, message: response.data.message };
    }
  } catch (error) {
    console.error('Error shutting down website:', error);
    return { 
      success: false, 
      message: error.response?.data?.error || 'শাটডাউন করতে সমস্যা হয়েছে' 
    };
  }
};

// ওয়েবসাইট রিস্টার্ট করবে
const restartWebsite = async () => {
  try {
    const response = await axiosInstance.post('/shutdown/restart');

    if (response.data.success) {
      setWebsiteStatus('running');
      setMaintenanceMessage('');
      return { success: true, message: response.data.message };
    }
  } catch (error) {
    console.error('Error restarting website:', error);
    return { 
      success: false, 
      message: error.response?.data?.error || 'রিস্টার্ট করতে সমস্যা হয়েছে' 
    };
  }
};

  useEffect(() => {
    checkWebsiteStatus();
    
    // প্রতি 30 সেকেন্ডে স্ট্যাটাস চেক করবে
    const interval = setInterval(checkWebsiteStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const value = {
    websiteStatus,
    loading,
    maintenanceMessage,
    checkWebsiteStatus,
    shutdownWebsite,
    restartWebsite
  };

  return (
    <WebsiteStatusContext.Provider value={value}>
      {children}
    </WebsiteStatusContext.Provider>
  );
};

export default WebsiteStatusContext;