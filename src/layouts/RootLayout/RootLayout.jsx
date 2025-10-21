import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../../components/sharedItems/Navbar/Navbar';
import Footer from '../../components/sharedItems/Footer/Footer';
import NavbarBanner from '../../components/sharedItems/Navbar/NavbarBanner/NavbarBanner';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
            {/* Main Container with Progressive Shadow */}
            <div className="min-h-screen mx-auto bg-white
                          /* Mobile First - Full width with strong shadow */
                          w-full shadow-[0_8px_25px_rgba(0,0,0,0.35)]
                          
                          /* Small devices (landscape phones, 576px and up) */
                          sm:shadow-[0_8px_30px_rgba(0,0,0,0.3)]
                          
                          /* Medium devices (tablets, 768px and up) */
                          md:max-w-[95vw] md:rounded-none md:shadow-[0_8px_35px_rgba(0,0,0,0.25)]
                          
                          /* Large devices (desktops, 992px and up) */
                          lg:max-w-[90vw] lg:shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                          
                          /* X-Large devices (large desktops, 1200px and up) */
                          xl:max-w-[85vw] xl:shadow-[0_8px_45px_rgba(0,0,0,0.15)]
                          
                          /* XX-Large devices (larger desktops, 1400px and up) */
                          2xl:max-w-[80vw] 2xl:shadow-[0_8px_50px_rgba(0,0,0,0.1)]">
                
                {/* Navigation Section */}
                <header className="w-full bg-white">
                    {/* Top Banner - NOT Sticky */}
                    <div className="w-full border-b border-gray-100">
                        <NavbarBanner />
                    </div>
                    
                    {/* Main Navigation - STICKY */}
                    <div className="w-full border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm supports-[backdrop-filter]:bg-white/80">
                        <Navbar />
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="w-full min-h-screen">
                    {/* Content with responsive horizontal padding */}
                    <div className="w-full h-full
                                   
                                 ">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="w-full border-t border-gray-200 bg-white mt-auto">
                    <Footer />
                </footer>
            </div>
        </div>
    );
};

export default RootLayout;