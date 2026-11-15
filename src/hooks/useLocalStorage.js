import { useCallback, useEffect, useState } from "react";

// read json from local storage (storage can be blocked, e.g. in some private windows)
export function readStorage(key, fallback) {
  try {
    const saved = window.localStorage.getItem(key);
    return saved === null ? fallback : JSON.parse(saved);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage is full or blocked, the app still works without saving
  }
}

// state that is saved to local storage and stays in sync between tabs
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  // another tab changed the same key
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === key) {
        setValue(readStorage(key, initialValue));
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
    // initialValue is only a fallback, so it is left out on purpose
  }, [key]);

  const update = useCallback((next) => setValue(next), []);
  return [value, update];
}
