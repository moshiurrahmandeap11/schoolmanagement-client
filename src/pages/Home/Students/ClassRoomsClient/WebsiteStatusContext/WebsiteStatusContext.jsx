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
      const response = await axiosInstance.get('/shutdown/status');
      
      // শুধুমাত্র স্ট্যাটাস পরিবর্তন হলে আপডেট করবে
      if (response.data.status !== websiteStatus) {
        setWebsiteStatus(response.data.status);
        
        if (response.data.status === 'shutdown') {
          setMaintenanceMessage(response.data.maintenanceMessage || 'ওয়েবসাইটটি রক্ষণাবেক্ষণের জন্য সাময়িক বন্ধ রয়েছে। দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।');
        } else {
          setMaintenanceMessage('');
        }
      }
    } catch (error) {
      console.error('Error checking website status:', error);
      // error হলে শুধুমাত্র প্রথমবারের জন্য running সেট করবে
      if (websiteStatus !== 'running') {
        setWebsiteStatus('running');
      }
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
    
    // শুধুমাত্র শাটডাউন অবস্থায় বেশি করে চেক করবে, running অবস্থায় কম চেক করবে
    const intervalTime = websiteStatus === 'shutdown' ? 30000 : 60000; // 30sec vs 60sec
    
    const interval = setInterval(checkWebsiteStatus, intervalTime);
    return () => clearInterval(interval);
  }, [websiteStatus]); // websiteStatus পরিবর্তন হলে interval আপডেট হবে

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