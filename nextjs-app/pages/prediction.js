import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    streetName: '',
    betweenStreets: '',
    dateTime: '',
  });
  const [prediction, setPrediction] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null);
  const [error, setError] = useState(null);
  const [streetsData, setStreetsData] = useState([]);
  const [uniqueStreetNames, setUniqueStreetNames] = useState([]); 
  const [betweenStreets, setBetweenStreets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStreetsData = async () => {
      try {
        const response = await fetch('/api/streetsdata');
        if (!response.ok) {
          throw new Error('Failed to fetch streets data');
        }
        const data = await response.json();
        setStreetsData(data);

        const streetNames = data.map(item => item.streetName);
        const uniqueNames = [...new Set(streetNames)];
        setUniqueStreetNames(uniqueNames);
      } catch (error) {
        console.error('Error fetching streets data:', error);
      }
    };

    fetchStreetsData();
  }, []);

  useEffect(() => {
    if (formData.streetName) {
      const fetchStreetData = async () => {
        setLoading(true);
        try {
          const formattedStreetName = encodeURIComponent(formData.streetName);
          const response = await fetch(`/api/streetsdata?streetName=${formattedStreetName}`);
          if (!response.ok) {
            throw new Error('Failed to fetch street data');
          }
          const data = await response.json();


          const betweenStreetsList = data.map(item => item.betweenStreets);
          const uniqueBetweenStreets = [...new Set(betweenStreetsList)];
          setBetweenStreets(uniqueBetweenStreets);
        } catch (error) {
          console.error('Error fetching street data:', error);
        }
        setLoading(false);
      };

      fetchStreetData();
    } else {
      setBetweenStreets([]); 
    }
  }, [formData.streetName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setConfidenceScore(null); 
    setError(null);


    const [date, time] = formData.dateTime.split('T');
    const [hour, minute] = time.split(':');
    const dateObj = new Date(formData.dateTime);
    const dayOfWeek = dateObj.toLocaleString('en-us', { weekday: 'long' }); 
    const month = dateObj.toLocaleString('en-us', { month: 'long' }); 
    const dayOfMonth = dateObj.getDate(); 
    const intervalOfDay = Math.floor((parseInt(hour) * 60 + parseInt(minute)) / 10); 

    const requestBody = {
      streetName: formData.streetName,
      betweenStreets: formData.betweenStreets,
      dayOfWeek,
      month,
      dayOfMonth,
      intervalOfDay,
    };

    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const data = await response.json();

      if (response.ok) {
        setPrediction(data.prediction);
        setConfidenceScore(data.confidenceScore);
      } else {
        setError(data.error || 'Failed to get prediction.');
      }
    } catch (err) {
      setError('An error occurred while predicting.');
    }
  };

  return (
    <Layout>
      <h1>Parking Prediction</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Street Name:
          <select
            name="streetName"
            value={formData.streetName}
            onChange={handleChange}
            required
          >
            <option value="">Select a street</option>
            {uniqueStreetNames.map((name, index) => (
              <option key={index} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        {formData.streetName && (
          <label>
            Between Streets:
            {loading ? (
              <p>Loading...</p>
            ) : (
              <select
                name="betweenStreets"
                value={formData.betweenStreets}
                onChange={handleChange}
                required
              >
                <option value="">Select a between street</option>
                {betweenStreets.map((name, index) => (
                  <option key={index} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            )}
          </label>
        )}

        <label>
          Date and Time:
          <input
            type="datetime-local"
            name="dateTime"
            value={formData.dateTime}
            onChange={handleChange}
            required
          />
        </label>

        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
          type="submit"
        >
          Predict
        </button>
      </form>

      {prediction && (
        <p>
          Prediction: {prediction}
        </p>
      )}

      {confidenceScore !== null && (
        <p>
          Confidence Score: { (confidenceScore * 100).toFixed(2) }%
        </p>
      )}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
    </Layout>
  );
};

export default PredictionPage;
