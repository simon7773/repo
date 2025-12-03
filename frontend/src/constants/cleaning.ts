export type TabType = "room" | "kitchen" | "entrance" | "window";

export interface TabContent {
  id: TabType;
  label: string;
  description: string;
  features: string[];
}

export const CLEANING_TABS: TabContent[] = [
  {
    id: "room",
    label: "방/거실",
    description: "방과 거실을 깨끗하고 쾌적하게 청소합니다",
    features: [
      "가구 먼지 제거",
      "바닥 청소 및 왁스",
      "침구 정리",
      "에어컨 필터 청소",
      "조명 청소",
    ],
  },
  {
    id: "kitchen",
    label: "주방/욕실",
    description: "주방과 욕실의 위생을 철저히 관리합니다",
    features: [
      "싱크대 및 개수대 청소",
      "가스레인지 기름때 제거",
      "욕실 타일 및 곰팡이 제거",
      "변기 및 세면대 소독",
      "배수구 청소",
    ],
  },
  {
    id: "entrance",
    label: "현관/베란다",
    description: "현관과 베란다를 깔끔하게 정돈합니다",
    features: [
      "현관 바닥 청소",
      "신발장 정리",
      "베란다 바닥 청소",
      "빨래 건조대 청소",
      "먼지 및 거미줄 제거",
    ],
  },
  {
    id: "window",
    label: "창/바닥",
    description: "창문과 바닥을 투명하고 깨끗하게 만듭니다",
    features: [
      "창문 유리 청소",
      "창틀 먼지 제거",
      "블라인드 청소",
      "전체 바닥 물걸레",
      "왁스 코팅",
    ],
  },
];
