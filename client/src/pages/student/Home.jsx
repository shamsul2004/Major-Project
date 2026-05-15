import React, { useContext } from 'react'
import Hero from '../../components/student/Hero'
import Companies from '../../components/student/Companies'
import CourseSection from '../../components/student/CourseSection'
import TestimonialSection from '../../components/student/TestimonialSection'
import CallToAction from '../../components/student/CallToAction'
import Footer from '../../components/student/StudentFooter'
import { AppContext } from '../../context/AppContext'

const Home = () => {
  const { backendUrl } = useContext(AppContext)

  return (
    <div className='flex flex-col items-center space-y-7 text-center relative'>
      <Hero/>
      <Companies/>
      <CourseSection/>
      <TestimonialSection/>
      <CallToAction/>
      <Footer/>
    </div>
  )
}

export default Home