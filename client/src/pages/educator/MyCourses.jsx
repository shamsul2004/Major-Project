import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'

// Create these simple components in your project:

// 1. Create src/components/educator/CourseSkeleton.jsx
const CourseSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border-b">
        <div className="w-16 h-12 bg-gray-200 rounded"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    ))}
  </div>
)

// 2. Create src/components/educator/EmptyState.jsx
const EmptyState = ({ message, actionText, onAction }) => (
  <div className="text-center py-12">
    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">No courses found</h3>
    <p className="mt-1 text-sm text-gray-500">{message || "You haven't published any courses yet."}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {actionText || "Create New Course"}
      </button>
    )}
  </div>
)

// 3. Create src/components/educator/ErrorState.jsx
const ErrorState = ({ message, onRetry }) => (
  <div className="text-center py-12">
    <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <h3 className="mt-2 text-lg font-medium text-gray-900">Something went wrong</h3>
    <p className="mt-1 text-sm text-gray-500">{message || "Failed to load courses."}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Retry
      </button>
    )}
  </div>
)

const MyCourses = () => {
  const { currency, backendUrl, getToken } = useContext(AppContext)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])

  const loadCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const token = await getToken()
      const response = await fetch(`${backendUrl}/api/educator/courses`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load courses')
      }
      setCourses(data.courses || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const calculateEarnings = (course) => {
    const students = course?.enrolledStudents?.length || 0
    const price = course.coursePrice || 0
    const discount = course.discount || 0
    return students * (price - (price * discount / 100))
  }

  const deleteCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    try {
      setError(null)
      setLoading(true)
      const token = await getToken()
      const response = await fetch(`${backendUrl}/api/educator/course/${courseId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to delete course')
      }
      await loadCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const refreshCourses = async () => {
    setError(null)
    await loadCourses()
  }

  if (loading && courses.length === 0) {
    return <CourseSkeleton />
  }

  if (error) {
    return <ErrorState message={error} onRetry={refreshCourses} />
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        message="Your published courses will appear here"
        actionText="Create New Course"
        onAction={() => navigate('/educator/courses/new')}
      />
    )
  }

  return (
    <div className='h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='w-full'>
        <h2 className='pb-4 text-lg font-medium'>My Courses</h2>
        <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
          <table className='md:table-auto table-fixed w-full overflow-hidden'>
            <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
              <tr>
                <th className='px-4 py-3 font-semibold truncate'>All Courses</th>
                <th className='px-4 py-3 font-semibold truncate'>Earnings</th>
                <th className='px-4 py-3 font-semibold truncate'>Students</th>
                <th className='px-4 py-3 font-semibold truncate'>Published On</th>
                <th className='px-4 py-3 font-semibold truncate'>Actions</th>
              </tr>
            </thead>
            <tbody className='text-sm text-gray-500'>
              {courses.map((course) => (
                <tr key={course._id} className='border-b border-gray-500/20'>
                  <td className='md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate'>
                    <img
                      src={course.courseThumbnail || '/default-course.png'}
                      alt="course"
                      className='w-16 h-10 object-cover rounded'
                      onError={(e) => {
                        e.target.src = '/default-course.png'
                      }}
                    />
                    <span className='truncate hidden md:block'>
                      {course.courseTitle || 'Untitled Course'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    {currency}{calculateEarnings(course).toFixed(2)}
                  </td>
                  <td className='px-4 py-3'>
                    {course.enrolledStudents?.length || 0}
                  </td>
                  <td className='px-4 py-3'>
                    {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className='px-4 py-3 flex gap-2'>
                    <button
                      onClick={() => navigate(`/educator/courses/${course._id}/edit`)}
                      className='text-blue-600 hover:text-blue-800 text-sm'
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteCourse(course._id)}
                      className='text-red-600 hover:text-red-800 text-sm'
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default MyCourses