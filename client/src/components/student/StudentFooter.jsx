import React from 'react';
import { assets } from '../../assets/assets';

export const StudentFooter = () => {
  return (
    <footer className='bg-gray-900 text-white w-full border-t border-gray-800'>
      {/* Top Section */}
      <div className='max-w-7xl mx-auto px-6 md:px-16 lg:px-20 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 border-b border-gray-800'>
        {/* Logo and Description */}
        <div className='flex flex-col items-start'>
          <img src={assets.logo1} alt="Learnify Logo" className='mb-6 w-36 opacity-90' />
          <p className='text-sm text-gray-400 leading-relaxed'>
            Learnify is your gateway to quality education. We offer a wide range of courses designed to help you learn at your own pace, from anywhere in the world.
          </p>
        </div>

        {/* Quick Links */}
        <div className='flex flex-col items-start lg:pl-10'>
          <h3 className='text-lg font-semibold mb-6 text-white'>Quick Links</h3>
          <ul className='space-y-4'>
            <li><a href='/' className='text-sm text-gray-400 hover:text-white hover:underline transition-all duration-200'>Home</a></li>
            <li><a href='/about' className='text-sm text-gray-400 hover:text-white hover:underline transition-all duration-200'>About Us</a></li>
            <li><a href='/courses' className='text-sm text-gray-400 hover:text-white hover:underline transition-all duration-200'>Courses</a></li>
            <li><a href='/contact' className='text-sm text-gray-400 hover:text-white hover:underline transition-all duration-200'>Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className='flex flex-col items-start'>
          <h3 className='text-lg font-semibold mb-6 text-white'>Contact Us</h3>
          <ul className='space-y-4 text-sm text-gray-400'>
            <li className='flex items-center gap-3'><span className='text-xl'>✉️</span> learnify@gmail.com</li>
            <li className='flex items-center gap-3'><span className='text-xl'>📞</span> +91 9517054732</li>
            <li className='flex items-center gap-3'><span className='text-xl'>📍</span> 226301 Lucknow, UP, India</li>
          </ul>
        </div>

        {/* Social Media Links */}
        <div className='flex flex-col items-start'>
          <h3 className='text-lg font-semibold mb-6 text-white'>Follow Us</h3>
          <p className='text-sm text-gray-400 mb-4'>Stay connected with us on social media for updates and offers.</p>
          <div className='flex space-x-4'>
            <a href='https://facebook.com' target='_blank' rel='noopener noreferrer' className='bg-gray-800 p-2.5 rounded-full hover:bg-primary-600 transition-colors duration-300'>
              <img src={assets.facebook_icon} alt="Facebook" className='w-5 h-5 invert opacity-80' />
            </a>
            <a href='https://twitter.com' target='_blank' rel='noopener noreferrer' className='bg-gray-800 p-2.5 rounded-full hover:bg-primary-600 transition-colors duration-300'>
              <img src={assets.twitter_icon} alt="Twitter" className='w-5 h-5 invert opacity-80' />
            </a>
            <a href='https://instagram.com' target='_blank' rel='noopener noreferrer' className='bg-gray-800 p-2.5 rounded-full hover:bg-primary-600 transition-colors duration-300'>
              <img src={assets.instagram_icon} alt="Instagram" className='w-5 h-5 invert opacity-80' />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className='text-center py-6 text-sm text-gray-500 bg-gray-950'>
        <p>&copy; 2026 Learnify. All Rights Reserved. | Empowering Education Worldwide</p>
      </div>
    </footer>
  );
};

export default StudentFooter;