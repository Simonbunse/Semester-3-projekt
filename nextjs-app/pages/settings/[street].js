import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import AddDeviceModal from '@/components/AddDeviceModal';

const StreetEditPage = () => {
  const [streetData, setStreetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const { street } = router.query;

  const formatStreetName = (streetName) => {
    return streetName.toUpperCase().replace(/-/g, ' ');
  };

  const fetchStreetData = async () => {
    try {
      const formattedStreetName = formatStreetName(street);
      const response = await fetch(`/api/streetsdata?streetName=${formattedStreetName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch street data');
      }
      const data = await response.json();
      if (data && data.length > 0) {
        const latestUpdate = new Date(data[0].lastUpdated);
        if (!lastUpdated || latestUpdate > lastUpdated) {
          setStreetData(data);
          setLastUpdated(latestUpdate);
        }
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleAddDevice = async (newDevice) => {
    try {
      const response = await fetch('/api/streetsdata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetName: newDevice.streetName,
          betweenStreets: newDevice.betweenStreets,
          deviceId: parseInt(newDevice.deviceId, 10),
          addNewDevice: true,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add new device');
      }
  
      console.log('Device added successfully');
      await fetchStreetData(); // Refresh data
      setIsModalOpen(false); // Close modal
    } catch (error) {
      console.error('Error adding device:', error);
    }
  };

  const handleDeleteDevice = async (deviceId, betweenStreets) => {
    try {
      const response = await fetch('/api/streetsdata', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          streetName: formatStreetName(street),
          betweenStreets: betweenStreets, // Now a single field
          deviceId: parseInt(deviceId, 10),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to delete the device');
      }
      await fetchStreetData(); // Refresh data
    } catch (error) {
      console.error('Error deleting device:', error);
    }
  };
  
  useEffect(() => {
    if (street) {
      fetchStreetData();
      const intervalId = setInterval(() => {
        fetchStreetData();
      }, 100000);
      return () => clearInterval(intervalId);
    }
  }, [street, lastUpdated]);

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center">
        {loading ? (
          <h2>Loading...</h2>
        ) : error ? (
          <h2>Error: {error}</h2>
        ) : (
          <>
            <h1>Edit page for {formatStreetName(street)}</h1>

            {streetData.length > 0 ? (
              <div className="mt-4 w-full max-w-4xl">
                <div className="flex items-center justify-between">
                  <h1>
                    Total active parking spots:{" "}
                    {streetData.reduce((total, data) => {
                      const activeDevices = data.devices.filter((device) => device.vehiclePresent).length;
                      return total + activeDevices;
                    }, 0)}
                  </h1>
                  <button
                    className="text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Add new device
                  </button>
                </div>
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr>
                      <th className="border px-4 py-2 text-center">Device ID</th>
                      <th className="border px-4 py-2 text-center">Between Streets</th>
                      <th className="border px-4 py-2 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {streetData.map((data, index) =>
                      data.devices.map((device, deviceIndex) => (
                        <tr key={`${index}-${deviceIndex}`} className="text-center">
                          <td className="border px-4 py-2">{device.deviceId}</td>
                          <td className="border px-4 py-2">{data.betweenStreets}</td>
                          <td className="border px-4 py-2">
                            <button
                              className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded"
                              onClick={() =>
                                handleDeleteDevice(device.deviceId, data.betweenStreets)
                              }
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No data available for this street.</p>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AddDeviceModal
          streetName={formatStreetName(street)}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddDevice}
        />
      )}
    </Layout>
  );
};

export default StreetEditPage;
