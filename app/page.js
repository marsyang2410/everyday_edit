'use client'

import Image from "next/image";
import SlideBar from "./components/SlideBar.client.jsx";
import ImageUploader from "./components/ImageUpload.jsx";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ImageUploader/>
      <SlideBar/>
    </main>
  );
}
