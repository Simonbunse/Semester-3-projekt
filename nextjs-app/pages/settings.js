import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';

const SettingsPage = () => {
    const [streetsData, setStreetsData] = useState([]);
    const [uniqueStreetNames, setUniqueStreetNames] = useState([]);
    const router = useRouter();
  
    const fetchStreetsData = async () => {
      try {
        const response = await fetch('/api/streetsdata');
        if (!response.ok) {
          throw new Error('Failed to fetch streets data');
        }
        const data = await response.json();
        setStreetsData(data);
  
        const streetNames = data.map(item => item.streetName);
        const uniqueNames = [...new Set(streetNames)]; // Remove duplicates
        setUniqueStreetNames(uniqueNames);
      } catch (error) {
        console.error('Error fetching streets data:', error);
      }
    };
  
    useEffect(() => {
      fetchStreetsData();
    }, []);
  
    const handleStreetClick = (streetName) => {
      const formattedName = streetName.toLowerCase().replace(/ /g, '-');
      router.push(`/settings/${formattedName}`);
    };
  
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center">
          <h1>List of parkinglots</h1>
          <div className="mt-4">
            <h2>Streets</h2>
            <div className="flex flex-col space-y-2">
              {uniqueStreetNames.map((name, index) => (
                <button
                  key={index}
                  onClick={() => handleStreetClick(name)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
};

export default SettingsPage;
