import React, { useContext, useEffect, useState } from 'react'
import Loading from '../../components/student/Loading'
import axios from 'axios'
import { toast } from 'react-toastify'
import { useAuth } from '@clerk/clerk-react'
import { AppContext } from '../../context/AppContext'

const StudentEnrolled = () => {
  const { backendUrl } = useContext(AppContext)
  const { getToken } = useAuth()
  const [enrolledStudents, setEnrolledStudents] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchEnrolledStudents = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.get(`${backendUrl}/api/educator/enrolled-students`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      if (data.success) {
        setEnrolledStudents(data.enrolledStudents || [])
      } else {
        toast.error(data.message || 'Unable to fetch enrolled students.')
        setEnrolledStudents([])
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message)
      setEnrolledStudents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrolledStudents()
  }, [])

  if (loading) {
    return <Loading />
  }

  if (!enrolledStudents || enrolledStudents.length === 0) {
    return (
      <div className='min-h-screen flex items-center justify-center p-8'>
        <div className='max-w-xl w-full bg-white rounded-xl border border-gray-200 shadow p-8 text-center'>
          <h2 className='text-xl font-semibold mb-2'>No enrolled students found</h2>
          <p className='text-gray-600'>Once students purchase your courses, their details will appear here.</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0'>
      <div className='flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20'>
        <table className='table-fixed md:table-auto w-full overflow-hidden pb-4'>
          <thead className='text-gray-900 border border-b border-gray-500/20 text-sm text-left'>
            <tr>
              <th className='px-4 py-3 font-medium text-center hidden sm:table-cell'>#</th>
              <th className='px-3 py-3 font-medium'>Student Name</th>
              <th className='px-3 py-3 font-medium'>Course Title</th>
              <th className='px-3 py-3 font-medium'>Date</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-500'>
            {enrolledStudents.map((item, index) => (
              <tr key={`${item.studentName}-${index}`} className='border-b border-gray-500/20'>
                <td className='px-4 py-3 text-center hidden sm:table-cell'>{index + 1}</td>
                <td className='md:px-4 px-2 py-3 flex items-center space-x-3'>
                  <img
                    src={item.studentImage}
                    alt='student'
                    className='w-9 h-9 rounded-full'
                    onError={(e) => (e.target.src = '/default-user.png')}
                  />
                  <span className='truncate'>{item.studentName}</span>
                </td>
                <td className='px-4 py-3 truncate'>{item.courseTitle}</td>
                <td className='px-4 py-3 truncate'>
                  {new Date(item.purchaseDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StudentEnrolled