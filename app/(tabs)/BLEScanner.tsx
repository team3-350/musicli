import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Button,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Alert,
} from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

const manager = new BleManager();
// For the BLE service (Music Sharing)
export const SERVICE_UUID = '9b1de7d8-20b4-42d2-8886-cfb3fbb7a777';

// For the characteristic (Send song info)
export const CHARACTERISTIC_UUID = 'c5c76a1c-0a4c-4d89-a1e5-6c2767dd5f30';

export default function BLEScannerScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    requestPermissions();
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
        ]);

        const allGranted = Object.values(result).every(
          (r) => r === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          Alert.alert('Missing Permissions', 'Please enable all permissions for BLE to work.');
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    }
  };

  const startScan = () => {
    setDevices([]);
    setScanning(true);

    manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('Scan error:', error);
        setScanning(false);
        return;
      }

      if (device && device.name) {
        setDevices((prevDevices) => {
          const exists = prevDevices.find((d) => d.id === device.id);
          return exists ? prevDevices : [...prevDevices, device];
        });
      }
    });

    setTimeout(() => {
      manager.stopDeviceScan();
      setScanning(false);
    }, 10000);
  };

   return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Device Scanner</Text>
      <Button
        title={scanning ? 'Scanning...' : 'Scan for Devices'}
        onPress={startScan}
        disabled={scanning}
      />
      <FlatList
        data={devices}
        keyExtractor={(item, index) => item?.id ?? index.toString()}
        renderItem={({ item }) => (
          <Text
            style={styles.device}
            onPress={() => connectAndSend(item)}
        >
    {item.name} - {item.id}
  </Text>
)}
        ListEmptyComponent={
          !scanning ? (
            <Text style={styles.empty}>No devices found.</Text>
          ) : null
        }
      />
    </View>
  );
}


import { Buffer } from 'buffer'; // Make sure to install 'buffer' package

const connectAndSend = async (device: Device) => {
  try {
    // Connect to the device
    const connectedDevice = await device.connect();
    await connectedDevice.discoverAllServicesAndCharacteristics();

    console.log(`Connected to ${connectedDevice.name}`);

    // Sample data to send
    const dataToSend = {
      id: 'abc123',             // Replace with dynamic song ID
      platform: 'spotify',      // Replace with actual platform
    };

    const base64Data = Buffer.from(JSON.stringify(dataToSend)).toString('base64');

    // Write the data
    await connectedDevice.writeCharacteristicWithResponseForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      base64Data
    );

    Alert.alert('Success', `Sent song data to ${connectedDevice.name}`);

    await connectedDevice.cancelConnection(); // Disconnect (optional)

  } catch (error) {
    console.error('Connection or send failed:', error);
    Alert.alert('Error', 'Failed to connect or send data');
  }
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  device: {
    fontSize: 16,
    marginVertical: 5,
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});