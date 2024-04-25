// /components/ImageUploader.jsx
import React, { useState , useRef , useEffect } from 'react';

function ImageUploader({imageSrc,setImageSrc,canvasRef}) {

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
            }
            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file.');
        }
    };
   
    useEffect(() => {
        if (imageSrc && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                // Resize canvas to match image dimensions
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
            };
            img.src = imageSrc;
        }
    }, [imageSrc]);
    return (
        <div className="flex items-center justify-center w-full">
         {!imageSrc && (
                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 00 0-6h-.025A5.56 5.56 0 0016 6.5 5.5 5.5 0 005.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 000 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                    </div>
                    <input id="dropzone-file" type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                </label>
            )}
        {imageSrc && (
                <div className="mt-4">
                    {/* <img id="canvasInput" src={imageSrc} alt="Uploaded" className="max-w-full h-auto rounded-lg" style={{display:'none'}}/> */}
                    <canvas ref={canvasRef} className="mt-4 max-w-full h-auto rounded-lg"></canvas>
                </div>
        )}
        </div> 
    );
}

export default ImageUploader;
