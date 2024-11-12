// App.js
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import Classes from './pages/Classes';
import Cart from './pages/Cart';
import CoachDashboard from './pages/CoachDashboard';
import LogOut from './pages/LogOut';
import Navbar from './components/Navbar';
import OtherActivities from './pages/OtherActivities';

function App() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <div>
      {!isAuthPage && <Navbar />}
      <Routes>
        <Route path='/other-activities' element={<OtherActivities/>}/>
        <Route path="/login" element={<LogIn />} />
        <Route path="/logout" element={<LogOut />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/classes" element={<Classes />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/coach-dashboard" element={<CoachDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
