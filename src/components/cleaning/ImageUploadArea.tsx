"use client";

interface ImageUploadAreaProps {
  tabLabel: string;
  imageType: "before" | "after";
  uploading: boolean;
  uploadProgress: { current: number; total: number };
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ImageUploadArea({
  tabLabel,
  imageType,
  uploading,
  uploadProgress,
  fileInputRef,
  onFileChange,
}: ImageUploadAreaProps) {
  return (
    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 mb-6 bg-blue-50">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onFileChange}
        className="hidden"
        id="image-upload"
        disabled={uploading}
      />
      <label
        htmlFor="image-upload"
        className={`flex flex-col items-center ${uploading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
      >
        <div className="text-blue-600 mb-2">
          <svg
            className="mx-auto h-12 w-12"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-blue-600 font-medium">
          {uploading
            ? `업로드 중... (${uploadProgress.current}/${uploadProgress.total})`
            : `${tabLabel} - ${imageType === "before" ? "BEFORE" : "AFTER"} 이미지 업로드`}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          클릭하여 이미지 선택 (JPEG, PNG, WEBP, 개당 최대 5MB, 여러 파일 선택 가능)
        </p>

        {/* 진행률 바 */}
        {uploading && uploadProgress.total > 0 && (
          <div className="w-full max-w-md mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${(uploadProgress.current / uploadProgress.total) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
