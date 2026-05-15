import React, { useContext } from 'react'
import { assets } from '../../assets/assets'
import { Link, useLocation } from 'react-router-dom'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Navbar = () => {
  const { navigate, isEducator, isAdmin } = useContext(AppContext)

  const location = useLocation();
  const isCourseListPage = location.pathname.includes('/course-list');


  const { openSignIn } = useClerk();
  const { user } = useUser();

  const becomeEducator = async () => {
    if (isEducator) {
      navigate('/educator');
      return;
    }
    navigate('/educator/apply');
  };


  return (
    <div className={`sticky top-0 z-50 transition-all duration-300 border-b py-4 px-4 sm:px-10 md:px-14 lg:px-36 flex items-center justify-between ${isCourseListPage ? 'bg-white/80 backdrop-blur-md border-gray-100 shadow-sm' : 'bg-white/70 backdrop-blur-lg border-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'}`}>
      <img onClick={() => navigate('/')} src={assets.logo} alt="Logo" className='w-28 lg:w-32 cursor-pointer hover:opacity-80 transition-opacity' />

      {/* Desktop menu */}
      <div className='hidden md:flex items-center gap-6 text-gray-600 font-medium'>
        <div className='flex items-center gap-6'>
          {user && (
            <>
              <button 
                onClick={becomeEducator} 
                className='hover:text-primary-600 transition-colors duration-200'
              >
                {isEducator ? 'Educator Dashboard' : 'Become Educator'}
              </button>
              
              {isAdmin && (
                <button 
                  onClick={() => navigate('/admin')} 
                  className='hover:text-primary-600 transition-colors duration-200'
                >
                  Admin Dashboard
                </button>
              )}
              
              <Link 
                to='/my-enrollments' 
                className='hover:text-primary-600 transition-colors duration-200'
              >
                My Enrollments
              </Link>
            </>
          )}
        </div>
        {user ? (
          <div className="ml-2 border-l border-gray-200 pl-6">
            <UserButton />
          </div>
        ) : (
          <button 
            onClick={() => openSignIn()} 
            className='bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white px-6 py-2.5 rounded-full font-medium shadow-md shadow-primary-500/30 hover:shadow-lg hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-300'
          >
            Create Account
          </button>
        )}
      </div>

      {/* Mobile menu */}
      <div className='md:hidden flex items-center gap-3 sm:gap-5 text-gray-600 font-medium'>
        <div className='flex items-center gap-3 max-sm:text-[11px] text-xs'>
          {user && (
            <>
              <button onClick={() => { navigate('/educator/apply') }} className="hover:text-primary-600 transition-colors">
                {isEducator ? 'Educator' : 'Become Educator'}
              </button>
              {isAdmin && (
                <button onClick={() => navigate('/admin')} className="hover:text-primary-600 transition-colors">Admin</button>
              )}
              <Link to='/my-enrollments' className="hover:text-primary-600 transition-colors">Enrollments</Link>
            </>
          )}
        </div>
        {user ? (
          <div className="ml-1 border-l border-gray-200 pl-3 flex items-center">
             <UserButton />
          </div>
        ) : (
          <button onClick={() => openSignIn()} className="p-2 bg-primary-50 rounded-full text-primary-600 hover:bg-primary-100 transition-colors">
            <img src={assets.user_icon} alt="Sign In" className="w-5 h-5 opacity-70" />
          </button>
        )}
      </div>
    </div>
  )
}

export default Navbar
