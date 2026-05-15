import React from 'react'
import { assets } from '../../assets/assets'

const Companies = () => {
  return (
    <div className='pt-16 pb-8'>
      <p className='text-sm font-semibold tracking-wider text-gray-400 uppercase mb-8'>Trusted by learners from top companies</p>
      <div className='flex flex-wrap items-center justify-center gap-10 md:gap-20 opacity-70'>
        <img src={assets.microsoft_logo} alt="Microsoft" className='w-24 md:w-32 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300' />
        <img src={assets.walmart_logo} alt="Walmart" className='w-24 md:w-32 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300' />
        <img src={assets.accenture_logo} alt="Accenture" className='w-24 md:w-32 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300' />
        <img src={assets.adobe_logo} alt="Adobe" className='w-24 md:w-32 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300' />
        <img src={assets.paypal_logo} alt="Paypal" className='w-24 md:w-32 grayscale hover:grayscale-0 hover:scale-105 transition-all duration-300' />
      </div>
    </div>
  )
}

export default Companies