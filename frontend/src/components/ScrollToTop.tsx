"use client";

interface ScrollToTopProps {
  scrollY: number;
}

export default function ScrollToTop({ scrollY }: ScrollToTopProps) {
  if (scrollY <= 300) return null;

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-8 right-8 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transform hover:scale-110 transition-all duration-300 z-50 flex items-center justify-center"
      aria-label="맨 위로"
    >
      ↑
    </button>
  );
}
