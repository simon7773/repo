"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuote } from "@/hooks/useQuote";
import {
  ServiceSelector,
  AreaInput,
  QuoteCalendar,
  TimeSlotPicker,
  OptionSelector,
  ApplianceSelector,
  QuoteSummary,
} from "@/components/quote";

export default function QuotePage() {
  const router = useRouter();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    services,
    options,
    blockedDates,
    availableTimes,
    selectedService,
    setSelectedService,
    area,
    setArea,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    selectedOptions,
    selectedAppliances,
    customerInfo,
    setCustomerInfo,
    calculatedPrice,
    isLoading,
    error,
    toggleOption,
    updateOptionQuantity,
    toggleAppliance,
    submitQuote,
  } = useQuote();

  const handleSubmit = async () => {
    const success = await submitQuote();
    if (success) {
      setIsSubmitted(true);
    }
  };

  // 완료 화면
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            견적 요청이 완료되었습니다!
          </h2>
          <p className="text-gray-600 mb-2">
            예상 금액:{" "}
            <span className="font-bold text-blue-600">
              {calculatedPrice.totalPrice.toLocaleString()}원
            </span>
          </p>
          <p className="text-gray-600 mb-6">빠른 시일 내에 연락드리겠습니다.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 로딩 화면
  if (isLoading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* 페이지 헤더 */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="text-5xl mb-4">✨</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            무료 견적 받기
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            서비스와 옵션을 선택하시면 실시간으로 예상 금액을 확인할 수 있습니다
          </p>
        </div>
      </div>

      {/* 메인 콘텐츠 - 2단 레이아웃 */}
      <div className="max-w-7xl mx-auto px-4 py-12 pb-80">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 왼쪽: 선택 영역 - 통합 플로우 */}
          <div className="lg:col-span-2 space-y-10">
            {/* 서비스 선택 */}
            <section>
              <ServiceSelector
                services={services}
                selectedService={selectedService}
                onSelect={setSelectedService}
              />
            </section>

            {/* 면적 입력 */}
            {selectedService && (
              <section className="animate-fadeIn">
                <AreaInput area={area} onChange={setArea} />
              </section>
            )}

            {/* 가전 청소 옵션 (가정 청소만) - 서비스 바로 아래 위치 */}
            {selectedService?.category === "HOME" && (
              <section className="animate-fadeIn">
                <ApplianceSelector
                  selectedAppliances={selectedAppliances}
                  onToggle={toggleAppliance}
                />
              </section>
            )}

            {/* 날짜 & 시간 선택 */}
            {selectedService && (
              <section className="animate-fadeIn">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    방문 일시를 선택해주세요
                  </h3>
                  <p className="text-gray-600">
                    편하신 날짜와 시간을 골라주세요
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <QuoteCalendar
                    selectedDate={selectedDate}
                    onSelect={setSelectedDate}
                    blockedDates={blockedDates}
                  />
                  <TimeSlotPicker
                    selectedDate={selectedDate}
                    selectedTime={selectedTime}
                    availableTimes={availableTimes}
                    onSelect={setSelectedTime}
                  />
                </div>
              </section>
            )}

            {/* 추가 옵션 */}
            {selectedService && options.length > 0 && (
              <section className="animate-fadeIn">
                <OptionSelector
                  options={options}
                  selectedOptions={selectedOptions}
                  area={area}
                  onToggle={toggleOption}
                  onQuantityChange={updateOptionQuantity}
                />
              </section>
            )}
          </div>

          {/* 오른쪽: 견적 요약 - Sticky */}
          <div className="lg:col-span-1">
            <QuoteSummary
              selectedService={selectedService}
              area={area}
              selectedDate={selectedDate}
              selectedTime={selectedTime}
              selectedOptions={selectedOptions}
              selectedAppliances={selectedAppliances}
              options={options}
              calculatedPrice={calculatedPrice}
              customerInfo={customerInfo}
              onCustomerInfoChange={setCustomerInfo}
              onSubmit={handleSubmit}
              isLoading={isLoading}
              error={error}
            />
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="mt-12 p-6 bg-white rounded-2xl shadow-lg text-center border border-gray-100">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <span className="text-gray-700">전화 상담:</span>
              <span className="font-bold text-blue-600 text-lg">
                010 5100 2900
              </span>
            </div>
            <div className="text-gray-400">|</div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-gray-600">평일 08:00 ~ 18:00</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
