import React from 'react'
import { useState , useEffect } from 'react';
import "./SliderBar.css"

export default function SlideBar({ 
  min = 0, 
  max = 100, 
  step = 10, 
  initialData = 50, 
  title = "unknown", 
  onValueChange = () => {}, 
  backgroundType = "" 
}) {  
  const [value, setValue] = useState(initialData); // Default value
  useEffect(() => {
    onValueChange(value); // Propagate the change to the parent component
  }, [value]);

  const handleChange = (e) => {
    // console.log(e)
    setValue(parseFloat(e.target.value));
  };

  const getBackgroundClass = () => {
    // console.log(backgroundType)
    switch(backgroundType) {
      case 'blueToYellow':
        return 'bg-blue-to-yellow';
      case 'greenToPurple':
        return 'bg-green-to-purple';
      default:
        return 'bg-none';
    }
  };
  return (
    <div className="flex-1">
      <div className="flex">
      <label htmlFor="steps-range" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {title}
      </label>
        <div className="ml-auto">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {value}
          </span>
        </div>
      </div>
      <input
          id="steps-range"
          onChange={handleChange}
          type="range"
          min={min}
          max={max}
          value={value}
          step={step}
          className={`slider w-full h-2 rounded-lg appearance-none cursor-pointer ${getBackgroundClass()}`}
        />
    </div>

  )
}