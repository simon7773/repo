"use client";

import { useState, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ko } from "date-fns/locale";

interface Reservation {
  [key: string]: string | null;
}

interface ModalData {
  date: string;
  period: "AM" | "PM";
  content: string;
}

export default function ReservationPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [reservations, setReservations] = useState<Reservation>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // LocalStorage에서 데이터 불러오기 (최초 1회만)
  useEffect(() => {
    const saved = localStorage.getItem("reservations");
    if (saved) {
      try {
        setReservations(JSON.parse(saved));
      } catch (error) {
        console.error("예약 데이터 로드 실패:", error);
      }
    }
    setIsLoaded(true);
  }, []);

  // LocalStorage에 데이터 저장 (로드 완료 후에만)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("reservations", JSON.stringify(reservations));
    }
  }, [reservations, isLoaded]);

  // 이전/다음 달로 이동
  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // 달력 날짜 계산
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart); // 0 (일요일) ~ 6 (토요일)

  // 모달 열기
  const handleSlotClick = (date: string, period: "AM" | "PM") => {
    const key = `${date}-${period}`;
    const existingContent = reservations[key] || "";
    setModalData({ date, period, content: existingContent });
    setInputValue(existingContent);
    setIsModalOpen(true);
  };

  // 일정 저장
  const handleSave = () => {
    if (!modalData) return;
    const key = `${modalData.date}-${modalData.period}`;
    setReservations({
      ...reservations,
      [key]: inputValue.trim() || null,
    });
    setIsModalOpen(false);
    setInputValue("");
    setModalData(null);
  };

  // 일정 삭제
  const handleDelete = () => {
    if (!modalData) return;
    const key = `${modalData.date}-${modalData.period}`;
    setReservations({
      ...reservations,
      [key]: null,
    });
    setIsModalOpen(false);
    setInputValue("");
    setModalData(null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setInputValue("");
    setModalData(null);
  };

  // 빈 셀 추가 (첫 주 시작 전 빈 칸)
  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => i);

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-80">
      <div className="h-[calc(100vh-5rem)] max-w-7xl mx-auto p-4 flex flex-col">
        {/* 헤더 */}

        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <h1 className="text-3xl font-bold text-gray-800">
              {format(currentDate, "yyyy년 MM월", { locale: ko })}
            </h1>

            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 달력 그리드 */}
        <div className="bg-white rounded-lg shadow-md flex-1 overflow-hidden flex flex-col">
          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {weekDays.map((day, index) => (
              <div
                key={day}
                className={`p-3 text-center font-semibold ${
                  index === 0
                    ? "text-red-600"
                    : index === 6
                    ? "text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 flex-1 overflow-auto">
            {/* 빈 셀 */}
            {emptyCells.map((i) => (
              <div
                key={`empty-${i}`}
                className="border border-gray-200 bg-gray-50"
              ></div>
            ))}

            {/* 날짜 셀 */}
            {daysInMonth.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayOfWeek = getDay(day);
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
              const amKey = `${dateStr}-AM`;
              const pmKey = `${dateStr}-PM`;
              const hasAM = reservations[amKey];
              const hasPM = reservations[pmKey];

              return (
                <div
                  key={dateStr}
                  className="border border-gray-200 p-2 flex flex-col hover:bg-gray-50 transition-colors"
                >
                  {/* 날짜 */}
                  <div
                    className={`text-sm font-semibold mb-2 ${
                      isWeekend
                        ? dayOfWeek === 0
                          ? "text-red-600"
                          : "text-blue-600"
                        : "text-gray-700"
                    }`}
                  >
                    {format(day, "d")}
                  </div>

                  {/* 오전/오후 버튼 */}
                  <div className="flex flex-col gap-1 flex-1">
                    {/* 오전 */}
                    <button
                      onClick={() => handleSlotClick(dateStr, "AM")}
                      className={`px-2 py-1 rounded text-xs font-medium text-white transition-all hover:opacity-90 ${
                        hasAM ? "bg-red-500" : "bg-blue-400"
                      }`}
                    >
                      {hasAM ? "예약 마감" : "예약 가능"}
                      <div className="text-[10px] opacity-80">오전</div>
                    </button>

                    {/* 오후 */}
                    <button
                      onClick={() => handleSlotClick(dateStr, "PM")}
                      className={`px-2 py-1 rounded text-xs font-medium text-white transition-all hover:opacity-90 ${
                        hasPM ? "bg-red-500" : "bg-blue-400"
                      }`}
                    >
                      {hasPM ? "예약 마감" : "예약 가능"}
                      <div className="text-[10px] opacity-80">오후</div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 모달 */}
      {isModalOpen && modalData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalData.date} ({modalData.period === "AM" ? "오전" : "오후"})
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* 내용 입력 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                예약 내용
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="예약 내용을 입력하세요 (예: 김철수님 상담 예약)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                저장
              </button>
              {modalData.content && (
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              )}
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
