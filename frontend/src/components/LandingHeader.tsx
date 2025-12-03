"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LandingHeader() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "청소", path: "/cleaning" },
    { name: "견적보기", path: "/quote" },
    { name: "예약하기", path: "/reservation" },
    { name: "게시판", path: "/board" },
    { name: "로그인/회원가입", path: "/login" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* 1. Brand Logo */}
          <div
            className="flex-shrink-0 cursor-pointer flex items-center gap-1" // gap-2를 추가하여 로고와 텍스트 사이 간격을 줍니다
            onClick={() => router.push("/")}
          >
            {/* 로고 이미지 추가 */}
            <Image
              src="/image/집클릭.png" // public 폴더 안의 파일은 '/'로 시작하면 됩니다
              alt="jipClick Logo"
              width={70} // 로고 크기 (원하는 크기로 조절하세요)
              height={50} // 로고 크기
            />

            <span className="text-1xl font-extrabold text-black-900 tracking-tight leading-none pb-1">
              jipClick
            </span>
          </div>

          {/* 2. Right Side: Navigation + Hamburger */}
          <div className="flex items-center gap-8">
            {/* PC Navigation (Hidden on Mobile) */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="text-base font-medium text-gray-600 hover:text-blue-900 transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Hamburger Button (Always visible based on request order) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-900 hover:bg-gray-100 focus:outline-none transition-all"
              aria-label="메뉴 열기"
            >
              {isMenuOpen ? (
                /* Close Icon (X) */
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                /* Hamburger Icon */
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-4 text-base font-medium text-gray-600 hover:text-blue-900 hover:bg-gray-50 rounded-md border-b border-gray-50 last:border-0"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
