import Navbar from "../../components/educator/Navbar";
import Sidebar from '../../components/educator/Sidebar';
import EducatorFooter from "../../components/educator/EducatorFooter";
import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';

export const Educator = () => {
  const { isEducator } = useContext(AppContext);

  if (isEducator === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-xl w-full bg-white rounded-xl border border-gray-200 shadow p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You must be an approved educator to access this area.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar/>
      <div className="flex flex-1">
        <Sidebar/>
        <main className="flex-1 p-4">
          <Outlet /> {/* This will render the nested routes */}
        </main>
      </div>
      <EducatorFooter/>
    </div>
  );
}

export default Educator;