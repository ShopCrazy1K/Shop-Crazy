"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Settings {
  marketplaceName: string;
  platformFeePercent: number;
  processingFeePercent: number;
  adFeePercent: number;
}

export default function AdminSettingsPage() {
  const { user: currentUser } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    marketplaceName: "Shop Crazy Market",
    platformFeePercent: 5,
    processingFeePercent: 2,
    adFeePercent: 15,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings", {
        headers: {
          "x-user-id": currentUser?.id || "",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUser?.id || "",
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setMessage("Settings saved successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        const error = await response.json();
        setMessage(error.error || "Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      setMessage("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-center py-10">Loading settings...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace Settings</h1>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes("success")
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* Marketplace Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marketplace Name
          </label>
          <input
            type="text"
            value={settings.marketplaceName}
            onChange={(e) =>
              setSettings({ ...settings, marketplaceName: e.target.value })
            }
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="Shop Crazy Market"
          />
        </div>

        {/* Platform Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.platformFeePercent}
            onChange={(e) =>
              setSettings({
                ...settings,
                platformFeePercent: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Percentage of each sale that goes to the platform
          </p>
        </div>

        {/* Processing Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Processing Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.processingFeePercent}
            onChange={(e) =>
              setSettings({
                ...settings,
                processingFeePercent: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Payment processing fee percentage
          </p>
        </div>

        {/* Ad Fee */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advertising Fee (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={settings.adFeePercent}
            onChange={(e) =>
              setSettings({
                ...settings,
                adFeePercent: parseFloat(e.target.value) || 0,
              })
            }
            className="w-full px-4 py-2 border rounded-lg"
          />
          <p className="text-xs text-gray-500 mt-1">
            Additional fee for sellers who opt into advertising
          </p>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Changing fee percentages will only affect new orders. Existing orders will keep their original fee structure.
        </p>
      </div>
    </div>
  );
}

