import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../../context/AppContext';
import SearchBar from '../../components/student/SearchBar';
import { useParams, useNavigate } from 'react-router-dom';
import CourseCard from '../../components/student/CourseCard';
import { assets } from '../../assets/assets';
import Footer from '../../components/student/StudentFooter';
import axios from 'axios';
import { toast } from 'react-toastify';

const CoursesList = () => {
  const { allCourses, backendUrl } = useContext(AppContext);
  const { input } = useParams();
  const navigate = useNavigate();
  const [filteredCourse, setFilteredCourse] = useState([]);
  
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState(null);

  useEffect(() => {
    if (allCourses && allCourses.length > 0) {
      const tempCourses = allCourses.slice();

      if (input) {
        setFilteredCourse(
          tempCourses.filter((item) =>
            item.courseTitle.toLowerCase().includes(input.toLowerCase())
          )
        );
      } else {
        setFilteredCourse(tempCourses);
      }
    }
  }, [allCourses, input]);

  const getAiRecommendations = async () => {
    if (!skills && !interests) {
      toast.error('Please enter at least some skills or interests.');
      return;
    }
    
    setIsAiLoading(true);
    try {
      const response = await axios.post(`${backendUrl}/api/course/recommend`, { skills, interests });
      if (response.data.success) {
        setAiRecommendations(response.data.recommendations);
        toast.success("AI found the perfect courses for you!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to get recommendations.";
      toast.error(errorMsg);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <>
      <div className='relative md:px-36 px-8 pt-20 text-left'>
        {/* Header Section */}
        <div className='flex md:flex-row flex-col gap-6 items-start justify-between w-full'>
          <div>
            <h1 className='text-4xl font-semibold text-gray-800'>Course List</h1>
            <p className='text-gray-500'>
              <span
                className='text-blue-600 cursor-pointer hover:underline'
                onClick={() => navigate('/')}
              >
                Home
              </span>{' '}
              / <span>Course List</span>
            </p>
          </div>
          {input && <div className='inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600'>
            <p>{input}</p>
            <img src={assets.cross_icon} alt="" className='cursor-pointer' onClick={() => {
              navigate('/course-list')
            }} />
          </div>}
          <SearchBar data={input} />
        </div>

        {/* AI Course Matcher Section */}
        <div className='my-8 p-6 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white'>
              ✨
            </div>
            <h2 className='text-2xl font-bold text-gray-800'>AI Course Matcher</h2>
          </div>
          <p className='text-gray-600 mb-6'>Tell our AI about your background and what you want to learn, and we'll find the perfect courses for you.</p>
          
          <div className='flex flex-col md:flex-row gap-4 mb-6'>
            <input 
              type="text" 
              placeholder="Your Skills (e.g., HTML, Python, Marketing)" 
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className='flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <input 
              type="text" 
              placeholder="Your Interests (e.g., Web Development, Data Science)" 
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              className='flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
            />
            <button 
              onClick={getAiRecommendations}
              disabled={isAiLoading}
              className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:bg-blue-400 min-w-[160px]'
            >
              {isAiLoading ? 'Analyzing...' : 'Find My Match'}
            </button>
          </div>

          {/* Recommended Courses Grid */}
          {aiRecommendations && aiRecommendations.length > 0 && (
            <div className='mt-8 pt-8 border-t border-blue-200'>
              <h3 className='text-xl font-semibold text-gray-800 mb-6'>Top Matches For You</h3>
              <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'>
                {aiRecommendations.map((rec, index) => {
                  const course = allCourses.find(c => c._id === rec.courseId);
                  if (!course) return null;
                  
                  return (
                    <div key={index} className='relative group'>
                      <div className='absolute -top-3 -right-3 z-10 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white'>
                        {rec.matchPercentage}% Match
                      </div>
                      <div className='border-2 border-blue-200 rounded-lg overflow-hidden h-full flex flex-col bg-white hover:border-blue-500 transition-colors shadow-sm'>
                        <CourseCard course={course} />
                        <div className='p-4 bg-blue-50 flex-grow border-t border-blue-100'>
                          <p className='text-sm text-gray-700 italic'>"{rec.reason}"</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Regular Course Grid */}
        <h2 className='text-2xl font-bold text-gray-800 mt-16 mb-6'>All Courses</h2>
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-2 md:px-0'>
          {filteredCourse.length > 0 ? (
            filteredCourse.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          ) : (
            <p className='text-gray-500 col-span-full text-center'>
              No courses found matching your search.
            </p>
          )}
        </div>
        
      </div>
      <Footer/>
    
    </>
  );
};

export default CoursesList;