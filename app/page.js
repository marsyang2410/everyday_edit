'use client'

import Image from "next/image";
import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";
import { useState , useEffect , useRef } from "react";
import cv from "opencv.js"

export default function Home() {
  const [src, setSrc] = useState(null); // This would be your image src, possibly a canvas or similar
  const canvasRef = useRef(null);

  const handleBrightness = (brightnessValue) => {
    if (!cv || !src) return; // Ensure OpenCV and source image are loaded
    console.log("test")
    if (canvasRef.current) {

      let srcMat = cv.imread(canvasRef.current); // Read from the canvas
      let dstMat = new cv.Mat(); // Renamed from 'dst' to 'dstMat'
      console.log(srcMat)
      srcMat.convertTo(dstMat, -1, 1, brightnessValue);
      cv.imshow(canvasRef.current, dstMat);
      srcMat.delete();
      dstMat.delete();
    } else {
      console.log("Canvas not available");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-row w-full h-screen">
        <div className="w-1/2 h-screen p-4">
            <ImageUploader imageSrc={src} setImageSrc={setSrc} canvasRef={canvasRef}/>
        </div>
        <div className="flex-1 p-4 max-w-md overflow-auto">
            <SlideBar min={0} max={100} step={10} initialData={0} title="亮度" onValueChange={handleBrightness}/>
            <SlideBar title="對比"/>
            <SlideBar title="亮部"/>
            <SlideBar title="陰影"/>
            <SlideBar title="色溫"/>
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