import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
  const { currency, calculateRating } = useContext(AppContext);

  // Safe rating value
  const rating = calculateRating(course) || 0;
  const ratingCount = course.courseRatings?.length || 0;

  return (
    <Link
      to={'/course/' + course._id}
      onClick={() => scroll(0, 0)}
      className='group flex flex-col bg-white border border-gray-100 overflow-hidden rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300'
    >
      <div className="relative overflow-hidden aspect-video">
        <img 
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' 
          src={course.courseThumbnail} 
          alt={course.courseTitle} 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <div className='p-5 flex flex-col flex-1'>
        <div className='flex items-center justify-between mb-2'>
          <p className='text-xs font-semibold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full'>Learnify</p>
          <div className='flex items-center space-x-1.5 bg-yellow-50 px-2 py-0.5 rounded-full'>
            <p className="text-xs font-bold text-yellow-600">{rating > 0 ? rating.toFixed(1) : "New"}</p>
            <img src={assets.star} alt="star" className='w-3 h-3' />
            <p className='text-[10px] text-gray-500'>({ratingCount})</p>
          </div>
        </div>

        <h3 className='text-lg font-bold text-gray-900 leading-tight mb-3 line-clamp-2 group-hover:text-primary-600 transition-colors'>{course.courseTitle}</h3>
        
        <div className='mt-auto pt-4 border-t border-gray-100 flex items-center justify-between'>
          <p className='text-xl font-extrabold text-gray-900'>
            {currency}{((course.coursePrice || 0) - (course.discount || 0) * (course.coursePrice || 0) / 100).toFixed(2)}
          </p>
          {course.discount > 0 && (
            <p className='text-sm text-gray-400 line-through'>
              {currency}{course.coursePrice.toFixed(2)}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
