import React, { useState } from 'react'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const SearchBar = ({data}) => {

const navigate=useNavigate()
const [input,setInput]=useState(data?data:'')

const onSearchHandler=(e)=>{
  e.preventDefault()
  navigate('/course-list/'+input)
}

  return (
    <form onSubmit={onSearchHandler} className='max-w-2xl w-full md:h-16 h-14 flex items-center bg-white border border-gray-100 rounded-full shadow-lg shadow-gray-200/50 hover:shadow-xl focus-within:shadow-xl focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-50 transition-all duration-300 overflow-hidden'>
      <div className="pl-6 pr-3 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
      </div>
      <input 
        onChange={e => setInput(e.target.value)} 
        value={input} 
        type="text" 
        placeholder='Search for premium courses...' 
        className='w-full h-full bg-transparent outline-none text-gray-700 font-medium placeholder-gray-400 text-sm md:text-base'
      />
      <button 
        type='submit' 
        className='bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600 text-white md:px-10 px-6 h-full font-medium transition-all duration-300 mr-1 my-1 rounded-full'
      >
        Search
      </button>
    </form>
  )
}

export default SearchBar