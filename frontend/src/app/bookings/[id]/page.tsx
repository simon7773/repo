"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/");
      return;
    }
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const data = await fetchAPI(`/api/bookings/${bookingId}`);
      setBooking(data);
    } catch (error: any) {
      console.error("Failed to fetch booking", error);
      alert(error.message || "예약 정보를 불러오는데 실패했습니다.");
      router.push("/bookings/my");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!confirm("예약을 취소하시겠습니까?")) {
      return;
    }

    try {
      await fetchAPI(`/api/bookings/${bookingId}`, {
        method: "DELETE",
      });
      alert("예약이 취소되었습니다.");
      router.push("/bookings/my");
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

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← 뒤로
            </button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">예약 상세</h1>
              <p className="text-sm text-gray-600 mt-1">
                예약 번호: #{booking.id}
              </p>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${
                STATUS_COLORS[booking.status]
              }`}
            >
              {STATUS_LABELS[booking.status]}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* 서비스 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🧹 서비스 정보
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {booking.service.name}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {booking.service.description}
                  </p>
                </div>
                <div className="text-right ml-6">
                  <div className="text-sm text-gray-500">결제 금액</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(booking.price)}
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">카테고리</span>
                  <div className="font-medium text-gray-900 mt-1">
                    {booking.service.category}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500">소요 시간</span>
                  <div className="font-medium text-gray-900 mt-1">
                    {booking.service.duration}분
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 예약 일정 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📅 예약 일정
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 font-medium mb-2">
                  예약 날짜
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatDate(booking.bookingDate)}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 font-medium mb-2">
                  작업 시간
                </div>
                <div className="text-xl font-bold text-gray-900">
                  {formatTime(booking.startTime)} ~ {formatTime(booking.endTime)}
                </div>
              </div>
            </div>
          </div>

          {/* 작업 장소 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📍 작업 장소
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-500 mb-1">주소</div>
                <div className="font-medium text-gray-900">{booking.address}</div>
              </div>
              {booking.detailAddress && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">상세 주소</div>
                  <div className="font-medium text-gray-900">
                    {booking.detailAddress}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 특이사항 */}
          {booking.specialRequest && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📝 특이사항
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {booking.specialRequest}
                </p>
              </div>
            </div>
          )}

          {/* 고객 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              👤 고객 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500 mb-1">이름</div>
                <div className="font-medium text-gray-900">
                  {booking.customer.username}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">이메일</div>
                <div className="font-medium text-gray-900">
                  {booking.customer.email}
                </div>
              </div>
              {booking.customer.phone && (
                <div>
                  <div className="text-sm text-gray-500 mb-1">연락처</div>
                  <div className="font-medium text-gray-900">
                    {booking.customer.phone}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 작업 완료 정보 */}
          {booking.status === "COMPLETED" && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                ✅ 작업 완료 정보
              </h2>
              {booking.completedAt && (
                <div className="p-4 bg-green-50 rounded-lg mb-4">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    완료 일시
                  </div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDateTime(booking.completedAt)}
                  </div>
                </div>
              )}

              {/* 작업 전 사진 */}
              {booking.beforeImages.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    작업 전 사진
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.beforeImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                          alt={`작업 전 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 작업 후 사진 */}
              {booking.afterImages.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    작업 후 사진
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {booking.afterImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}${image}`}
                          alt={`작업 후 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 예약 생성 정보 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ℹ️ 예약 정보
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500 mb-1">예약 생성 일시</div>
                <div className="font-medium text-gray-900">
                  {formatDateTime(booking.createdAt)}
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">최종 수정 일시</div>
                <div className="font-medium text-gray-900">
                  {formatDateTime(booking.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* 액션 버튼 */}
          <div className="flex gap-4">
            {booking.status === "PENDING" && (
              <>
                <button
                  onClick={() => router.push(`/bookings/${booking.id}/edit`)}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  예약 수정
                </button>
                <button
                  onClick={handleCancelBooking}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  예약 취소
                </button>
              </>
            )}
            {booking.status !== "PENDING" && (
              <button
                onClick={() => router.push("/bookings/my")}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                목록으로 돌아가기
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
