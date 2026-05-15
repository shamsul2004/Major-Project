import React from 'react';
import { assets } from '../../assets/assets'; // Ensure assets is correctly imported
import { UserButton, useUser } from '@clerk/clerk-react'; // Corrected hook import
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user } = useUser(); // Corrected hook usage

  return (
    <div className='flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3'>
      {/* Logo */}
      <Link to='/'>
        <img src={assets.logo} alt="logo" className='w-28 lg:w-32' />
      </Link>

      {/* User Info */}
      <div className='flex items-center gap-5 text-gray-500 relative'>
        <p>Hi! {user ? `${user.firstName} ${user.lastName}` : 'Developer'}</p>
        {user ? (
          <UserButton />
        ) : (
          <img className='max-w-8' src={assets.profile_img} alt="profile" />
        )}
      </div>
    </div>
  );
};

export default Navbar;