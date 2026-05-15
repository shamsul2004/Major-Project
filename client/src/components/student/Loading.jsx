import React, { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AppContext } from '../../context/AppContext'
import axios from 'axios'

const Loading = () => {
  const {path} = useParams();
  const navigate = useNavigate();
  const { backendUrl, getToken, fetchUserEnrolledCourses } = React.useContext(AppContext);

  useEffect(()=>{
    const verifyStripePayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionId = urlParams.get('session_id');

      if (sessionId) {
        try {
          const token = await getToken();
          await axios.post(
            `${backendUrl}/api/user/verify-payment`,
            { sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          // Refresh enrolled courses
          await fetchUserEnrolledCourses();
        } catch (error) {
          console.error("Error verifying payment:", error);
        }
      }

      if(path){
        const timer = setTimeout(()=>{
          navigate(`/${path}`)
        },1000)
        return ()=>clearTimeout(timer)
      }
    };

    verifyStripePayment();
  },[])
  return (
    <div className='min-h-screen flex items-center justify-center' >
      <div className='w-16 sm:w-20 aspect-square border-4 border-amber-700 border-t-4 border-t-blue-400 rounded-full animate-spin'>
        

      </div>
    
    </div>
  )
}

export default Loading