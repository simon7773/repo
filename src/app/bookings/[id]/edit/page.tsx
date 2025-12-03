"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Booking } from "@/types";

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 폼 데이터
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [address, setAddress] = useState("");
  const [detailAddress, setDetailAddress] = useState("");
  const [specialRequest, setSpecialRequest] = useState("");

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

      // PENDING 상태가 아니면 수정 불가
      if (data.status !== "PENDING") {
        alert("대기 중인 예약만 수정할 수 있습니다.");
        router.push(`/bookings/${bookingId}`);
        return;
      }

      setBooking(data);

      // 기존 데이터로 폼 초기화
      setBookingDate(data.bookingDate.split("T")[0]); // YYYY-MM-DD 형식
      setStartTime(data.startTime.substring(0, 5)); // HH:mm
      setEndTime(data.endTime.substring(0, 5)); // HH:mm
      setAddress(data.address);
      setDetailAddress(data.detailAddress || "");
      setSpecialRequest(data.specialRequest || "");
    } catch (error: any) {
      console.error("Failed to fetch booking", error);
      alert(error.message || "예약 정보를 불러오는데 실패했습니다.");
      router.push("/bookings/my");
    } finally {
      setLoading(false);
    }
  };

  // 시작 시간 + 소요시간 = 종료 시간 계산
  const calculateEndTime = (start: string, durationMinutes: number) => {
    if (!start) return "";
    const [hours, minutes] = start.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
  };

  // 시작 시간 변경 시 종료 시간 자동 계산
  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartTime = e.target.value;
    setStartTime(newStartTime);
    if (booking) {
      setEndTime(calculateEndTime(newStartTime, booking.service.duration));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검증
    if (!bookingDate || !startTime || !endTime || !address) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // 날짜가 과거인지 확인
    const selectedDate = new Date(bookingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) {
      alert("과거 날짜는 예약할 수 없습니다.");
      return;
    }

    setSubmitting(true);

    try {
      await fetchAPI(`/api/bookings/${bookingId}`, {
        method: "PUT",
        body: JSON.stringify({
          bookingDate,
          startTime,
          endTime,
          address,
          detailAddress,
          specialRequest,
        }),
      });

      alert("예약이 수정되었습니다!");
      router.push(`/bookings/${bookingId}`);
    } catch (error: any) {
      console.error("Failed to update booking", error);
      alert(error.message || "예약 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
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
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900"
            >
              ← 뒤로
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">예약 수정</h1>
              <p className="text-sm text-gray-600 mt-1">
                예약 번호: #{booking.id}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 서비스 정보 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                서비스 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {booking.service.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {booking.service.description}
                  </p>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">가격</span>
                    <span className="font-semibold text-blue-600">
                      {formatPrice(booking.price)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">소요시간</span>
                    <span className="font-medium text-gray-900">
                      {formatDuration(booking.service.duration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 수정 폼 */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6">
              <div className="mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  예약 정보 수정
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  변경하실 정보를 입력해주세요
                </p>
              </div>

              <div className="space-y-6">
                {/* 예약 날짜 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    예약 날짜 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* 시작 시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      시작 시간 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={handleStartTimeChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      종료 시간 <span className="text-gray-400">(자동 계산)</span>
                    </label>
                    <input
                      type="time"
                      value={endTime}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  </div>
                </div>

                {/* 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    주소 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="예: 서울시 강남구 테헤란로 123"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* 상세 주소 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상세 주소
                  </label>
                  <input
                    type="text"
                    value={detailAddress}
                    onChange={(e) => setDetailAddress(e.target.value)}
                    placeholder="예: 101동 1234호"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* 특이사항 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    특이사항
                  </label>
                  <textarea
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    placeholder="예: 애완동물 있음, 주차 가능 등"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* 안내 메시지 */}
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex gap-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium mb-1">수정 가능 항목</p>
                      <ul className="list-disc list-inside space-y-1 text-yellow-700">
                        <li>예약 날짜 및 시간</li>
                        <li>작업 주소</li>
                        <li>특이사항</li>
                      </ul>
                      <p className="mt-2">
                        서비스 종류와 가격은 변경할 수 없습니다.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 제출 버튼 */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      submitting
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? "수정 중..." : "수정 완료"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
