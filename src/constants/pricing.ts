// 가격 상수
export const BASE_RATE_PER_PYEONG = 15000; // 평당 기본 가격 15,000원
export const APPLIANCE_OPTION_PRICE = 20000; // 가전 옵션당 20,000원

// 가전 옵션 타입
export interface ApplianceOption {
  id: string;
  name: string;
  price: number;
}

// 가전 옵션 목록
export const APPLIANCE_OPTIONS: ApplianceOption[] = [
  { id: "washer", name: "세탁기", price: APPLIANCE_OPTION_PRICE },
  { id: "refrigerator", name: "냉장고", price: APPLIANCE_OPTION_PRICE },
  { id: "aircon", name: "에어컨", price: APPLIANCE_OPTION_PRICE },
];
