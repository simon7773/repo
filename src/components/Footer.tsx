"use client";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-3xl"></div>
            </div>
            <p className="text-gray-400"></p>
          </div>
          <div>
            <h4 className="font-bold mb-4">서비스</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">
                가정 청소
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                사무실 청소
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                이사 청소
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                특수 청소
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">회사</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">
                회사 소개
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                문의하기
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4">고객지원</h4>
            <ul className="space-y-2 text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">
                FAQ
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                이용약관
              </li>
              <li className="hover:text-white cursor-pointer transition-colors">
                개인정보처리방침
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© 2025 집클릭. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
