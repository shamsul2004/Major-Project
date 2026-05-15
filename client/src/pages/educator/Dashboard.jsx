import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import Loading from '../../components/student/Loading'

const Dashboard = () => {
  const navigate = useNavigate()
  const { currency, backendUrl, getToken } = useContext(AppContext)
  const [dashboardData, setDashboardData] = useState(null)
  const [error, setError] = useState(null)

  const fetchDashboardData = async () => {
    try {
      const token = await getToken()
      const response = await fetch(`${backendUrl}/api/educator/dashboard`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Unable to load dashboard data')
      }
      setDashboardData(data.dashboardData)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err.message)
      setDashboardData({ totalCourses: 0, totalEarnings: 0, enrolledStudentsData: [] })
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  return dashboardData ? (
    <div className='min-h-screen flex flex-col items-center justify-between gap-8 md:p-8 md:pb-0 p-4 pb-0'>
      <div className='space-y-5 w-full'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <h1 className='text-2xl font-semibold text-gray-800'>Educator Dashboard</h1>
            <p className='text-sm text-gray-500'>Manage your courses, view earnings, and handle enrollments from one place.</p>
          </div>
          <div className='flex flex-wrap gap-3'>
            <button
              onClick={() => navigate('/educator/courses/new')}
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
            >
              Create New Course
            </button>
            <button
              onClick={() => navigate('/educator/courses')}
              className='px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100'
            >
              Manage Courses
            </button>
          </div>
        </div>
        <div className='flex flex-wrap gap-5 items-center'>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 rounded'>
            <img src={assets.patients_icon} alt="patient_icon" className='w-6 h-6' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.totalCourses}</p>
              <p className='text-base text-gray-500'>Total Courses</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 rounded'>
            <img src={assets.appointments_icon} alt="appointment_icon" className='w-6 h-6' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{dashboardData.enrolledStudentsData.length}</p>
              <p className='text-base text-gray-500'>Total Enrollments</p>
            </div>
          </div>
          <div className='flex items-center gap-3 shadow-card border border-blue-500 p-4 rounded'>
            <img src={assets.earning_icon} alt="earning_icon" className='w-6 h-6' />
            <div>
              <p className='text-2xl font-medium text-gray-600'>{currency}{dashboardData.totalEarnings}</p>
              <p className='text-base text-gray-500'>Total Earnings</p>
            </div>
          </div>
        </div>
        <div>
          <h2 className='pb-4 text-lg font-medium'> Latest Enrolments</h2>
          {error && (
            <div className='mb-4 p-4 rounded bg-red-50 border border-red-200 text-red-700'>
              {error}
            </div>
          )}
          <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
            <table className='table-fixed md:table-auto w-full overflow-hidden'>
              <thead className='text-gray-900 border-b border-gray-500/20 text-sm text-left'>
                <tr>
                  <th className='px-4 py-3 font-semibold text-center hidden sm:table-cell'>
                    #
                  </th>
                  <th className='px-4 font-semibold'>Student Name</th>
                  <th className='px-4 font-semibold'> Course Title</th>
                </tr>
              </thead>
              <tbody className='text-sm text-gray-500'>
                {dashboardData.enrolledStudentsData.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='px-4 py-8 text-center text-gray-500'>No enrollments yet</td>
                  </tr>
                ) : (
                  dashboardData.enrolledStudentsData.map((item,index)=>(
                    <tr key={index} className='border-b border-gray-500/20'>
                      <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                      <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                        <img src={item.studentImage || '/default-avatar.png'} alt="profile" className='w-9 h-9 rounded-full' />
                        <span className='truncate'>{item.studentName || 'Student'}</span>
                      </td>
                      <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  ) : <Loading />
}

export default Dashboard