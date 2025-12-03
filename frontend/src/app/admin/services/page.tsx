"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchAPI } from "@/lib/api";
import { Service, ServiceCategory } from "@/types";

const CATEGORY_LABELS: Record<ServiceCategory, string> = {
  HOME: "가정 청소",
  OFFICE: "사무실 청소",
  MOVE: "이사 청소",
  SPECIAL: "특수 청소",
};

const CATEGORY_COLORS: Record<ServiceCategory, string> = {
  HOME: "bg-blue-100 text-blue-800",
  OFFICE: "bg-green-100 text-green-800",
  MOVE: "bg-purple-100 text-purple-800",
  SPECIAL: "bg-orange-100 text-orange-800",
};

export default function AdminServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // 폼 데이터
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [duration, setDuration] = useState("");
  const [category, setCategory] = useState<ServiceCategory>("HOME");
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.role !== "ADMIN") {
      alert("관리자만 접근할 수 있습니다.");
      router.push("/feed");
      return;
    }
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const data = await fetchAPI("/api/services");
      setServices(data);
    } catch (error) {
      console.error("Failed to fetch services", error);
      alert("서비스 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description || "");
      setPrice(service.price.toString());
      setDuration(service.duration.toString());
      setCategory(service.category);
      setIsActive(service.isActive);
    } else {
      setEditingService(null);
      setName("");
      setDescription("");
      setPrice("");
      setDuration("");
      setCategory("HOME");
      setIsActive(true);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingService(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !price || !duration) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    setSubmitting(true);

    try {
      const body = {
        name,
        description,
        price: parseInt(price),
        duration: parseInt(duration),
        category,
        isActive,
      };

      if (editingService) {
        await fetchAPI(`/api/services/${editingService.id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        alert("서비스가 수정되었습니다.");
      } else {
        await fetchAPI("/api/services", {
          method: "POST",
          body: JSON.stringify(body),
        });
        alert("서비스가 추가되었습니다.");
      }

      handleCloseModal();
      fetchServices();
    } catch (error: any) {
      console.error("Failed to save service", error);
      alert(error.message || "서비스 저장에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteService = async (serviceId: number) => {
    if (!confirm("서비스를 삭제하시겠습니까?\n연결된 예약이 있는 경우 삭제할 수 없습니다.")) {
      return;
    }

    try {
      await fetchAPI(`/api/services/${serviceId}`, {
        method: "DELETE",
      });
      alert("서비스가 삭제되었습니다.");
      fetchServices();
    } catch (error: any) {
      console.error("Failed to delete service", error);
      alert(error.message || "서비스 삭제에 실패했습니다.");
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      await fetchAPI(`/api/services/${service.id}`, {
        method: "PUT",
        body: JSON.stringify({
          ...service,
          isActive: !service.isActive,
        }),
      });
      fetchServices();
    } catch (error: any) {
      console.error("Failed to toggle service status", error);
      alert(error.message || "서비스 상태 변경에 실패했습니다.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원";
  };

  const formatDuration = (duration: number) => {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">서비스 관리</h1>
              <p className="mt-1 text-sm text-gray-600">
                총 {services.length}개의 서비스
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                새 서비스 추가
              </button>
              <button
                onClick={() => router.push("/admin")}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                대시보드로 이동
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 서비스 목록 */}
        {services.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-gray-400 text-5xl mb-4">🧹</div>
            <p className="text-gray-600 mb-4">등록된 서비스가 없습니다.</p>
            <button
              onClick={() => handleOpenModal()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              첫 서비스 추가하기
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.id}
                className={`bg-white rounded-lg shadow overflow-hidden ${
                  !service.isActive ? "opacity-60" : ""
                }`}
              >
                {/* 카테고리 뱃지 */}
                <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      CATEGORY_COLORS[service.category]
                    }`}
                  >
                    {CATEGORY_LABELS[service.category]}
                  </span>
                  <div className="flex items-center gap-2">
                    {service.isActive ? (
                      <span className="text-green-600 text-xs font-semibold">활성</span>
                    ) : (
                      <span className="text-red-600 text-xs font-semibold">비활성</span>
                    )}
                  </div>
                </div>

                {/* 서비스 정보 */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3 min-h-[4.5rem]">
                    {service.description || "설명이 없습니다."}
                  </p>

                  {/* 가격 및 소요시간 */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">가격</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatPrice(service.price)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 text-sm">소요시간</span>
                      <span className="text-gray-900 font-medium">
                        {formatDuration(service.duration)}
                      </span>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenModal(service)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors ${
                          service.isActive
                            ? "bg-yellow-600 text-white hover:bg-yellow-700"
                            : "bg-green-600 text-white hover:bg-green-700"
                        }`}
                      >
                        {service.isActive ? "비활성화" : "활성화"}
                      </button>
                    </div>
                    <button
                      onClick={() => handleDeleteService(service.id)}
                      className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 서비스 추가/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingService ? "서비스 수정" : "새 서비스 추가"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 서비스명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    서비스명 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 가정 청소"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    설명
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="서비스에 대한 설명을 입력하세요"
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  />
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {(Object.keys(CATEGORY_LABELS) as ServiceCategory[]).map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_LABELS[cat]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 가격 및 소요시간 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      가격 (원) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="50000"
                      min="0"
                      step="1000"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      소요시간 (분) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="120"
                      min="0"
                      step="10"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* 활성 상태 */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      서비스 활성화 (고객이 예약 가능)
                    </span>
                  </label>
                </div>

                {/* 제출 버튼 */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                      submitting
                        ? "bg-gray-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? "저장 중..." : editingService ? "수정하기" : "추가하기"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
