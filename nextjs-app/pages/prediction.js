import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

const PredictionPage = () => {
  const [formData, setFormData] = useState({
    streetName: '',
    betweenStreets: '',
    dateTime: '', // Including dateTime input for both date and time
  });
  const [prediction, setPrediction] = useState(null);
  const [confidenceScore, setConfidenceScore] = useState(null); // State for confidence score
  const [error, setError] = useState(null);
  const [streetsData, setStreetsData] = useState([]); // State for all streets data
  const [uniqueStreetNames, setUniqueStreetNames] = useState([]); // State for unique street names
  const [betweenStreets, setBetweenStreets] = useState([]); // State for between streets based on selected street
  const [loading, setLoading] = useState(false); // State to handle loading indicator

  // Fetch the streets data on mount
  useEffect(() => {
    const fetchStreetsData = async () => {
      try {
        const response = await fetch('/api/streetsdata');
        if (!response.ok) {
          throw new Error('Failed to fetch streets data');
        }
        const data = await response.json();
        setStreetsData(data);

        // Extract unique street names
        const streetNames = data.map(item => item.streetName);
        const uniqueNames = [...new Set(streetNames)]; // Remove duplicates
        setUniqueStreetNames(uniqueNames);
      } catch (error) {
        console.error('Error fetching streets data:', error);
      }
    };

    fetchStreetsData();
  }, []);

  // Fetch between streets based on the selected street name
  useEffect(() => {
    if (formData.streetName) {
      const fetchStreetData = async () => {
        setLoading(true);
        try {
          const formattedStreetName = encodeURIComponent(formData.streetName); // Format the street name
          const response = await fetch(`/api/streetsdata?streetName=${formattedStreetName}`);
          if (!response.ok) {
            throw new Error('Failed to fetch street data');
          }
          const data = await response.json();

          // Extract unique between streets (now from a single field)
          const betweenStreetsList = data.map(item => item.betweenStreets);
          const uniqueBetweenStreets = [...new Set(betweenStreetsList)]; // Remove duplicates
          setBetweenStreets(uniqueBetweenStreets);
        } catch (error) {
          console.error('Error fetching street data:', error);
        }
        setLoading(false);
      };

      fetchStreetData();
    } else {
      setBetweenStreets([]); // Clear the between streets if no street is selected
    }
  }, [formData.streetName]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setConfidenceScore(null); // Reset confidence score
    setError(null);

    // Convert the dateTime input into the required format for the API
    const [date, time] = formData.dateTime.split('T');
    const [hour, minute] = time.split(':');
    const dateObj = new Date(formData.dateTime);
    const dayOfWeek = dateObj.toLocaleString('en-us', { weekday: 'long' }); // Example: "Monday"
    const month = dateObj.toLocaleString('en-us', { month: 'long' }); // Example: "January"
    const dayOfMonth = dateObj.getDate(); // Day of the month as a number (e.g., 7)
    const intervalOfDay = Math.floor((parseInt(hour) * 60 + parseInt(minute)) / 10); // Calculate intervalOfDay

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
        setPrediction(data.prediction); // Set the prediction result
        setConfidenceScore(data.confidenceScore); // Set the confidence score
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
