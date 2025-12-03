"use client";

import { useState, useMemo } from "react";
import { BlockedDate } from "@/types";

interface QuoteCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  blockedDates: BlockedDate[];
}

export default function QuoteCalendar({
  selectedDate,
  onSelect,
  blockedDates,
}: QuoteCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const blockedDateSet = useMemo(() => {
    return new Set(
      blockedDates.map((bd) => new Date(bd.date).toISOString().split("T")[0])
    );
  }, [blockedDates]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const prevMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
    );
  };

  const isDateBlocked = (date: Date) => {
    return blockedDateSet.has(date.toISOString().split("T")[0]);
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (!isDatePast(date) && !isDateBlocked(date)) {
      onSelect(date);
    }
  };

  const weekDays = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">날짜 선택</h3>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ←
          </button>
          <h4 className="text-lg font-semibold">
            {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
          </h4>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            →
          </button>
        </div>

        {/* 요일 */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-500"
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-7 gap-1">
          {/* 빈 칸 */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-square" />
          ))}

          {/* 날짜 */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
            const isPast = isDatePast(date);
            const isBlocked = isDateBlocked(date);
            const isSelected = isDateSelected(date);
            const dayOfWeek = date.getDay();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={isPast || isBlocked}
                className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : isPast
                    ? "text-gray-300 cursor-not-allowed"
                    : isBlocked
                    ? "bg-red-100 text-red-400 cursor-not-allowed"
                    : dayOfWeek === 0
                    ? "text-red-500 hover:bg-red-50"
                    : dayOfWeek === 6
                    ? "text-blue-500 hover:bg-blue-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>

        {/* 범례 */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-600 rounded" />
            <span>선택됨</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-100 rounded" />
            <span>예약불가</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-200 rounded" />
            <span>지난날짜</span>
          </div>
        </div>
      </div>
    </div>
  );
}
