"use client";

import { APPLIANCE_OPTIONS } from "@/constants/pricing";
import { formatCurrency } from "@/utils/formatPrice";

interface ApplianceSelectorProps {
  selectedAppliances: string[];
  onToggle: (applianceId: string) => void;
}

export default function ApplianceSelector({
  selectedAppliances,
  onToggle,
}: ApplianceSelectorProps) {
  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
        <div className="text-2xl">✨</div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">가전 청소 추가 옵션</h3>
          <p className="text-sm text-gray-600">
            청소가 필요한 가전제품을 선택해주세요. 각 항목당 {formatCurrency(20000)}이 추가됩니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {APPLIANCE_OPTIONS.map((appliance) => {
          const isSelected = selectedAppliances.includes(appliance.id);

          return (
            <button
              key={appliance.id}
              onClick={() => onToggle(appliance.id)}
              className={`group relative p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-blue-600 border-blue-600"
                    : "border-gray-300 group-hover:border-blue-400"
                }`}>
                  {isSelected && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="font-semibold text-gray-900">{appliance.name}</div>
              </div>
              <div className={`text-lg font-bold ml-9 ${
                isSelected ? "text-blue-700" : "text-gray-600"
              }`}>
                {formatCurrency(appliance.price)}
              </div>
            </button>
          );
        })}
      </div>

      {selectedAppliances.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl border border-blue-300">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-900">
              선택한 가전: {selectedAppliances.length}개
            </span>
            <span className="text-xl font-bold text-blue-700">
              + {formatCurrency(selectedAppliances.length * 20000)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
