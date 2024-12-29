import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Classes from './pages/Classes';
import Cart from './pages/Cart';
import CoachDashboard from './pages/CoachDashboard';
import LogOut from './pages/LogOut';
import Navbar from './components/Navbar';
import OtherActivities from './pages/OtherActivities';
import ProtectedRoute from './ProtectedRoute';
import { getUserFromLocalStorage, logout } from './Auth';

function App() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(getUserFromLocalStorage()); // Initialize user from localStorage
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  // Update current user whenever localStorage changes or the route changes
  useEffect(() => {
    const user = getUserFromLocalStorage();
    setCurrentUser(user);
    console.log('Current User:', user);
  }, [location]);

  // Logout handler
  const handleLogout = () => {
    logout(); // Clear user from localStorage
    setCurrentUser(null); // Update state to trigger re-render
    console.log('User logged out');
  };

  return (
    <div>
      {!isAuthPage && <Navbar currentUser={currentUser} onLogout={handleLogout} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/other-activities"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <OtherActivities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <Classes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <Cart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach-dashboard"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <CoachDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <LogOut onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
