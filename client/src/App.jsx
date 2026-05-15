import React, { useContext } from 'react';
import { Route, Routes, useLocation, useMatch, Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { AppContext } from './context/AppContext';
import Home from './pages/student/Home';
import CoursesList from './pages/student/CoursesList';
import CourseDetails from './pages/student/CourseDetails';
import MyEnrollments from './pages/student/MyEnrollments';
import Player from './pages/student/Player';
import Loading from './components/student/Loading';
import Educator from './pages/educator/Educator';
import Dashboard from './pages/educator/Dashboard';
import MyCourses from './pages/educator/MyCourses';
import AddCourse from './pages/educator/AddCourse';
import StudentEnrolled from './pages/educator/StudentEnrolled';
import Navbar from './components/student/Navbar';
import "quill/dist/quill.snow.css";
 import { ToastContainer } from 'react-toastify';

import CreateCourse from './pages/educator/CreateCourse';
import EducatorApplication from './pages/educator/EducatorApplication';
import AdminDashboardIframe from './pages/admin/AdminDashboardIframe';
import Chatbot from './components/student/Chatbot';

const App = () => {
  const { backendUrl, isAdmin, userData } = useContext(AppContext);
  const location = useLocation();
  const isEducatorRoute = useMatch('/educator/*');
  const isAdminRoute = location.pathname.startsWith('/admin');
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded || (isSignedIn && userData === null)) {
    return <Loading />;
  }

  if (isAdmin) {
    return (
      <div className='text-default min-h-screen bg-white'>
        <ToastContainer />
        <Routes>
          <Route path='/admin' element={<AdminDashboardIframe/>} />
          <Route path='*' element={<Navigate to='/admin' replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className='text-default min-h-screen bg-white'>
       <ToastContainer />

      {!isEducatorRoute && !isAdminRoute && <Navbar/>}
      <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='/Course-list' element={<CoursesList/>}/>
        <Route path='/Course-list/:input' element={<CoursesList/>}/>
        <Route path='/course/:id' element={<CourseDetails/>}/>
        <Route path='/my-enrollments' element={<MyEnrollments/>}/>
        <Route path='/player/:courseId' element={<Player/>}/>
        <Route path='/loading/:path' element={<Loading/>}/>
        <Route path='/educator/apply' element={<EducatorApplication/>} />
        <Route path='/admin' element={<Navigate to='/' replace />} />
        <Route path='/admin-dashboard' element={<Navigate to='/' replace />} />
        {/* Nested Routes for Educator */}
        <Route path='/educator' element={<Educator/>}>
          <Route path='/educator' element={<Dashboard/>}/>
          <Route path='add-course' element={<AddCourse/>}/>
          <Route path='my-courses' element={<MyCourses/>}/>
          <Route path='student-enrolled' element={<StudentEnrolled/>}/>
          <Route path="courses" element={<MyCourses />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id/edit" element={<CreateCourse />} />
        </Route>
      </Routes>
      {!isAdminRoute && <Chatbot backendUrl={backendUrl} />}
    </div>
  );
}

export default App;