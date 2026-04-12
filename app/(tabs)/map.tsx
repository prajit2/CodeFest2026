import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import MapView, { Marker, Circle, Region } from 'react-native-maps';
import * as Location from 'expo-location';
import { useMapStore } from '@/store/mapStore';
import { useUserStore } from '@/store/userStore';
import { LayerFilterPanel } from '@/components/map/LayerFilterPanel';
import { ResourceDetailPanel } from '@/components/map/ResourceDetailPanel';
import { Resource, ResourceCategory } from '@/constants/types';
import { MARKER_COLORS } from '@/constants/mapColors';
import { api } from '@/services/api';
import { CrimePointSchema, ResourceSchema } from '@/services/apiTypes';

// Philly center
const PHILLY_REGION: Region = {
  latitude: 39.9526,
  longitude: -75.1652,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

function toResource(r: ResourceSchema): Resource {
  return {
    id: r.id,
    name: r.name,
    category: r.category as ResourceCategory,
    address: r.address,
    latitude: r.latitude,
    longitude: r.longitude,
    phone: r.phone,
    hours: r.hours,
    nearestSeptaStops: r.nearest_septa_stops,
  };
}

export default function MapScreen() {
  const mapRef = useRef<MapView>(null);
  const [locationGranted, setLocationGranted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resources, setResources] = useState<Resource[]>([]);
  const [crimePoints, setCrimePoints] = useState<CrimePointSchema[]>([]);

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
    })();
  }, []);

  // Fetch resources and crime heatmap from real API
  useEffect(() => {
    setLoading(true);
    Promise.all([api.resources.list(), api.crime.heatmap()])
      .then(([rawResources, crimeData]) => {
        setResources(rawResources.map(toResource));
        setCrimePoints(crimeData);
      })
      .catch((err) => {
        console.error('Map data fetch failed:', err);
        setResources([]);
        setCrimePoints([]);
      })
      .finally(() => setLoading(false));
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

  const visibleResources = resources.filter((r) => {
    if (r.category === 'campus_resource' && !isStudent) return false;
    return visibleCategories[r.category as ResourceCategory];
  });

  const focusedResource = focusedResourceId
    ? resources.find((r) => r.id === focusedResourceId) ?? null
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

        {crimeOverlayVisible && crimePoints.map((pt, i) => (
          <Circle
            key={`crime-${i}`}
            center={{ latitude: pt.latitude, longitude: pt.longitude }}
            radius={200}
            fillColor="rgba(244,67,54,0.25)"
            strokeColor="rgba(244,67,54,0.5)"
            strokeWidth={1}
          />
        ))}
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
