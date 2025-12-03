"use client";

interface AreaInputProps {
  area: number;
  onChange: (area: number) => void;
}

export default function AreaInput({ area, onChange }: AreaInputProps) {
  const handleIncrement = () => {
    onChange(area + 1);
  };

  const handleDecrement = () => {
    if (area > 1) {
      onChange(area - 1);
    } else {
      onChange(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-900 mb-1">청소 면적을 알려주세요</h3>
        <p className="text-sm text-gray-500">평수를 모르시면 빠른 선택 버튼을 이용해보세요</p>
      </div>

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="number"
              value={area}
              onChange={(e) => {
                const newValue = parseInt(e.target.value) || 0;
                onChange(Math.max(0, newValue));
              }}
              className="w-32 px-6 py-4 border-2 border-gray-300 rounded-xl text-center text-2xl font-bold focus:ring-2 focus:ring-blue-500 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <div className="absolute inset-y-0 right-0 flex flex-col border-l-2 border-gray-300 rounded-r-xl overflow-hidden">
              <button
                type="button"
                onClick={handleIncrement}
                className="flex-1 px-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                aria-label="면적 증가"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={handleDecrement}
                className="flex-1 px-2 text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border-t-2 border-gray-300"
                aria-label="면적 감소"
                disabled={area <= 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-700">평</span>
        </div>

        <div className="flex gap-2">
          {[10, 20, 30, 40, 50].map((preset) => (
            <button
              key={preset}
              onClick={() => onChange(preset)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                area === preset
                  ? "bg-blue-600 text-white shadow-md scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }`}
            >
              {preset}평
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <p className="text-sm text-blue-900">
          면적(m²)을 평수로 변환: <span className="font-semibold">면적 ÷ 3.3 = 평수</span> (예: 66m² ÷ 3.3 = 20평)
        </p>
      </div>
    </div>
  );
}
