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
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
  IN_PROGRESS: "bg-green-100 text-green-800 border-green-200",
  COMPLETED: "bg-gray-100 text-gray-800 border-gray-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<BookingStatus | "ALL">("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      router.push("/feed");
      return;
    }
    fetchBookings();
  }, [selectedStatus]);

  const fetchBookings = async () => {
    try {
      const url = selectedStatus === "ALL"
        ? "/api/bookings"
        : `/api/bookings?status=${selectedStatus}`;
      const data = await fetchAPI(url);
      setBookings(data);
    } catch (error) {
      console.error("Failed to fetch bookings", error);
      alert("예약 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: number, newStatus: BookingStatus) => {
    if (!confirm(`예약 상태를 '${STATUS_LABELS[newStatus]}'로 변경하시겠습니까?`)) {
      return;
    }

    try {
      await fetchAPI(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      alert("예약 상태가 변경되었습니다.");
      fetchBookings();
    } catch (error: any) {
      console.error("Failed to change status", error);
      alert(error.message || "상태 변경에 실패했습니다.");
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("예약을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await fetchAPI(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      alert("예약이 삭제되었습니다.");
      fetchBookings();
    } catch (error: any) {
      console.error("Failed to delete booking", error);
      alert(error.message || "예약 삭제에 실패했습니다.");
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
    return time.substring(0, 5);
  };

  const getNextStatus = (currentStatus: BookingStatus): BookingStatus | null => {
    const statusFlow: Record<BookingStatus, BookingStatus | null> = {
      PENDING: "CONFIRMED",
      CONFIRMED: "IN_PROGRESS",
      IN_PROGRESS: "COMPLETED",
      COMPLETED: null,
      CANCELLED: null,
    };
    return statusFlow[currentStatus];
  };

  const filteredBookings = bookings.filter((booking) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      booking.customer.username.toLowerCase().includes(search) ||
      booking.customer.email.toLowerCase().includes(search) ||
      booking.service.name.toLowerCase().includes(search) ||
      booking.address.toLowerCase().includes(search)
    );
  });

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
              <h1 className="text-3xl font-bold text-gray-900">예약 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                총 {filteredBookings.length}개의 예약
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                대시보드로 이동
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 필터 및 검색 */}
        <div className="mb-6 space-y-4">
          {/* 상태 필터 */}
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

          {/* 검색 */}
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="고객명, 이메일, 서비스명, 주소로 검색..."
              className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* 예약 목록 */}
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">📅</div>
            <p className="text-gray-600">예약 내역이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    {/* 서비스 및 고객 정보 */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">
                          {booking.service.name}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            STATUS_COLORS[booking.status]
                          }`}
                        >
                          {STATUS_LABELS[booking.status]}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>
                          👤 {booking.customer.username} ({booking.customer.email})
                        </div>
                        {booking.customer.phone && (
                          <div>📞 {booking.customer.phone}</div>
                        )}
                      </div>
                    </div>

                    {/* 가격 */}
                    <div className="text-right ml-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatPrice(booking.price)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        예약 번호: #{booking.id}
                      </div>
                    </div>
                  </div>

                  {/* 예약 상세 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
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
                  </div>

                  {/* 특이사항 */}
                  {booking.specialRequest && (
                    <div className="p-3 bg-yellow-50 rounded-lg mb-4 border border-yellow-200">
                      <div className="text-sm text-yellow-800 font-medium mb-1">
                        📝 특이사항
                      </div>
                      <div className="text-sm text-gray-900">
                        {booking.specialRequest}
                      </div>
                    </div>
                  )}

                  {/* 작업 완료 정보 */}
                  {booking.status === "COMPLETED" && booking.completedAt && (
                    <div className="p-4 bg-green-50 rounded-lg mb-4 border border-green-200">
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

                    {/* 상태 변경 버튼 */}
                    {getNextStatus(booking.status) && (
                      <button
                        onClick={() => handleStatusChange(booking.id, getNextStatus(booking.status)!)}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {STATUS_LABELS[getNextStatus(booking.status)!]}로 변경
                      </button>
                    )}

                    {/* 취소 버튼 (진행중이나 완료된 경우 제외) */}
                    {booking.status !== "IN_PROGRESS" &&
                     booking.status !== "COMPLETED" &&
                     booking.status !== "CANCELLED" && (
                      <button
                        onClick={() => handleStatusChange(booking.id, "CANCELLED")}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        예약 취소
                      </button>
                    )}

                    {/* 삭제 버튼 */}
                    {(booking.status === "CANCELLED" || booking.status === "COMPLETED") && (
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
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
