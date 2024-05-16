// /components/ImageUploader.jsx
import React, { useState , useRef , useEffect } from 'react';

function ImageUploader({children, imageSrc, setImageSrc, setImageList}) {

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
                setImageList((prevList) => [...prevList, e.target.result])
            }
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file.');
        }
    };
   
    return (
        <div className="flex items-center justify-center w-full">
         {!imageSrc && (
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500">
                <div className="flex flex-col items-center justify-center p-4">
                    <svg className="w-8 h-8 mb-2 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 16">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 00 0-6h-.025A5.56 5.56 0 0016 6.5 5.5 5.5 0 005.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 000 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                    </svg>
                    {children}
                </div>
                <input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
           
            )}
        </div> 
    );
}

export default ImageUploader;
