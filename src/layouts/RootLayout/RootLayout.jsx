import React from 'react';
import { Outlet } from 'react-router';
import Navbar from '../../components/sharedItems/Navbar/Navbar';
import Footer from '../../components/sharedItems/Footer/Footer';


const RootLayout = () => {
    return (
        <div>
            <nav className='w-full sticky top-0 z-50 bg-white shadow-md'>
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