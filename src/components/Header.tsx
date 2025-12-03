"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User } from "@/types";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isClient, setIsClient] = useState(false);

  // 클라이언트 사이드에서만 실행
  useEffect(() => {
    setIsClient(true);
    checkLoginStatus();

    // storage 이벤트 리스너 추가 (다른 탭에서 로그인/로그아웃 시 동기화)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener("storage", handleStorageChange);
    // 커스텀 이벤트 리스너 추가 (같은 탭에서 로그인/로그아웃 시)
    window.addEventListener("auth-change", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("auth-change", handleStorageChange);
    };
  }, []);

  const checkLoginStatus = () => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");

    if (token && userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error("사용자 정보 파싱 실패:", error);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // 커스텀 이벤트 발생
    window.dispatchEvent(new Event("auth-change"));
    router.push("/");
  };

  const navItems = [
    { name: "청소", path: "/cleaning" },
    { name: "견적보기", path: "/quote" },
    { name: "예약관리", path: "/reservation" },
    { name: "리뷰", path: "/feed" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-white border-b border-gray-100 z-50 h-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex justify-between items-center h-full">
          {/* 1. Brand Logo */}
          <div
            className="flex-shrink-0 cursor-pointer flex items-center gap-1"
            onClick={() => router.push("/")}
          >
            {/* 로고 이미지 추가 */}
            <Image
              src="/image/집클릭.png"
              alt="jipClick Logo"
              width={60}
              height={40}
            />

            <span className="text-1xl font-extrabold text-black-900 tracking-tight leading-none pb-1">
              jipClick
            </span>
          </div>

          {/* 2. Right Side: Navigation */}
          <div className="flex items-center gap-3">
            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 focus:outline-none focus:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all"
                >
                  {item.name}
                </Link>
              ))}

              {/* 로그인 상태에 따른 버튼 */}
              {isClient && (
                <>
                  {user ? (
                    <>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 focus:outline-none focus:shadow-[0_0_20px_rgba(239,68,68,0.6)] transition-all"
                      >
                        로그아웃
                      </button>
                      <span className="px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg shadow-sm">
                        {user.username}님
                      </span>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-lg hover:bg-green-600 focus:outline-none focus:shadow-[0_0_20px_rgba(34,197,94,0.6)] transition-all"
                    >
                      로그인/회원가입
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
