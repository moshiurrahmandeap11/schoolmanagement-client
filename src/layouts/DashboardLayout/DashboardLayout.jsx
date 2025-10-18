import React from 'react';
import { Outlet } from 'react-router';

const DashboardLayout = () => {
    return (
        <div>
            <main>
                <Outlet></Outlet>
            </main>
        </div>
    );
};

export default DashboardLayout;