import React, { useState, useEffect } from 'react';
import Parkinglotgraphic from '@/components/parkinglotgraphic';
import { connectToBroker } from '@/lib/mqtt';
import Layout from '@/components/Layout';

const ParkinglotPage = () => {
  const [parkingSpots, setParkingSpots] = useState(null); 
  
  useEffect(() => {
    const disconnect = connectToBroker('parking/updates', setParkingSpots);
    
    return () => {
      disconnect();
    };
  }, []);

  if (!parkingSpots) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center">
          <h1>Loading parking lot availability...</h1>
        </div>
      </Layout>
    );
  }

  const [slot1 = false, slot2 = false, slot3 = false, slot4 = false, slot5 = false] = parkingSpots.map(spot => spot.isFree || false);

  return (
    <Layout>
      <div className="flex flex-col justify-center items-center">
        <h1>Parking Lot Availability</h1>
        <Parkinglotgraphic 
          slot1={slot1} 
          slot2={slot2} 
          slot3={slot3} 
          slot4={slot4} 
          slot5={slot5} 
        />
      </div>
    </Layout>
  );
};

export default ParkinglotPage;
