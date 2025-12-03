"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Booking, Service } from "@/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    totalServices: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      router.push("/feed");
      return;
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // 모든 예약 조회
      const bookings = await fetchAPI("/api/bookings");

      // 서비스 목록 조회
      const services = await fetchAPI("/api/services");

      // 통계 계산
      setStats({
        totalBookings: bookings.length,
        pendingBookings: bookings.filter((b: Booking) => b.status === "PENDING").length,
        confirmedBookings: bookings.filter((b: Booking) => b.status === "CONFIRMED").length,
        completedBookings: bookings.filter((b: Booking) => b.status === "COMPLETED").length,
        totalServices: services.length,
      });

      // 최근 예약 5개
      setRecentBookings(bookings.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
      alert("대시보드 데이터를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: "bg-yellow-100 text-yellow-800",
      CONFIRMED: "bg-blue-100 text-blue-800",
      IN_PROGRESS: "bg-green-100 text-green-800",
      COMPLETED: "bg-gray-100 text-gray-800",
      CANCELLED: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: "대기",
      CONFIRMED: "확정",
      IN_PROGRESS: "진행중",
      COMPLETED: "완료",
      CANCELLED: "취소",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
              <p className="text-sm text-gray-600 mt-1">
                청소 서비스 관리 시스템
              </p>
            </div>
            <button
              onClick={() => router.push("/feed")}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              피드로 이동
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600 mb-2">전체 예약</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalBookings}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg shadow p-6 border border-yellow-200">
            <div className="text-sm text-yellow-700 mb-2">예약 대기</div>
            <div className="text-3xl font-bold text-yellow-900">
              {stats.pendingBookings}
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg shadow p-6 border border-blue-200">
            <div className="text-sm text-blue-700 mb-2">예약 확정</div>
            <div className="text-3xl font-bold text-blue-900">
              {stats.confirmedBookings}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg shadow p-6 border border-green-200">
            <div className="text-sm text-green-700 mb-2">작업 완료</div>
            <div className="text-3xl font-bold text-green-900">
              {stats.completedBookings}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg shadow p-6 border border-purple-200">
            <div className="text-sm text-purple-700 mb-2">등록 서비스</div>
            <div className="text-3xl font-bold text-purple-900">
              {stats.totalServices}
            </div>
          </div>
        </div>

        {/* 빠른 액션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <button
            onClick={() => router.push("/admin/bookings")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-2xl">
                📅
              </div>
              <div>
                <div className="font-bold text-gray-900">예약 관리</div>
                <div className="text-sm text-gray-600">
                  모든 예약 조회 및 상태 변경
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/admin/services")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-2xl">
                🧹
              </div>
              <div>
                <div className="font-bold text-gray-900">서비스 관리</div>
                <div className="text-sm text-gray-600">
                  서비스 추가, 수정, 삭제
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push("/services")}
            className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <div className="font-bold text-gray-900">고객 보기</div>
                <div className="text-sm text-gray-600">
                  고객용 페이지 보기
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* 최근 예약 */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">최근 예약</h2>
              <button
                onClick={() => router.push("/admin/bookings")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                전체 보기 →
              </button>
            </div>
          </div>
          {recentBookings.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              예약 내역이 없습니다.
            </div>
          ) : (
            <div className="divide-y">
              {recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => router.push(`/bookings/${booking.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-gray-900">
                          {booking.service.name}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          👤 {booking.customer.username} ({booking.customer.email})
                        </div>
                        <div>
                          📅 {formatDate(booking.bookingDate)}{" "}
                          {formatTime(booking.startTime)}
                        </div>
                        <div>📍 {booking.address}</div>
                      </div>
                    </div>
                    <div className="text-right ml-6">
                      <div className="text-lg font-bold text-blue-600">
                        {new Intl.NumberFormat("ko-KR").format(booking.price)}원
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
