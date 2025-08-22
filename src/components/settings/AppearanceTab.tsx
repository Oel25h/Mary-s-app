'use client'

import { useState } from 'react'
import { Palette, Monitor, Sun, Moon } from 'lucide-react'

export default function AppearanceTab() {
  const [appearance, setAppearance] = useState({
    theme: 'light',
    accentColor: 'blue',
    fontSize: 'medium',
    compactMode: false
  })

  const handleAppearanceChange = (key: string, value: any) => {
    setAppearance(prev => ({ ...prev, [key]: value }))
  }

  const themes = [
    { id: 'light', name: 'Light', icon: <Sun className="w-5 h-5" /> },
    { id: 'dark', name: 'Dark', icon: <Moon className="w-5 h-5" /> },
    { id: 'system', name: 'System', icon: <Monitor className="w-5 h-5" /> }
  ]

  const accentColors = [
    { id: 'blue', name: 'Blue', color: 'bg-blue-500' },
    { id: 'purple', name: 'Purple', color: 'bg-purple-500' },
    { id: 'green', name: 'Green', color: 'bg-green-500' },
    { id: 'orange', name: 'Orange', color: 'bg-orange-500' },
    { id: 'pink', name: 'Pink', color: 'bg-pink-500' },
    { id: 'teal', name: 'Teal', color: 'bg-teal-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center space-x-3 mb-6">
          <Palette className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Theme</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          {themes.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleAppearanceChange('theme', theme.id)}
              className={`p-4 border-2 rounded-lg transition-colors ${
                appearance.theme === theme.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex flex-col items-center space-y-2">
                {theme.icon}
                <span className="text-sm font-medium">{theme.name}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Accent Color</h3>
        
        <div className="grid grid-cols-6 gap-3">
          {accentColors.map((color) => (
            <button
              key={color.id}
              type="button"
              onClick={() => handleAppearanceChange('accentColor', color.id)}
              className={`relative p-3 rounded-lg border-2 transition-colors ${
                appearance.accentColor === color.id
                  ? 'border-gray-400'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${color.color} mx-auto`}></div>
              <span className="text-xs text-gray-600 mt-1 block">{color.name}</span>
              {appearance.accentColor === color.id && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Display Options</h3>
        
        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Font Size
            </label>
            <div className="flex space-x-4">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleAppearanceChange('fontSize', size)}
                  className={`px-4 py-2 rounded-lg border transition-colors capitalize ${
                    appearance.fontSize === size
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Mode */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Compact Mode</h4>
              <p className="text-sm text-gray-500">Reduce spacing and padding for more content</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={appearance.compactMode}
                onChange={(e) => handleAppearanceChange('compactMode', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}
