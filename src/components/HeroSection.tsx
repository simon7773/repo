"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

interface HeroSectionProps {
  scrollY: number;
  isVisible: boolean;
}

export default function HeroSection({ scrollY, isVisible }: HeroSectionProps) {
  const router = useRouter();

  return (
    <section className="relative pt-40 pb-80 px-4 overflow-hidden min-h-screen">
      {/* 배경 이미지 */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/image/main.jpg"
          alt="청소 서비스 배경"
          fill
          className="object-cover opacity-100"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/60"></div>
      </div>

      <div
        className={`max-w-7xl mx-auto relative z-10 transition-all duration-1000 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div className="text-center">
          <br></br>
          <br></br>
          <br></br>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="block bg-gradient-to-r from-yellow-300 via-green-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              청결은 서비스가 아닌,
            </span>
            <br></br>
            <span className="block text-blue-500">
              공간이 갖춰야 할{" "}
              <span className="text-indigo-900 font-extrabold">
                최고의 품격
              </span>
              입니다.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
            최선에서 <span className="text-blue-600 font-semibold">최고로</span>
            , 청소가 끝나면 행복이 시작됩니다.{" "}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center"></div>
        </div>
      </div>
    </section>
  );
}
