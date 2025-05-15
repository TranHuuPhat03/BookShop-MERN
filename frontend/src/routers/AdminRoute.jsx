import React from 'react'
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = ({children}) => {
  const adminToken = localStorage.getItem('adminToken');
  if(!adminToken) {
    return <Navigate to="/admin"/>
  }
  return children ?  children : <Outlet/>;
}

export default AdminRoute