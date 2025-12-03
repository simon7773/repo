"use client";

import { AvailableTimesResponse } from "@/types";

interface TimeSlotPickerProps {
  selectedDate: Date | null;
  selectedTime: string | null;
  availableTimes: AvailableTimesResponse | null;
  onSelect: (time: string) => void;
}

const allTimeSlots = ["08:00", "14:00"];

export default function TimeSlotPicker({
  selectedDate,
  selectedTime,
  availableTimes,
  onSelect,
}: TimeSlotPickerProps) {
  if (!selectedDate) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">시간 선택</h3>
        <div className="p-6 bg-gray-50 rounded-xl text-center text-gray-500">
          먼저 날짜를 선택해주세요
        </div>
      </div>
    );
  }

  const availableSlots = availableTimes?.availableSlots || allTimeSlots;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">시간 선택</h3>
      <div className="grid grid-cols-5 gap-2">
        {allTimeSlots.map((time) => {
          const isAvailable = availableSlots.includes(time);
          const isSelected = selectedTime === time;

          return (
            <button
              key={time}
              onClick={() => isAvailable && onSelect(time)}
              disabled={!isAvailable}
              className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                isSelected
                  ? "bg-blue-600 text-white"
                  : isAvailable
                  ? "bg-white border border-gray-200 text-gray-700 hover:border-blue-300"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed line-through"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
      {availableTimes && availableTimes.bookedSlots.length > 0 && (
        <p className="text-xs text-gray-500">
          ⚠️ 취소선이 표시된 시간은 이미 예약되었습니다.
        </p>
      )}
    </div>
  );
}
