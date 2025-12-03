"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Booking, BookingStatus } from "@/types";

const STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "예약 대기",
  CONFIRMED: "예약 확정",
  IN_PROGRESS: "작업 중",
  COMPLETED: "완료",
  CANCELLED: "취소됨",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-green-100 text-green-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function MyBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">("ALL");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      const url = selectedStatus === "ALL"
        ? "/api/bookings/my"
        : `/api/bookings/my?status=${selectedStatus}`;
      const data = await fetchAPI(url);
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      alert("예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      await fetchAPI(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      alert("예약이 취소되었습니다.");
      fetchBookings(); // 목록 새로고침
    } catch (error: any) {
      console.error("Failed to cancel booking", error);
      alert(error.message || "예약 취소에 실패했습니다.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // HH:mm 형식으로
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
              <h1 className="text-3xl font-bold text-gray-900">내 예약 목록</h1>
              <p className="mt-1 text-sm text-gray-600">
                총 {bookings.length}개의 예약
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/services")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새 예약 추가
              </button>
              <button
                onClick={() => router.push("/feed")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                피드로 이동
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 상태 필터 */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedStatus === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              전체
            </button>
            {(Object.keys(STATUS_LABELS) as BookingStatus[]).map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {STATUS_LABELS[status]}
              </button>
            ))}
          </div>
        </div>

        {/* 예약 목록 */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📅</div>
            <p className="text-gray-600 mb-4">예약 내역이 없습니다.</p>
            <button
              onClick={() => router.push("/services")}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              서비스 예약하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* 서비스 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_COLORS[booking.status]
                          }`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        {booking.service.description}
                      </p>
                    </div>

                    {/* 가격 */}
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(booking.price)}
                      </div>
                    </div>
                  </div>

                  {/* 예약 상세 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-sm">📅 예약 날짜</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatDate(booking.bookingDate)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-sm">⏰ 작업 시간</span>
                      </div>
                      <div className="font-semibold text-gray-900">
                        {formatTime(booking.startTime)} ~ {formatTime(booking.endTime)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-gray-500 text-sm">📍 주소</span>
                      </div>
                      <div className="font-medium text-gray-900">
                        {booking.address}
                        {booking.detailAddress && (
                          <span className="text-gray-600">
                            {" "}({booking.detailAddress})
                          </span>
                        )}
                      </div>
                    </div>
                    {booking.specialRequest && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-gray-500 text-sm">📝 특이사항</span>
                        </div>
                        <div className="font-medium text-gray-900">
                          {booking.specialRequest}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 작업 완료 정보 */}
                  {booking.status === "COMPLETED" && booking.completedAt && (
                    <div className="p-4 bg-green-50 rounded-lg mb-4">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <span className="text-sm font-semibold">✓ 작업 완료</span>
                      </div>
                      <div className="text-sm text-green-700">
                        완료 일시: {formatDate(booking.completedAt)}{" "}
                        {formatTime(new Date(booking.completedAt).toLocaleTimeString("ko-KR"))}
                      </div>
                    </div>
                  )}

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      상세 보기
                    </button>
                    {booking.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          수정하기
                        </button>
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          취소하기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
