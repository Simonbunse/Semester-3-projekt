import { useState, useEffect } from 'react';

const AddDeviceModal = ({ onClose, onSubmit, streetName: initialStreetName }) => {
  const [streetName, setStreetName] = useState('');
  const [betweenStreets, setBetweenStreets] = useState('');
  const [deviceId, setDeviceId] = useState('');

  useEffect(() => {
    if (initialStreetName) {
      setStreetName(initialStreetName);
    }
  }, [initialStreetName]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input before submission (optional)
    if (!streetName || !betweenStreets || !deviceId) {
      alert('All fields are required');
      return;
    }

    // Pass data to parent
    onSubmit({ streetName, betweenStreets, deviceId });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add New Device</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium">Street Name:</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={streetName}
              readOnly
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Between Streets:</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={betweenStreets}
              onChange={(e) => setBetweenStreets(e.target.value)}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium">Device ID:</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="bg-gray-300 text-black px-4 py-2 rounded"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Device
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDeviceModal;
