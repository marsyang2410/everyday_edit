"use client";

import SlideBar from "./components/SliderBar.jsx";
import ImageUploader from "./components/ImageUpload.jsx";
import Header from "./components/Header.jsx";
import IconButton from "./components/IconButton.jsx";
import Collapse from "./components/Collapse.jsx";
import Card from "./components/Card.jsx";
import CardButton from "./components/CardButton.jsx";
import filter from "./js/filter.js";
import React, { useState, useEffect, useRef } from "react";
import './page.css'

import * as cv from "@techstark/opencv-js";

const DEBUG = 0;

export default function Home() {
  const [src, setSrc] = useState(null);
  const canvasRef = useRef(null);
  const histCanvas = useRef(null);
  const [currentMat, setCurrentMat] = useState(null);
  const [brightness, setBrightness] = useState(1);
  const [contrast, setContrast] = useState(127);
  const [saturation, setSaturation] = useState(1);
  const [shadow, setShadow] = useState(1);
  const [light, setLight] = useState(1);
  const [tempature, setTempature] = useState(1);
  const [imageList, setImageList] = useState([]);
  const [imageIdx, setImageIdx] = useState(0);
  const [histogramReady, setHistogramReady] = useState(false);

  const drawDefaultBackground = (callback) => {
    const canvas = histCanvas.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "white"; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "black"; // Set text color
    ctx.font = "20px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (callback) callback();
  };

  useEffect(() => {
    cv["onRuntimeInitialized"] = () => {
      setCurrentMat(new cv.Mat());
    };
  }, []);

  useEffect(() => {
    if (!src) {
      drawDefaultBackground(() => {
        setHistogramReady(true);
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
        const mat = cv.imread(canvas);
        setCurrentMat(mat);
        drawHistGram();
      };
      img.src = src;
    }
  }, [src]);

  const refresh = () => {
    if (imageList[imageIdx] && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        // Resize canvas to match image dimensions
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
        const mat = cv.imread(canvas);
        setCurrentMat(mat);
        drawHistGram();
      };
      img.src = imageList[imageIdx];
    }
  };

  useEffect(() => {
    if (currentMat && !currentMat.empty()) {
      console.log("matrix change");
      drawHistGram();
    }
  }, [currentMat]);

  const handleImageChange = (image) => {
    if (!canvasRef.current) return;

    if (DEBUG) return;
    console.log("handleImageChange");
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0); // Draw the image at the top left corner
      const mat = cv.imread(canvas);
      setCurrentMat(mat);
      drawHistGram();
    };
    img.src = image;
  };

  const drawHistGram = (flag = cv.COLOR_RGBA2GRAY) => {
    if (!cv || !cv.imread || !canvasRef.current || !currentMat) return;

    let srcMat = new cv.Mat();
    cv.cvtColor(currentMat, srcMat, flag, 4); // Convert to grayscale

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
    let binWidth = width / 256; // Width of each bin

    ctx.fillStyle = "white"; // Set background color
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 1; 
    ctx.beginPath();
    for (let i = 0; i < 256; i++) {
      let binVal = (hist.data32F[i] * height) / max;
      if (i === 0) {
        ctx.moveTo(i * binWidth + binWidth / 2, height - binVal);
      } else {
        ctx.lineTo(i * binWidth + binWidth / 2, height - binVal);
      }
    }
    ctx.stroke();

    srcMat.delete();
    hist.delete();
    mask.delete();
    srcVec.delete();
  };

  const handleAESHE = () => {
    if (!canvasRef.current || !currentMat) return;

    let dst = filter.AESHE(currentMat);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }

  const handleCLAHE = () => {
    if (!canvasRef.current || !currentMat) return;

    let dst = filter.CLAHE(currentMat);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }

  const handleWinter = () => {
    if (!canvasRef.current || !currentMat) return;

    let dst = filter.Winter(currentMat);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }

  const handleSummmer = () => {
    if (!canvasRef.current || !currentMat) return;

    let dst = filter.Summer(currentMat);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }

  const handleColorMix = () => {
    if (!canvasRef.current || !currentMat) return;
    let tmp = cv.imread("img")
    console.log(currentMat)
    let dst = filter.processImages(currentMat, tmp);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }
  // tempature commit 1
  const handleTempature = (tempatureValue) => {
    if (!canvasRef.current || !currentMat) return;

    let dst = filter.adjustColorTemperature(currentMat, tempatureValue - tempature);
    setTempature(tempatureValue);
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
  }

  const handleBrightness = (newBrightness) => {
    if (!canvasRef.current || !currentMat) return;

    let dstMat = new cv.Mat();
    currentMat.convertTo(dstMat, -1, 1, newBrightness - brightness);
    if (dstMat.empty()) {
      console.error("Destination matrix is empty.");
      return;
    }
    try {
      cv.imshow(canvasRef.current, dstMat);
      setCurrentMat(dstMat);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    setBrightness(newBrightness);
  };

  const handleContrast = (contrastValue) => {
    if (!currentMat) return;

    let dst = new cv.Mat();

    const B = 0 / 255.0;
    const c = contrastValue / 255.0;
    const k = Math.tan(((45 + 44 * c) * Math.PI) / 180);

    currentMat.convertTo(dst, cv.CV_8U, k, 127.5 * (1 - B) * -k + 127.5 * (1 + B));
    try {
      cv.imshow(canvasRef.current, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }
    setContrast(contrastValue);
  };

  const handleColorSaturation = (saturationValue) => {
    if (!canvasRef.current || !currentMat) return;

    const canvas = canvasRef.current;
    let hsvMat = new cv.Mat();
    cv.cvtColor(currentMat, hsvMat, cv.COLOR_RGB2HSV, 4);

    let lutWeaken = new cv.Mat(256, 1, cv.CV_8UC1);
    for (let i = 0; i < 256; ++i) {
      lutWeaken.data[i] = Math.max(Math.min(255, i * saturationValue), 0);
    }

    let channels = new cv.MatVector();
    cv.split(hsvMat, channels);
    let tmp = new cv.Mat();
    cv.LUT(channels.get(1), lutWeaken, tmp);
    channels.set(1, tmp);

    let dst = new cv.Mat();
    cv.merge(channels, dst);
    cv.cvtColor(dst, dst, cv.COLOR_HSV2RGB, 4);
    try {
      cv.imshow(canvas, dst);
      setCurrentMat(dst);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    }

    hsvMat.delete();
    lutWeaken.delete();
    channels.delete();
    tmp.delete();
    setSaturation(saturationValue);
  };

  const handleShadow = (shadowValue) => {
    if (!canvasRef.current || !currentMat) return;

    let grayscaleMat = new cv.Mat();
    cv.cvtColor(currentMat, grayscaleMat, cv.COLOR_RGBA2GRAY, 4);

    let thresholdMat = new cv.Mat();
    cv.adaptiveThreshold(grayscaleMat, thresholdMat, 200, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY_INV, 999, 2);

    let dstMat = new cv.Mat();
    cv.cvtColor(thresholdMat, dstMat, cv.COLOR_GRAY2RGBA, 4);

    try {
      cv.addWeighted(currentMat, 1.0, dstMat, shadowValue, 0, dstMat);
      cv.imshow(canvasRef.current, dstMat);
      setCurrentMat(dstMat);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    } finally {
      grayscaleMat.delete();
      thresholdMat.delete();
    }

    setShadow(shadowValue);
  };

  const handleLight = (lightValue) => {
    if (!canvasRef.current || !currentMat) return;
  
    let grayscaleMat = new cv.Mat();
    cv.cvtColor(currentMat, grayscaleMat, cv.COLOR_RGBA2GRAY, 4);
  
    let thresholdMat = new cv.Mat();
    cv.adaptiveThreshold(grayscaleMat, thresholdMat, 200, cv.ADAPTIVE_THRESH_MEAN_C, cv.THRESH_BINARY, 999, 2);
  
    let dstMat = new cv.Mat();
    cv.cvtColor(thresholdMat, dstMat, cv.COLOR_GRAY2RGBA, 4);
  
    try {
      cv.addWeighted(currentMat, 1.0, dstMat, lightValue, 0, dstMat);
      cv.imshow(canvasRef.current, dstMat);
      setCurrentMat(dstMat);
    } catch (error) {
      console.error("Failed to display image on canvas:", error);
    } finally {
      grayscaleMat.delete();
      thresholdMat.delete();
    }
  
    setLight(lightValue);
  };
  

  const filters = [
    {
      onClick: handleAESHE,
      title: "Balanced Contrast Booster (AESHE)",
      description: "Enhances image contrast adaptively while preserving color integrity and details",
      imageSrc: "/img/sample.png"
    },
    {
      onClick: handleCLAHE,
      title: "Balanced Contrast Booster (CLAHE)",
      description: "Enhances image contrast adaptively while preserving color integrity and details",
      imageSrc: "/img/sample.png"
    },
    {
      onClick: handleWinter,
      title: "Winter",
      description: "Cool, blueish tint to images, enhancing the cold and crisp feel of winter scenes.",
      imageSrc: "/img/winter.webp"

    },
    {
      onClick: handleSummmer,
      title: "Summer",
      description: "Warm, golden hue to images, intensifying the brightness and vibrancy typical of sunny summer days",
      imageSrc: "/img/summer.webp"

    },
    {
      onClick: handleColorMix,
      title: "ColorMix",
      description: "Mix the art art with the uploaded photo",
      imageSrc: "/img/target_image.jpg",
      id: "img"
    },
  ];

  const sliderColor = [
    {
      min: 0.8,
      max: 1.2,
      step: 0.01,
      title: "鮮豔度",
      initialData: 1,
      backgroundType: 'greenToPurple',
      onValueChange: handleColorSaturation,
    },
    {
      min: -20,
      max: 20,
      step: 0.5,
      title: "色溫",
      initialData: 0,
      backgroundType: 'blueToYellow',
      onValueChange: handleTempature,
    },
  ];

  const sliderLight = [
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
      min: -0.5,
      max: 0.5,
      step: 0.01,
      title: "陰影",
      initialData: 0,
      onValueChange: handleShadow,
    },
    {
      min: -0.5,
      max: 0.5,
      step: 0.01,
      title: "亮部",
      initialData: 0,
      onValueChange: handleLight,
    },
  ];

  return (
    <div className="overflow-hidden">
      <Header />
      <main className="flex flex-col items-center justify-start bg-white min-h-screen w-full">
        <div className="flex flex-row w-full border-b border-black">
          <div className="w-1/2 p-4 overflow-hidden mt-4">
            {histogramReady && (
              <ImageUploader
                imageSrc={src}
                setImageSrc={setSrc}
                canvasRef={canvasRef}
                setImageList={setImageList}
              >
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
              </ImageUploader>
            )}
            {src && (
              <div className="flex justify-center bg-stone-200">
                <canvas ref={canvasRef} style={{ maxWidth: "320px", height: "400px" }} />
              </div>
            )}
            <div className="flex justify-center space-x-20 mt-10">
              <IconButton onClick={refresh}>
                <svg
                  className="w-[48px] h-[48px] text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"
                  />
                </svg>
              </IconButton>

              <IconButton>
                <svg
                  className="w-[48px] h-[48px] text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z"
                  />
                </svg>
              </IconButton>

              <IconButton>
                <svg
                  className="w-[48px] h-[48px] text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 13V4M7 14H5a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-2m-1-5-4 5-4-5m9 8h.01"
                  />
                </svg>
              </IconButton>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-hidden">
            <div className="mt-4 mb-4 border-2">
              <canvas ref={histCanvas} className="w-full"></canvas>
            </div>
            <div className="flex flex-col ">
              <Collapse text="濾鏡">
              <div className="overflow-auto flex-grow spacing-container">
                {filters.map((filter, index) => (
                  <CardButton onClick={filter.onClick} key={index}>
                    <Card 
                      imageSrc={filter.imageSrc}
                      title={filter.title}
                      description={filter.description}
                      id={filter.id? filter.id : undefined}
                    />
                  </CardButton>
                ))}
              </div>
              </Collapse>
              <Collapse text="顏色">
                <div className="overflow-auto flex-grow spacing-container">
                  {sliderColor.map((slider, index) => (
                    <SlideBar
                      key={index}
                      min={slider.min}
                      max={slider.max}
                      step={slider.step}
                      initialData={slider.initialData}
                      title={slider.title}
                      onValueChange={slider.onValueChange}
                      backgroundType={slider.backgroundType}
                    />
                  ))}
                </div>
              </Collapse>
              <Collapse text="光線">
                <div className="overflow-auto flex-grow spacing-container">
                  {sliderLight.map((slider, index) => (
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
              </Collapse>
            </div>
          </div>
        </div>
        <div className="w-full p-4">
          <div className="flex space-x-4">
            {imageList.map((image, index) => (
              <button
                key={index}
                className="focus:outline-none"
                onClick={() => handleImageChange(image)}
              >
                <img src={image} alt="image description" className="w-24 h-32 object-cover" />
              </button>
            ))}

            <div className="w-24 h-32">
              {histogramReady && (
                <ImageUploader
                  imageSrc={null}
                  setImageSrc={setSrc}
                  setImageList={setImageList}
                  Text=""
                >
                <p className="mb-1 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> </p>
                </ImageUploader>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
