import { useState, useEffect, useMemo, useCallback } from 'react';

function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  const [width, setWidth] = useState<number>(window.innerWidth);
  const [height, setHeight] = useState<number>(window.innerHeight);
  const handleResize = useCallback(() => {
    setWidth(window.innerWidth);
    setHeight(window.innerHeight);
    }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [handleResize]);

  //updates the width and height values only if the window size has changed
  return useMemo(()=> [height, width], [height, width]) ;
};

export default useWindowSize