import {
  useState,
  useEffect,
  useCallback
} from 'react';

function useLocalStorage < T > (key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState < T > (() => {
    if(typeof window === 'undefined') return

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value: T) => {
    if(typeof window === 'undefined') return

    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.log(error);
    }
  }, [storedValue]);

  useEffect(() => {
    const storedValue = window.localStorage.getItem(key);
    if (storedValue) {
      setStoredValue(JSON.parse(storedValue));
    }
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;