import { useState, useEffect } from "react";

function useLocalStorage<T>(key: string, initialValue: T | null = null) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T | null>(() => {
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  // Use useEffect to update local storage when the state changes
  useEffect(() => {
    try {
      // Save state to local storage
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {}
  }, [key, storedValue]);

  // Return the value and a setter function
  return [storedValue, setStoredValue] as const;
}

export default useLocalStorage;
