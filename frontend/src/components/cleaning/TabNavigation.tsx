"use client";

import { CLEANING_TABS, TabType } from "@/constants/cleaning";

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="flex border-b border-gray-200 overflow-x-auto">
      {CLEANING_TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 min-w-[120px] px-6 py-4 text-center font-semibold transition-all ${
            activeTab === tab.id
              ? "bg-blue-600 text-white border-b-4 border-blue-600"
              : "bg-white text-gray-600 hover:bg-gray-50"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
