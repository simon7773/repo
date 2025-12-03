"use client";

import { AdditionalOption, SelectedOption, OptionCategory } from "@/types";

interface OptionSelectorProps {
  options: AdditionalOption[];
  selectedOptions: SelectedOption[];
  area: number;
  onToggle: (optionId: number) => void;
  onQuantityChange: (optionId: number, quantity: number) => void;
}

const categoryLabels: Record<OptionCategory, string> = {
  CLEANING: "청소 관련",
  APPLIANCE: "가전 청소",
  SPECIAL: "특수 작업",
};

const categoryIcons: Record<OptionCategory, string> = {
  CLEANING: "🧹",
  APPLIANCE: "🔌",
  SPECIAL: "✨",
};

export default function OptionSelector({
  options,
  selectedOptions,
  area,
  onToggle,
  onQuantityChange,
}: OptionSelectorProps) {
  // 카테고리별로 옵션 그룹화
  const groupedOptions = options.reduce((acc, option) => {
    if (!acc[option.category]) {
      acc[option.category] = [];
    }
    acc[option.category].push(option);
    return acc;
  }, {} as Record<OptionCategory, AdditionalOption[]>);

  const isSelected = (optionId: number) => {
    return selectedOptions.some((o) => o.id === optionId);
  };

  const getQuantity = (optionId: number) => {
    return selectedOptions.find((o) => o.id === optionId)?.quantity || 1;
  };

  const calculateOptionPrice = (option: AdditionalOption, quantity: number) => {
    switch (option.priceType) {
      case "FIXED":
        return option.basePrice;
      case "PER_UNIT":
        return option.basePrice * quantity;
      case "PER_AREA":
        return option.basePrice * area;
      default:
        return 0;
    }
  };

  const formatPriceLabel = (option: AdditionalOption) => {
    switch (option.priceType) {
      case "FIXED":
        return `${option.basePrice.toLocaleString()}원`;
      case "PER_UNIT":
        return `${option.basePrice.toLocaleString()}원/${option.unit || "개"}`;
      case "PER_AREA":
        return `${option.basePrice.toLocaleString()}원/평`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">추가 옵션 선택</h3>
        <p className="text-sm text-gray-500">필요한 추가 서비스를 선택해주세요</p>
      </div>

      {(Object.keys(categoryLabels) as OptionCategory[]).map((category) => {
        const categoryOptions = groupedOptions[category];
        if (!categoryOptions || categoryOptions.length === 0) return null;

        return (
          <div key={category} className="space-y-3">
            <h4 className="text-base font-semibold text-gray-800 flex items-center gap-2 pb-2 border-b border-gray-200">
              <span className="text-xl">{categoryIcons[category]}</span>
              <span>{categoryLabels[category]}</span>
            </h4>
            <div className="space-y-3">
              {categoryOptions.map((option) => {
                const selected = isSelected(option.id);
                const quantity = getQuantity(option.id);
                const price = calculateOptionPrice(option, quantity);

                return (
                  <div
                    key={option.id}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      selected
                        ? "border-blue-600 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-4 cursor-pointer flex-1">
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          selected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300"
                        }`}>
                          {selected && (
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div onClick={() => onToggle(option.id)}>
                          <div className="font-semibold text-gray-900">
                            {option.name}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {formatPriceLabel(option)}
                          </div>
                        </div>
                      </label>

                      <div className="flex items-center gap-4">
                        {selected && option.priceType === "PER_UNIT" && (
                          <div className="flex items-center gap-2 bg-white rounded-lg px-2 py-1 border border-gray-200">
                            <button
                              onClick={() =>
                                onQuantityChange(option.id, quantity - 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-bold text-gray-900">
                              {quantity}
                            </span>
                            <button
                              onClick={() =>
                                onQuantityChange(option.id, quantity + 1)
                              }
                              className="w-7 h-7 flex items-center justify-center rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold"
                            >
                              +
                            </button>
                          </div>
                        )}

                        {selected && (
                          <div className="text-right min-w-[100px]">
                            <div className="text-lg font-bold text-blue-700">
                              {price.toLocaleString()}원
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {options.length === 0 && (
        <div className="p-8 bg-gray-50 rounded-xl text-center">
          <div className="text-gray-400 text-3xl mb-2">📦</div>
          <p className="text-gray-500">등록된 추가 옵션이 없습니다</p>
        </div>
      )}
    </div>
  );
}
