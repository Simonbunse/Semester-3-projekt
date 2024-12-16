import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';

const StreetDetailsPage = () => {
  const [streetData, setStreetData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
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

  useEffect(() => {
    if (street) {
      fetchStreetData();

      const intervalId = setInterval(() => {
        fetchStreetData();
      }, 100000);

      return () => clearInterval(intervalId);
    }
  }, [street, lastUpdated]);

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
