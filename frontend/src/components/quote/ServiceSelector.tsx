"use client";

import { Service, ServiceCategory } from "@/types";

interface ServiceSelectorProps {
  services: Service[];
  selectedService: Service | null;
  onSelect: (service: Service) => void;
}

const categoryLabels: Record<ServiceCategory, string> = {
  HOME: "가정 청소",
  OFFICE: "사무실 청소",
  MOVE: "이사 청소",
  SPECIAL: "특수 청소",
};

const categoryIcons: Record<ServiceCategory, string> = {
  HOME: "🏠",
  OFFICE: "🏢",
  MOVE: "📦",
  SPECIAL: "✨",
};

export default function ServiceSelector({
  services,
  selectedService,
  onSelect,
}: ServiceSelectorProps) {
  // 카테고리별로 서비스 그룹화
  const groupedServices = services.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = [];
    }
    acc[service.category].push(service);
    return acc;
  }, {} as Record<ServiceCategory, Service[]>);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">어떤 서비스가 필요하신가요?</h3>
        <p className="text-gray-600">원하시는 청소 서비스를 선택해주세요</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(Object.keys(categoryLabels) as ServiceCategory[]).map((category) => {
          const categoryServices = groupedServices[category] || [];
          if (categoryServices.length === 0) return null;

          const service = categoryServices[0];
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                isSelected
                  ? "border-blue-600 bg-gradient-to-br from-blue-50 to-blue-100 shadow-lg scale-105"
                  : "border-gray-200 hover:border-blue-400 hover:shadow-md bg-white"
              }`}
            >
              <div className={`text-4xl mb-3 transition-transform duration-300 ${
                isSelected ? "scale-110" : "group-hover:scale-110"
              }`}>
                {categoryIcons[category]}
              </div>
              <div className="font-semibold text-gray-900 mb-2">{service.name}</div>
              <div className={`text-lg font-bold mb-1 ${
                isSelected ? "text-blue-700" : "text-blue-600"
              }`}>
                {category === "HOME" ? "15,000원/평~" : `${service.basePrice.toLocaleString()}원~`}
              </div>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
