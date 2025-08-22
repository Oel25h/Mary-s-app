'use client'

import { cn } from '@/lib/utils'

interface SettingsTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function SettingsTabs({ activeTab, onTabChange }: SettingsTabsProps) {
  const tabs = [
    { id: 'preferences', label: 'Preferences' },
    { id: 'account', label: 'Account' },
    { id: 'data', label: 'Data & Import' },
    { id: 'appearance', label: 'Appearance' },
  ]

  return (
    <div className="border-b border-gray-200 mb-8">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "py-2 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  )
}
