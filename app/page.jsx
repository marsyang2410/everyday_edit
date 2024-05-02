'use client'

import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";
import React , { useState , useEffect , useRef } from "react";
import cv from "opencv.js"

export default function Home() {
  const [src, setSrc] = useState(null); // This would be your image src, possibly a canvas or similar
  const canvasRef = useRef(null);
  const [brightness, setbrightness] = useState(1)
  const matRef = useRef(null); // Using a ref to manage OpenCV Mat objects

  useEffect(() => {
    if (!cv || !src || !canvasRef) return; // Ensure OpenCV and source image are loaded

    // Clean up the previous Mat before creating a new one
    if (matRef.current) {
      matRef.current.delete();
    }
    if (src && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
          // Resize canvas to match image dimensions
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
          matRef.current = cv.imread(canvasRef.current);
      };
      img.src = src;
    }
  }, [src]); // Dependency only on src

  // Example function to adjust brightness using a slider
  const handleBrightness = (newBrightness) => {
    if (!matRef.current) return;
    if (canvasRef.current) {
      let dstMat = new cv.Mat();
      matRef.current.convertTo(dstMat, -1, 1, newBrightness - brightness)
      console.log("Canvas reference:", canvasRef.current);
      console.log("dst matrix:", dstMat)
      if (dstMat.empty()) {
        console.error("Destination matrix is empty.");
        return;
      }
      try {
          cv.imshow(canvasRef.current, dstMat);
          matRef.current.delete()
          matRef.current = dstMat
      } catch (error) {
          console.error("Failed to display image on canvas:", error);
      }
      setbrightness(newBrightness)
    }

  };

  const sliders = [
    {
        min: -50,
        max: 50,
        step: 5,
        title: "亮度",
        initialData: 0,
        onValueChange: handleBrightness
      },
  ];
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-row w-full h-screen">
        <div className="w-1/2 h-screen p-4">
            <ImageUploader imageSrc={src} setImageSrc={setSrc} canvasRef={canvasRef}/>
        </div>
        <div className="flex-1 p-4 max-w-md overflow-auto">
          {sliders.map((slider, index) => (
            <SlideBar
              key={index}
              min={slider.min}
              max={slider.max}
              step={slider.step}
              initialData={slider.initialData}
              title={slider.title}
              onValueChange={slider.onValueChange}
              />
          ))}
        </div>
      </div>
    </main>
  );
}

export async function loader({ params, request, context }) {
  const initialData = {
    message: 'This is server-side fetched data.'
  };

  return initialData;
}