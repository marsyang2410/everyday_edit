import React from 'react'
import { useState } from 'react';

export default function SlideBar() {
  const [value, setValue] = useState(2.5); // Default value

  
  function handleChange(event) {
    console.log("Input value changed to:", event.target.value);
    setValue(event.target.value)
  }
  return (
    <div> 
    <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        Range steps
    </label>
    <input
        id="steps-range"
        onChange={handleChange}
        type="range"
        min="0"
        max="5"
        value={value}
        step="0.5"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
    </div>

  )
}
