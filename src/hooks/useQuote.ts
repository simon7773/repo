"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Service,
  AdditionalOption,
  BlockedDate,
  SelectedOption,
  AvailableTimesResponse,
} from "@/types";
import { BASE_RATE_PER_PYEONG, APPLIANCE_OPTION_PRICE } from "@/constants/pricing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  detailAddress: string;
  specialRequest: string;
}

interface CalculatedPrice {
  servicePrice: number;
  optionsPrice: number;
  totalPrice: number;
}

interface UseQuoteReturn {
  // 데이터
  services: Service[];
  options: AdditionalOption[];
  blockedDates: BlockedDate[];
  availableTimes: AvailableTimesResponse | null;

  // 선택 상태
  selectedService: Service | null;
  setSelectedService: (service: Service | null) => void;
  area: number;
  setArea: (area: number) => void;
  selectedDate: Date | null;
  setSelectedDate: (date: Date | null) => void;
  selectedTime: string | null;
  setSelectedTime: (time: string | null) => void;
  selectedOptions: SelectedOption[];
  setSelectedOptions: (options: SelectedOption[]) => void;
  selectedAppliances: string[]; // 가전 옵션 (washer, refrigerator, aircon)
  setSelectedAppliances: (appliances: string[]) => void;
  customerInfo: CustomerInfo;
  setCustomerInfo: (info: CustomerInfo) => void;

  // 계산된 가격
  calculatedPrice: CalculatedPrice;

  // 로딩/에러 상태
  isLoading: boolean;
  error: string | null;

  // 액션
  fetchAvailableTimes: (date: Date) => Promise<void>;
  toggleOption: (optionId: number) => void;
  updateOptionQuantity: (optionId: number, quantity: number) => void;
  toggleAppliance: (applianceId: string) => void; // 가전 옵션 토글
  submitQuote: () => Promise<boolean>;
  resetQuote: () => void;
}

export function useQuote(): UseQuoteReturn {
  // 데이터 상태
  const [services, setServices] = useState<Service[]>([]);
  const [options, setOptions] = useState<AdditionalOption[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [availableTimes, setAvailableTimes] = useState<AvailableTimesResponse | null>(null);

  // 선택 상태
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [area, setArea] = useState<number>(20);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<SelectedOption[]>([]);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]); // 가전 옵션
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    phone: "",
    address: "",
    detailAddress: "",
    specialRequest: "",
  });

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 초기 데이터 로드
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        const [servicesRes, optionsRes, blockedDatesRes] = await Promise.all([
          fetch(`${API_URL}/api/quote/services`),
          fetch(`${API_URL}/api/quote/options`),
          fetch(`${API_URL}/api/quote/blocked-dates`),
        ]);

        if (servicesRes.ok) {
          const servicesData = await servicesRes.json();
          setServices(servicesData);
        }

        if (optionsRes.ok) {
          const optionsData = await optionsRes.json();
          setOptions(optionsData);
        }

        if (blockedDatesRes.ok) {
          const blockedDatesData = await blockedDatesRes.json();
          setBlockedDates(blockedDatesData);
        }
      } catch (err) {
        setError("데이터를 불러오는데 실패했습니다.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // 가격 계산
  const calculatedPrice: CalculatedPrice = (() => {
    if (!selectedService) {
      return { servicePrice: 0, optionsPrice: 0, totalPrice: 0 };
    }

    // 가정 청소인 경우 평당 15,000원 고정
    const isHomeCleaning = selectedService.category === "HOME";
    const servicePrice = isHomeCleaning
      ? area * BASE_RATE_PER_PYEONG
      : selectedService.basePrice + selectedService.pricePerArea * area;

    let optionsPrice = 0;

    // 일반 추가 옵션 가격
    for (const selected of selectedOptions) {
      const option = options.find((o) => o.id === selected.id);
      if (option) {
        switch (option.priceType) {
          case "FIXED":
            optionsPrice += option.basePrice;
            break;
          case "PER_UNIT":
            optionsPrice += option.basePrice * selected.quantity;
            break;
          case "PER_AREA":
            optionsPrice += option.basePrice * area;
            break;
        }
      }
    }

    // 가전 옵션 가격 (가정 청소일 때만, 각 20,000원)
    if (isHomeCleaning) {
      optionsPrice += selectedAppliances.length * APPLIANCE_OPTION_PRICE;
    }

    return {
      servicePrice,
      optionsPrice,
      totalPrice: servicePrice + optionsPrice,
    };
  })();

  // 특정 날짜의 가능한 시간 조회
  const fetchAvailableTimes = useCallback(async (date: Date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const res = await fetch(`${API_URL}/api/quote/available-times?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setAvailableTimes(data);
      }
    } catch (err) {
      console.error("가능한 시간 조회 실패:", err);
    }
  }, []);

  // 날짜 선택 시 가능한 시간 조회
  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes(selectedDate);
      setSelectedTime(null);
    }
  }, [selectedDate, fetchAvailableTimes]);

  // 옵션 토글
  const toggleOption = useCallback((optionId: number) => {
    setSelectedOptions((prev) => {
      const exists = prev.find((o) => o.id === optionId);
      if (exists) {
        return prev.filter((o) => o.id !== optionId);
      }
      return [...prev, { id: optionId, quantity: 1 }];
    });
  }, []);

  // 옵션 수량 변경
  const updateOptionQuantity = useCallback((optionId: number, quantity: number) => {
    setSelectedOptions((prev) =>
      prev.map((o) => (o.id === optionId ? { ...o, quantity: Math.max(1, quantity) } : o))
    );
  }, []);

  // 가전 옵션 토글
  const toggleAppliance = useCallback((applianceId: string) => {
    setSelectedAppliances((prev) => {
      if (prev.includes(applianceId)) {
        return prev.filter((id) => id !== applianceId);
      }
      return [...prev, applianceId];
    });
  }, []);

  // 견적 제출
  const submitQuote = useCallback(async (): Promise<boolean> => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setError("필수 항목을 모두 선택해주세요.");
      return false;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      setError("연락처 정보를 모두 입력해주세요.");
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/quote/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          serviceId: selectedService.id,
          area,
          bookingDate: selectedDate.toISOString(),
          startTime: selectedTime,
          address: customerInfo.address,
          detailAddress: customerInfo.detailAddress,
          specialRequest: customerInfo.specialRequest,
          optionIds: selectedOptions,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "견적 요청에 실패했습니다.");
      }

      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [selectedService, selectedDate, selectedTime, area, customerInfo, selectedOptions]);

  // 초기화
  const resetQuote = useCallback(() => {
    setSelectedService(null);
    setArea(20);
    setSelectedDate(null);
    setSelectedTime(null);
    setSelectedOptions([]);
    setSelectedAppliances([]); // 가전 옵션 초기화
    setCustomerInfo({
      name: "",
      phone: "",
      address: "",
      detailAddress: "",
      specialRequest: "",
    });
    setAvailableTimes(null);
    setError(null);
  }, []);

  return {
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
    setSelectedOptions,
    selectedAppliances,
    setSelectedAppliances,
    customerInfo,
    setCustomerInfo,
    calculatedPrice,
    isLoading,
    error,
    fetchAvailableTimes,
    toggleOption,
    updateOptionQuantity,
    toggleAppliance,
    submitQuote,
    resetQuote,
  };
}
