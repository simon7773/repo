export interface User {
  // 타입을 한번더 정의를 해준다. 필요한 모양새 정의.
  id: number;
  email: string;
  username: string;
  avatar?: string;
  phone?: string;
  address?: string;
  role: "ADMIN" | "EMPLOYEE" | "CUSTOMER";
  createdAt: string;
}

export interface Post {
  id: number;
  content: string;
  image?: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
  user: User;
  comments: Comment[];
  likes: { userId: number }[];
  _count?: {
    likes: number;
    comments: number;
  };
}

export interface Comment {
  id: number;
  content: string;
  userId: number;
  postId: number;
  createdAt: string;
  user: User;
}

export interface Like {
  id: number;
  userId: number;
  postId: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ToggleLikeResponse {
  liked: boolean;
  count: number;
}

// === 청소 업체 타입 ===

export type ServiceCategory = "HOME" | "OFFICE" | "MOVE" | "SPECIAL";
export type BookingStatus = "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface Service {
  id: number;
  name: string;
  description?: string;
  price: number;
  basePrice: number;
  pricePerArea: number;
  minArea?: number;
  duration: number;
  category: ServiceCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: number;
  customerId: number;
  serviceId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  address: string;
  detailAddress?: string;
  area?: number;
  specialRequest?: string;
  price: number;
  servicePrice: number;
  optionsPrice: number;
  totalPrice: number;
  beforeImages: string[];
  afterImages: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;

  customer: User;
  service: Service;
  options?: BookingOption[];
}

// === 견적 관련 타입 ===

export type OptionCategory = "CLEANING" | "APPLIANCE" | "SPECIAL";
export type PriceType = "FIXED" | "PER_UNIT" | "PER_AREA";

export interface AdditionalOption {
  id: number;
  name: string;
  category: OptionCategory;
  priceType: PriceType;
  basePrice: number;
  unit?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingOption {
  id: number;
  bookingId: number;
  optionId: number;
  quantity: number;
  price: number;
  option?: AdditionalOption;
}

export interface BlockedDate {
  id: number;
  date: string;
  reason?: string;
  createdAt: string;
}

export interface SelectedOption {
  id: number;
  quantity: number;
}

export interface QuoteCalculation {
  service: {
    id: number;
    name: string;
    basePrice: number;
    pricePerArea: number;
  };
  area: number;
  servicePrice: number;
  options: {
    id: number;
    name: string;
    quantity: number;
    price: number;
  }[];
  optionsPrice: number;
  totalPrice: number;
}

export interface AvailableTimesResponse {
  date: string;
  bookedSlots: { startTime: string; endTime: string }[];
  availableSlots: string[];
}

// === 갤러리 관련 타입 ===

export type ImageType = "BEFORE" | "AFTER";

export interface GalleryImage {
  id: number;
  category: ServiceCategory;
  tab: string;
  imageType: ImageType;
  imageUrl: string;
  description?: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
