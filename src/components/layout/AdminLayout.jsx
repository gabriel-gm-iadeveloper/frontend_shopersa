import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';

const AdminLayout = () => {
    return (
        <>
            <AdminNavbar />
            <div className="container my-5">
                <Outlet /> {/* Aquí se renderizarán DashboardPage, ProductManagementPage, etc. */}
            </div>
        </>
    );
};

export default AdminLayout;