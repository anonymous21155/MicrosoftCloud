import React, { useState, useEffect } from 'react';

const DynamicStatus = () => {
  const [h2Text, setH2Text] = useState('Establishing connection..');

  useEffect(() => {
    const changeTextAfterDelay = () => {
      setTimeout(() => {
        setH2Text('Everything is getting ready..');
      }, 3000);
      setTimeout(() => {
        setH2Text('One more moment..');
      }, 5000);
    };

    changeTextAfterDelay();
  }, []);

  return <h2 className='text'>{h2Text}</h2>;
};

export default DynamicStatus;
