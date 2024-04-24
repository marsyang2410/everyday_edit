'use client'

import Image from "next/image";
import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="flex flex-row w-full justify-between">
        <div className="w-1/2 p-4">
            <ImageUploader/>
        </div>
        <div className="w-1/2 p-4">
            <SlideBar/>
            <SlideBar/>
            <SlideBar/>
            <SlideBar/>
            <SlideBar/>
        </div>
      </div>
    </main>
  );
}
