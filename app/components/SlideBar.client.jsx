import React from 'react'
import { useState , useEffect } from 'react';

export default function SlideBar({title,onValueChange}) {
  const [value, setValue] = useState(0); // Default value
  useEffect(() => {
    onValueChange(value); // Propagate the change to the parent component
  }, [value]);

  const handleChange = (e) => {
    setValue(parseFloat(e.target.value));
  };
  return (
    <div> 
    <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {title}
    </label>
    <input
        id="steps-range"
        onChange={handleChange}
        type="range"
        min="-1"
        max="1"
        value={value}
        step="0.2"
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
    />
    </div>

  )
}
