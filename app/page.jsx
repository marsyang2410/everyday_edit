"use client";

import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";
import Header from "./components/Header.jsx"
import React, { useState, useEffect, useRef } from "react";
import { Button, Card, Collapse } from "reactstrap";


import * as cv from "@techstark/opencv-js"

const DEBUG = 0;

export default function Home() {
  const [src, setSrc] = useState(null);
  const canvasRef = useRef(null);
  const histCanvas = useRef(null);
  const [currentMat, setcurrentMat] = useState(null);
  const [brightness, setbrightness] = useState(1);
  const [contrast, setcontrast] = useState(127);
  const [saturation, setsaturation] = useState(1);
  const [shadow, setshadow] = useState(1);
  const [imageList, setimageList] = useState([])
  const [histgramReady, sethisgramReady] = useState(false);

  const matRef = useRef(null); 
  
  const drawDefaultBackground = (callback) => {
    const canvas = histCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "lightgray"; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"; // Set text color
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (callback) callback();
  };
  useEffect(() => {
   
    cv['onRuntimeInitialized']= () => {
      setcurrentMat(new cv.Mat());
    }
  }, []);

  useEffect(() => {
    if (!src) {
      drawDefaultBackground(()=>{
        sethisgramReady(true);
    });
    }
    
    if (src && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        // Resize canvas to match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
        if (matRef.current) {
          matRef.current.delete();
        }
        matRef.current = cv.imread(canvasRef.current);
        drawHistGram();
      };
      img.src = src;
    }
  }, [src]); // Dependency only on src
  useEffect(() => {
    console.log("matrix change");
    drawHistGram();
  }, [matRef.current]);

  const handleImageChange = (image) => {
    if (!canvasRef.current) return
    
    if( DEBUG ) return;
    console.log("handleImageChange");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
      matRef.current = cv.imread(canvasRef.current);
      drawHistGram();
    };
    img.src = image;
  }

  const drawHistGram = (flag = cv.COLOR_RGBA2GRAY) => {
    if (cv && cv.imread) {
      if (!canvasRef.current) return;
      let srcMat = new cv.Mat(); // Load your image into srcMat
      if( DEBUG ) return;
      if (!matRef.current) return;
      console.log(matRef.current);
      cv.cvtColor(matRef.current, srcMat, flag, 0); // Convert to grayscale

      // Calculate histogram
      let hist = new cv.Mat();
      let mask = new cv.Mat();
      let histSize = [256];
      let ranges = [0, 255];
      let srcVec = new cv.MatVector();
      srcVec.push_back(srcMat);
      cv.calcHist(srcVec, [0], mask, hist, histSize, ranges, false);

      let result = cv.minMaxLoc(hist, mask);
      let max = result.maxVal;

      // Setup canvas dimensions and drawing scale
      let canvas = histCanvas.current;
      const ctx = histCanvas.current.getContext("2d", {
        willReadFrequently: true,
      });
      let width = canvas.width;
      let height = canvas.height;
      let binWidth = Math.round(width / histSize[0]); // Width of each bin

      ctx.fillStyle = "lightgray"; // Set background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";

      for (let i = 0; i < histSize[0]; i++) {
        let binVal = (hist.data32F[i] * height) / max;
        ctx.fillRect(i * binWidth, height - binVal, binWidth, binVal);
      }

      srcMat.delete();
      hist.delete();
      mask.delete();
      srcVec.delete();
    } else {
      console.error("OpenCV.js not loaded");
    }
  };

  const handleBrightness = (newBrightness) => {
    if (!canvasRef.current || !matRef.current) return;

    let dstMat = new cv.Mat();
    matRef.current.convertTo(dstMat, -1, 1, newBrightness - brightness);
    console.log("Canvas reference:", canvasRef.current);
    console.log("dst matrix:", dstMat);
    if (dstMat.empty()) {
      console.error("Destination matrix is empty.");
      return;
    }
    try {
      cv.imshow(canvasRef.current, dstMat);
      matRef.current.delete();
      matRef.current = dstMat;
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    setbrightness(newBrightness);
  };
  function handleContrast(contrastValue) {
    if (!matRef.current) return;

    let dst = new cv.Mat();

    const B = 0 / 255.0;
    const c = contrastValue / 255.0;
    const k = Math.tan(((45 + 44 * c) * Math.PI) / 180);
    console.log(k);

    matRef.current.convertTo(
      dst,
      cv.CV_8U,
      k,
      127.5 * (1 - B) * -k + 127.5 * (1 + B)
    );
    try {
      cv.imshow(canvasRef.current, dst);
      matRef.current.delete();
      matRef.current = dst;
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    setcontrast(contrastValue);
  }

  function handleColorSaturation(saturationValue) {
    if (!canvasRef.current || !matRef.current) return;

    const canvas = canvasRef.current;
    let hsvMat = new cv.Mat();
    cv.cvtColor(matRef.current, hsvMat, cv.COLOR_RGB2HSV, 0);

    let lutWeaken = new cv.Mat(256, 1, cv.CV_8UC1);
    for (let i = 0; i < 256; ++i) {
      lutWeaken.data[i] = Math.max(Math.min(255, i * saturationValue),0);
    }

    let channels = new cv.MatVector();
    cv.split(hsvMat, channels);
    let tmp = new cv.Mat();
    cv.LUT(channels.get(1), lutWeaken, tmp);
    channels.set(1, tmp);

    let dst = new cv.Mat();
    cv.merge(channels, dst);
    cv.cvtColor(dst, dst, cv.COLOR_HSV2RGB, 0);
    try {
      cv.imshow(canvas, dst);
      matRef.current.delete();
      matRef.current = dst;
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    hsvMat.delete();
    lutWeaken.delete();
    channels.delete();
    tmp.delete();
    setsaturation(saturationValue);
  }

  function handleShadow(shadowValue) {
    if (!canvasRef.current || !matRef.current) return;

    let grayscaleMat = new cv.Mat();
    cv.cvtColor(matRef.current, grayscaleMat, cv.COLOR_RGB2GRAY, 0);

    let thresholdMat = new cv.Mat();
    cv.adaptiveThreshold(grayscaleMat, thresholdMat, 200, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 999, 2);
    
    let dstMat = new cv.Mat();
    cv.cvtColor(thresholdMat, dstMat, cv.COLOR_GRAY2RGB, 4);
    console.log(matRef.current.type(), dstMat.type());
    try{
      cv.addWeighted(matRef.current, 1.0, dstMat, 0.1, 0, dstMat);
    }
    catch(e){
      console.error(e);
    }
    try {
        cv.imshow(canvasRef.current, dstMat);
        matRef.current.delete(); 
        matRef.current = dstMat
    } catch (error) {
        console.error("Failed to display image on canvas:", error);
    } finally {
        grayscaleMat.delete();
        thresholdMat.delete();
    }
  }

  

  const sliders = [
    {
      min: -50,
      max: 50,
      step: 5,
      title: "亮度",
      initialData: 0,
      onValueChange: handleBrightness,
    },
    {
      min: -125,
      max: 125,
      step: 5,
      title: "對比",
      initialData: 0,
      onValueChange: handleContrast,
    },
    {
      min: 0.8,
      max: 1.2,
      step: 0.01,
      title: "鮮豔度",
      initialData: 1,
      onValueChange: handleColorSaturation,
    },
    {
      min: 0.8,
      max: 1.2,
      step: 0.01,
      title: "陰影",
      initialData: 1,
      onValueChange: handleShadow,
    },
  ];
  return (
  <div>
    <Header></Header>
  <main className="flex flex-col items-center justify-start p-10 min-h-screen w-full">
    <div className="flex flex-row w-full bg-red-100">
      <div className="w-1/2 p-4 bg-green-50">
      { histgramReady && (
        <ImageUploader
        imageSrc={src}
        setImageSrc={setSrc}
        canvasRef={canvasRef}
        setImageList={setimageList}
        />
      )}
      {src && (
        <div className="mt-4">
        <canvas 
        ref={canvasRef} 
        className="rounded-lg"
        style={{ maxWidth: '320px', height: '400px' }} 
        ></canvas>
        </div>
      )}
      </div>
      <div className="flex-1 p-4">
        <div className="flex flex-col"> 
        <div className="overflow-auto flex-grow">
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
        <div className="mt-4">
          <canvas ref={histCanvas} className="w-full"></canvas> 
        </div>
        </div>
      </div>
    <div className="w-full p-4 bg-black">
      <div className="flex space-x-4">
      {imageList.map((image, index) => (
      <button key={index} className="focus:outline-none" onClick={()=>{
      // console.log("clicked!");
      handleImageChange(image);
      }}>
      <img src={image} alt="image description" className="w-24 h-32 object-cover" />
      </button>
      ))}

      <div className="w-24 h-32">
      { histgramReady && (
      <ImageUploader
      imageSrc={null}
      setImageSrc={setSrc}
      setImageList={setimageList}
      Text = ""
      />)}
        </div>
      </div>
    </div>
  </main>
  </div>
  );
}
