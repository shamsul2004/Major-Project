import React, { useContext } from 'react';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom
import { AppContext } from '../../context/AppContext';
import CourseCard from './CourseCard';


const CourseSection = () => {
  const { allCourses } = useContext(AppContext);

  return (
    <div className='py-20 px-4 md:px-8 lg:px-16 xl:px-40 bg-gray-50/50'>
      <div className="flex flex-col items-center text-center mb-14">
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 tracking-tight'>Learn from the best</h2>
        <p className='text-base md:text-lg text-gray-500 mt-4 max-w-2xl'>
          Discover our top-rated courses across various categories. From coding and design to business and wellness, our courses are crafted to deliver results.
        </p>
      </div>

      {/* Course Cards Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
        {allCourses.slice(0, 4).map((course, index) => (
          <CourseCard key={index} course={course} />
        ))}
      </div>

      {/* Show All Courses Button */}
      <div className='flex justify-center mt-16'>
        <Link
          to={'/course-list'}
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className='group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold text-gray-700 transition-all duration-200 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600'
        >
          Show all courses
          <svg className="w-5 h-5 ml-2 -mr-1 transition-transform duration-200 group-hover:translate-x-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default CourseSection;