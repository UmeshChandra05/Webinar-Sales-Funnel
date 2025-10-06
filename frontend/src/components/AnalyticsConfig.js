import React, { useState } from 'react';

const AnalyticsConfig = ({ currentSheetId, onUpdate }) => {
  const [sheetId, setSheetId] = useState(currentSheetId);
  const [showConfig, setShowConfig] = useState(false);

  const handleUpdate = () => {
    if (sheetId.trim()) {
      onUpdate(sheetId.trim());
      setShowConfig(false);
    }
  };

  const extractSheetId = (url) => {
    // Extract Sheet ID from Google Sheets URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const handleUrlPaste = (e) => {
    const pastedValue = e.target.value;
    const extractedId = extractSheetId(pastedValue);
    setSheetId(extractedId);
  };

  if (!showConfig) {
    return (
      <button
        onClick={() => setShowConfig(true)}
        className="text-xs text-blue-600 hover:text-blue-800 underline"
        title="Configure Google Sheets data source"
      >
        ⚙️ Configure Sheet
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">📊 Configure Google Sheets Data Source</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Google Sheet ID or URL:
            </label>
            <input
              type="text"
              value={sheetId}
              onChange={handleUrlPaste}
              placeholder="Paste Sheet URL or enter Sheet ID"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              You can paste the full Google Sheets URL - we'll extract the ID automatically
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Quick Setup:</h4>
            <ol className="text-xs text-blue-800 space-y-1">
              <li>1. Open your Google Sheet</li>
              <li>2. Click "Share" → "Anyone with the link can view"</li>
              <li>3. Copy the URL and paste it above</li>
              <li>4. Click "Update" - that's it! 🎉</li>
            </ol>
          </div>

          <div className="bg-green-50 p-3 rounded-md">
            <p className="text-xs text-green-800">
              <strong>✅ Zero API Keys:</strong> Uses Google's CSV export feature - no authentication required!
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowConfig(false)}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Update Sheet
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsConfig;