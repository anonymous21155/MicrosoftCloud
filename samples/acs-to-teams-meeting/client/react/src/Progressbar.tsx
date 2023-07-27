import React, { useState, useEffect } from 'react';

function ProgressBar() {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress < 100) {
          const nextProgress = prevProgress + 60;
          return nextProgress <= 100 ? nextProgress : 100;
        }
        return prevProgress;
      });
    }, 2000); 
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="progress bg-light" style={{ height: "2px" }}>
      <div
        className="progress-bar bg-primary"
        style={{ width: `${progress}%`, transition: "width 6s ease-in-out" }}
      ></div>
    </div>
  );
}

export default ProgressBar;
