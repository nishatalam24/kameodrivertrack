import { Alert } from 'react-native';

// Function to make an API GET request with state updates
export const createFetchDataHandler = (
  setApiLoading: Function,
  setApiError: Function,
  setApiData: Function
) => {
  return async (url: string) => {
    try {
      setApiLoading(true);
      setApiError(null);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("API Response:", data);
      setApiData(data);
      
      // Show success alert
      Alert.alert(
        "API Success",
        "Data fetched successfully!",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      
      return data;
    } catch (error) {
      console.error("API Error:", error);
      setApiError(error instanceof Error ? error.message : "Unknown error");
      
      // Show error alert
      Alert.alert(
        "API Error",
        error instanceof Error ? error.message : "Failed to fetch data",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }]
      );
      
      return null;
    } finally {
      setApiLoading(false);
    }
  };
};
