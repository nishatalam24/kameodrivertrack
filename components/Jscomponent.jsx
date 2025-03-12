import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import * as Location from 'expo-location';

const Jscomponent = () => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
    })();
  }, []);

  return (
    <View>
      <Text>{errorMsg ? errorMsg : JSON.stringify(location)}</Text>
      <Text>?🌍</Text>
    </View>
  );
};

export default Jscomponent;
