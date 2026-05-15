import React from 'react'
import { assets, dummyTestimonial } from '../../assets/assets'

const TestimonialSection = () => {
  return (
    <div className='py-20 px-8 md:px-16 lg:px-32 bg-white'>
      <div className="flex flex-col items-center text-center mb-16">
        <h2 className='text-3xl md:text-4xl font-bold text-gray-900 tracking-tight'>What our learners say</h2>
        <p className='text-base md:text-lg text-gray-500 mt-4 max-w-2xl'>
          Hear from our learners about their journey of transformation, success, and how our platform has made a difference in their lives.
        </p>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto'>
        {dummyTestimonial.map((testimonial, index) => (
          <div key={index} className='flex flex-col text-sm text-left border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden relative group'>
            {/* Quote Icon Background */}
            <div className="absolute top-4 right-6 text-primary-100 opacity-50 group-hover:scale-110 transition-transform duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 256 256"><path d="M116,72v88a48.05,48.05,0,0,1-48,48,8,8,0,0,1,0-16,32,32,0,0,0,32-32v-8H68a48.05,48.05,0,0,1-48-48V72A48.05,48.05,0,0,1,68,24h48A8,8,0,0,1,116,72ZM236,24H188a48.05,48.05,0,0,0-48,48v32a48.05,48.05,0,0,0,48,48h32v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A48.05,48.05,0,0,0,236,24Z"></path></svg>
            </div>
            
            <div className='flex items-center gap-4 px-6 pt-8 pb-4 relative z-10'>
              <img className='h-14 w-14 rounded-full border-2 border-primary-50 object-cover' src={testimonial.image} alt={testimonial.name} />
              <div>
                <h1 className='text-lg font-bold text-gray-900 leading-tight'>
                  {testimonial.name}
                </h1>
                <p className='text-primary-600 font-medium'>{testimonial.role}</p>
              </div>
            </div>
            
            <div className='px-6 pb-8 flex-1 flex flex-col relative z-10'>
              <div className='flex gap-1 mb-4'>
                {[...Array(5)].map((_, i) => (
                  <img className='h-4 w-4' key={i} src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank} alt="star" />
                ))}
              </div>
              <p className='text-gray-600 leading-relaxed flex-1 italic'>" {testimonial.feedback} "</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TestimonialSection