import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Heatmap, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { LayerFilterPanel } from '@/components/map/LayerFilterPanel';
import { ResourceDetailPanel } from '@/components/map/ResourceDetailPanel';
import { Resource, ResourceCategory } from '@/constants/types';
import { MARKER_COLORS } from '@/constants/mapColors';

// Philly center
const PHILLY_REGION: Region = {
  latitude: 39.9526,
  longitude: -75.1652,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

// Stub resources — swap out for real /resources API in Week 3
const STUB_RESOURCES: Resource[] = [
  {
    id: '1',
    name: 'Broad Street Pantry',
    category: 'food_bank',
    address: '1234 Broad St, Philadelphia, PA',
    latitude: 39.948,
    longitude: -75.166,
    phone: '215-555-0101',
    hours: 'Mon–Fri 9am–5pm',
  },
  {
    id: '2',
    name: 'Project HOME Shelter',
    category: 'shelter',
    address: '1415 N Broad St, Philadelphia, PA',
    latitude: 39.973,
    longitude: -75.162,
    phone: '215-555-0202',
    hours: '24/7',
  },
  {
    id: '3',
    name: 'Health Center 4',
    category: 'clinic',
    address: '4400 Haverford Ave, Philadelphia, PA',
    latitude: 39.972,
    longitude: -75.19,
    phone: '215-555-0303',
    hours: 'Mon–Sat 8am–6pm',
  },
  {
    id: '4',
    name: 'Drexel Counseling Center',
    category: 'campus_resource',
    address: '3201 Arch St, Philadelphia, PA',
    latitude: 39.9563,
    longitude: -75.1874,
    phone: '215-895-1415',
    hours: 'Mon–Fri 9am–5pm',
  },
  {
    id: '5',
    name: 'Broad & Pattison SEPTA',
    category: 'septa',
    address: 'Broad St & Pattison Ave',
    latitude: 39.9032,
    longitude: -75.1677,
  },
  {
    id: '6',
    name: 'Council for Recovery',
    category: 'support_group',
    address: '8 Penn Center, Philadelphia, PA',
    latitude: 39.9534,
    longitude: -75.1674,
    phone: '215-555-0606',
    hours: 'See schedule',
  },
];

// Stub crime heatmap points — swap for /crime/heatmap in Week 3
const STUB_CRIME_POINTS = [
  { latitude: 39.988, longitude: -75.155, weight: 1 },
  { latitude: 39.975, longitude: -75.14, weight: 0.8 },
  { latitude: 39.962, longitude: -75.16, weight: 0.6 },
  { latitude: 39.945, longitude: -75.175, weight: 0.7 },
];

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(true);

  const visibleCategories = useMapStore((s) => s.visibleCategories);
  const crimeOverlayVisible = useMapStore((s) => s.crimeOverlayVisible);
  const focusedResourceId = useMapStore((s) => s.focusedResourceId);
  const centerLatitude = useMapStore((s) => s.centerLatitude);
  const centerLongitude = useMapStore((s) => s.centerLongitude);
  const setFocusedResource = useMapStore((s) => s.setFocusedResource);

  const isStudent = useUserStore((s) => s.isStudent);

  // Request location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationGranted(status === 'granted');
      setLoading(false);
    })();
  }, []);

  // React to chat-to-map dispatch (center camera)
  useEffect(() => {
    if (centerLatitude && centerLongitude && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: centerLatitude,
        longitude: centerLongitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  }, [centerLatitude, centerLongitude]);

  const visibleResources = STUB_RESOURCES.filter((r) => {
    if (r.category === 'campus_resource' && !isStudent) return false;
    return visibleCategories[r.category as ResourceCategory];
  });

  const focusedResource = focusedResourceId
    ? STUB_RESOURCES.find((r) => r.id === focusedResourceId) ?? null
    : null;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2C7A3A" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={PHILLY_REGION}
        showsUserLocation={locationGranted}
        showsMyLocationButton={locationGranted}
      >
        {visibleResources.map((resource) => (
          <Marker
            key={resource.id}
            coordinate={{ latitude: resource.latitude, longitude: resource.longitude }}
            title={resource.name}
            pinColor={MARKER_COLORS[resource.category as ResourceCategory]}
            onPress={() => setFocusedResource(resource.id)}
          />
        ))}

        {crimeOverlayVisible && (
          <Heatmap
            points={STUB_CRIME_POINTS}
            opacity={0.7}
            radius={40}
            gradient={{
              colors: ['#00FF00', '#FFFF00', '#FF0000'],
              startPoints: [0.1, 0.45, 0.85],
              colorMapSize: 256,
            }}
          />
        )}
      </MapView>

      <LayerFilterPanel />

      {focusedResource && (
        <ResourceDetailPanel
          resource={focusedResource}
          onClose={() => setFocusedResource(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
