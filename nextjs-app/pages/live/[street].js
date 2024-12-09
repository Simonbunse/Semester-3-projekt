// pages/live/[street].js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const StreetDetailsPage = () => {
  const [streetData, setStreetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null); // Track last updated time
  const router = useRouter();
  const { street } = router.query;

  // Format street name
  const formatStreetName = (streetName) => {
    return streetName.toUpperCase().replace(/-/g, ' ');
  };

  // Fetch street data
  const fetchStreetData = async () => {
    try {
      const formattedStreetName = formatStreetName(street); // Format the street name
      const response = await fetch(`/api/streetsdata?streetName=${formattedStreetName}`);
      if (!response.ok) {
        throw new Error('Failed to fetch street data');
      }
      const data = await response.json();
      
      // Check if the data has changed by comparing lastUpdated times
      if (data && data.length > 0) {
        const latestUpdate = new Date(data[0].lastUpdated);
        if (!lastUpdated || latestUpdate > lastUpdated) {
          setStreetData(data);
          setLastUpdated(latestUpdate); // Update the lastUpdated state
        }
      }
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  // Periodically fetch the street data every 10 seconds
  useEffect(() => {
    if (street) {
      fetchStreetData(); // Fetch initially

      const intervalId = setInterval(() => {
        fetchStreetData();
      }, 100000);

      return () => clearInterval(intervalId); // Cleanup on component unmount
    }
  }, [street, lastUpdated]);

  // Calculate active devices
  const calculateActiveDevices = () => {
    return streetData.reduce((total, data) => {
      const activeDevices = data.devices.filter((device) => device.vehiclePresent).length;
      return total + activeDevices;
    }, 0);
  };

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center">
        {loading ? (
          <h2>Loading...</h2>
        ) : error ? (
          <h2>Error: {error}</h2>
        ) : (
          <>
            <h1>Details for {formatStreetName(street)}</h1>

            {streetData.length > 0 ? (
              <div className="mt-4">
                <h2>Total active parking spots: {calculateActiveDevices()}</h2>
                <ul className="space-y-2">
                  {streetData.map((data, index) => (
                    <li key={index} className="border p-2">
                      <h3>{data.betweenStreets}</h3>
                      <p>Total Parking spots: {data.devices.length}</p>
                      <p>Free Parking spots: {data.devices.filter((device) => !device.vehiclePresent).length}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p>No data available for this street.</p>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default StreetDetailsPage;
