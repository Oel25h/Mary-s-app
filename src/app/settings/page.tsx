'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import SettingsTabs from '@/components/settings/SettingsTabs'
import PreferencesTab from '@/components/settings/PreferencesTab'
import AccountTab from '@/components/settings/AccountTab'
import DataTab from '@/components/settings/DataTab'
import AppearanceTab from '@/components/settings/AppearanceTab'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('preferences')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'preferences':
        return <PreferencesTab />
      case 'account':
        return <AccountTab />
      case 'data':
        return <DataTab />
      case 'appearance':
        return <AppearanceTab />
      default:
        return <PreferencesTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        <Sidebar currentPage="settings" />

        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account and application preferences</p>
            </div>

            <SettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
