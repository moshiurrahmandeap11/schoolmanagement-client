import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../../components/sharedItems/Navbar/Navbar';
import Footer from '../../components/sharedItems/Footer/Footer';
import NavbarBanner from '../../components/sharedItems/Navbar/NavbarBanner/NavbarBanner';


const RootLayout = () => {
    return (
        <div className="lg:max-w-9/12 mx-auto px-4 bg-white shadow-[0_8px_20px_rgba(0,0,0,0.3)]"
>
            <nav className='w-full bg-white shadow-md'>
                <NavbarBanner></NavbarBanner>
                <Navbar></Navbar>
            </nav>
            <main>
                <Outlet></Outlet>
            </main>
            <footer>
                <Footer></Footer>
            </footer>
        </div>
    );
};

export default RootLayout;