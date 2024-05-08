"use client";

import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";
import Header from "./components/Header.jsx"
import React, { useState, useEffect, useRef } from "react";
import * as cv from "@techstark/opencv-js"

const DEBUG = 0;

export default function Home() {
  const [src, setSrc] = useState(null);
  const canvasRef = useRef(null);
  const histCanvas = useRef(null);
  const [currentMat, setcurrentMat] = useState(null);
  const [brightness, setbrightness] = useState(1);
  const [contrast, setcontrast] = useState(127);
  const [saturation, setsaturation] = useState(127);
  const [whitePatchness, setwhitepatch] = useState(127);
  const [imageList, setimageList] = useState([])

  const matRef = useRef(null); // Using a ref to manage OpenCV Mat objects
  // console.log(Object.keys(cv).filter((key) => !key.includes("dynCall")));

  const drawDefaultBackground = () => {
    const canvas = histCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "lightgray"; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"; // Set text color
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    // ctx.fillText("No Image Loaded", canvas.width / 2, canvas.height / 2);
  };
  useEffect(() => {
    // Assuming OpenCV is attached to the window object
    cv['onRuntimeInitialized']= () => {
      setcurrentMat(new cv.Mat());
    }
  }, []);

  useEffect(() => {
    if (!src) {
      drawDefaultBackground();
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

      // Clear the canvas
      ctx.fillStyle = "lightgray"; // Set background color
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "white";

      // Draw histogram
      for (let i = 0; i < histSize[0]; i++) {
        let binVal = (hist.data32F[i] * height) / max;
        ctx.fillRect(i * binWidth, height - binVal, binWidth, binVal);
      }

      // Clean up
      srcMat.delete();
      hist.delete();
      mask.delete();
      srcVec.delete();
    } else {
      console.error("OpenCV.js not loaded");
    }
  };

  // Example function to adjust brightness using a slider
  const handleBrightness = (newBrightness) => {
    if (!matRef.current) return;
    if (canvasRef.current) {
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
    }
  };
  function handleContrast(contrastValue) {
    if (!matRef.current) return;

    // Create destination matrix
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
    if (!canvasRef.current) return;
    if (!matRef.current) return;

    const canvas = canvasRef.current;

    // Convert to HSV
    let hsvMat = new cv.Mat();
    cv.cvtColor(matRef.current, hsvMat, cv.COLOR_RGB2HSV, 0);

    let lutWeaken = new cv.Mat(256, 1, cv.CV_8UC1);

    for (let i = 0; i < 256; ++i) {
      lutWeaken.data[i] = Math.min(Math.max(255, i * saturation));
    }
    let channels = new cv.MatVector();
    cv.split(hsvMat, channels);
    let tmp = new cv.Mat();
    console.table(channels.get(1))
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
    setsaturation(saturationValue);
  }

  function handleWhitePatch(whitePatchValue) {
    if (!canvasRef.current) return;

    let gray = new cv.Mat();
    cv.cvtColor(matRef.current, gray, cv.COLOR_BGR2GRAY);

    let sorted = cv.sort(gray, cv.SORT_ASCENDING);
    let index = Math.floor((sorted.rows * sorted.cols * whitePatchValue) / 100);
    let threshold = sorted.ucharPtr(
      Math.floor(index / sorted.cols),
      index % sorted.cols
    )[0];
    sorted.delete();

    let whitePatch = new cv.Mat();
    gray.convertTo(whitePatch, cv.CV_32F, 1.0 / threshold);
    cv.min(
      whitePatch,
      new cv.Mat(gray.rows, gray.cols, cv.CV_32F, new cv.Scalar(1.0)),
      whitePatch
    );

    let output = new cv.Mat();
    whitePatch.convertTo(whitePatch, cv.CV_8U, 255.0);
    cv.cvtColor(whitePatch, output, cv.COLOR_GRAY2BGR);

    try {
      cv.imshow(canvas, output);
      matRef.current.delete();
      matRef.current = output;
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    gray.delete();
    whitePatch.delete();
    setwhitepatch(whitePatchValue);
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
      min: 0,
      max: 2,
      step: 0.1,
      title: "鮮豔度",
      initialData: 1,
      onValueChange: handleColorSaturation,
    },
    {
      min: 0,
      max: 100,
      step: 1,
      title: "白平衡",
      initialData: 50,
      onValueChange: handleWhitePatch,
    },
  ];
  return (
    <div>
    <Header></Header>
    <main className="flex flex-col items-center justify-start p-10 min-h-screen w-full">
    <div className="flex flex-row w-full bg-red-100">
      <div className="w-1/2 p-4 bg-green-50">
        <ImageUploader
          imageSrc={src}
          setImageSrc={setSrc}
          canvasRef={canvasRef}
          setImageList={setimageList}
        />
        {src && (
          <div className="mt-4">
            <canvas 
              ref={canvasRef} 
              className="rounded-lg"
              style={{ maxWidth: '320px', height: '400px' }} // Use percentage for width for responsiveness
            ></canvas>
          </div>
        )}
      </div>
      <div className="flex-1 p-4">
        <div className="flex flex-col h-full"> {/* Adjusted to fill the column space */}
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
          <div className="mt-4">
            <canvas ref={histCanvas} className="w-full"></canvas>
          </div>
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
          <ImageUploader
            imageSrc={null}
            setImageSrc={setSrc}
            setImageList={setimageList}
            Text = ""
          />
        </div>
      </div>
    </div>
  </main>
  </div>
  
  );
}
