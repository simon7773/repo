"use client";

import { Service, AdditionalOption, SelectedOption } from "@/types";
import { APPLIANCE_OPTIONS, BASE_RATE_PER_PYEONG } from "@/constants/pricing";
import { formatCurrency } from "@/utils/formatPrice";

interface QuoteSummaryProps {
  selectedService: Service | null;
  area: number;
  selectedDate: Date | null;
  selectedTime: string | null;
  selectedOptions: SelectedOption[];
  selectedAppliances: string[]; // 가전 옵션
  options: AdditionalOption[];
  calculatedPrice: {
    servicePrice: number;
    optionsPrice: number;
    totalPrice: number;
  };
  customerInfo: {
    name: string;
    phone: string;
    address: string;
    detailAddress: string;
    specialRequest: string;
  };
  onCustomerInfoChange: (info: any) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}

export default function QuoteSummary({
  selectedService,
  area,
  selectedDate,
  selectedTime,
  selectedOptions,
  selectedAppliances,
  options,
  calculatedPrice,
  customerInfo,
  onCustomerInfoChange,
  onSubmit,
  isLoading,
  error,
}: QuoteSummaryProps) {
  const formatDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  const getSelectedOptionDetails = () => {
    return selectedOptions.map((selected) => {
      const option = options.find((o) => o.id === selected.id);
      if (!option) return null;

      let price = 0;
      switch (option.priceType) {
        case "FIXED":
          price = option.basePrice;
          break;
        case "PER_UNIT":
          price = option.basePrice * selected.quantity;
          break;
        case "PER_AREA":
          price = option.basePrice * area;
          break;
      }

      return {
        ...option,
        quantity: selected.quantity,
        calculatedPrice: price,
      };
    }).filter(Boolean);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    onCustomerInfoChange({ ...customerInfo, [name]: value });
  };

  const isFormValid = () => {
    return (
      selectedService &&
      selectedDate &&
      selectedTime &&
      customerInfo.name &&
      customerInfo.phone &&
      customerInfo.address
    );
  };

  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 sticky top-8 border border-gray-100">
      <div className="flex items-center gap-2 mb-8">
        <div className="text-3xl">📋</div>
        <h3 className="text-2xl font-bold text-gray-900">견적 요약</h3>
      </div>

      {/* 선택 정보 */}
      <div className="space-y-5 mb-8">
        {selectedService ? (
          <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="text-sm text-blue-600 font-medium mb-1">선택한 서비스</div>
                <div className="text-lg font-bold text-gray-900">{selectedService.name}</div>
                <div className="text-sm text-gray-600 mt-1">{area}평</div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-700">{formatCurrency(calculatedPrice.servicePrice)}</div>
                <div className="text-xs text-gray-600 mt-1">
                  {selectedService.category === "HOME"
                    ? `${formatCurrency(BASE_RATE_PER_PYEONG)}/평 × ${area}평`
                    : `기본 ${formatCurrency(selectedService.basePrice)} + ${formatCurrency(selectedService.pricePerArea)}/평 × ${area}평`
                  }
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-2xl text-center">
            <div className="text-gray-300 text-4xl mb-3">📦</div>
            <p className="text-gray-500">서비스를 선택해주세요</p>
          </div>
        )}

        {selectedDate && selectedTime && (
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">예약 일시</span>
            </div>
            <div className="font-semibold text-gray-900">{formatDate(selectedDate)} {selectedTime}</div>
          </div>
        )}

        {/* 가전 청소 옵션 (가정 청소만) */}
        {selectedService?.category === "HOME" && selectedAppliances.length > 0 && (
          <div className="border-t-2 border-dashed border-gray-200 pt-5">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>✨</span>
              <span>가전 청소</span>
            </div>
            <div className="space-y-2">
              {selectedAppliances.map((applianceId) => {
                const appliance = APPLIANCE_OPTIONS.find((a) => a.id === applianceId);
                return appliance ? (
                  <div key={appliance.id} className="flex justify-between items-center text-sm py-1.5 px-3 bg-blue-50 rounded-lg">
                    <span className="text-gray-700">{appliance.name}</span>
                    <span className="font-semibold text-blue-700">{formatCurrency(appliance.price)}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* 추가 옵션 */}
        {selectedOptions.length > 0 && (
          <div className="border-t-2 border-dashed border-gray-200 pt-5">
            <div className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <span>🎯</span>
              <span>추가 옵션</span>
            </div>
            <div className="space-y-2">
              {getSelectedOptionDetails().map((opt: any) => (
                <div key={opt.id} className="flex justify-between items-center text-sm py-1.5 px-3 bg-indigo-50 rounded-lg">
                  <span className="text-gray-700">
                    {opt.name}
                    {opt.priceType === "PER_UNIT" && ` × ${opt.quantity}`}
                  </span>
                  <span className="font-semibold text-indigo-700">{formatCurrency(opt.calculatedPrice)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 총 금액 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 mb-8 shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <div className="text-blue-100 text-sm mb-1">총 예상 금액</div>
            <div className="text-white text-3xl font-bold">
              {formatCurrency(calculatedPrice.totalPrice)}
            </div>
          </div>
          <div className="text-white text-4xl">💰</div>
        </div>
      </div>

      {/* 연락처 정보 */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h4 className="text-lg font-bold text-gray-900">연락처 정보</h4>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text"
            name="name"
            placeholder="이름 *"
            value={customerInfo.name}
            onChange={handleInputChange}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
          <input
            type="tel"
            name="phone"
            placeholder="연락처 *"
            value={customerInfo.phone}
            onChange={handleInputChange}
            className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
        <input
          type="text"
          name="address"
          placeholder="주소 *"
          value={customerInfo.address}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <input
          type="text"
          name="detailAddress"
          placeholder="상세주소"
          value={customerInfo.detailAddress}
          onChange={handleInputChange}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
        <textarea
          name="specialRequest"
          placeholder="요청사항"
          value={customerInfo.specialRequest}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
        />
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* 제출 버튼 */}
      <button
        onClick={onSubmit}
        disabled={!isFormValid() || isLoading}
        className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>요청 중...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span>견적 요청하기</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        )}
      </button>

      <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800 text-center flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>최종 금액은 현장 확인 후 변동될 수 있습니다</span>
        </p>
      </div>
    </div>
  );
}
