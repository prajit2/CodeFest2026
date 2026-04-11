import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Text, Platform } from 'react-native';
import MapView, { Marker, Heatmap, Circle, Region } from 'react-native-maps';
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
    university: r.description ?? undefined,
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
  const university = useUserStore((s) => s.university);

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
    if (r.category === 'campus_resource') {
      if (!isStudent) return false;
      if (university && r.university && r.university !== university) return false;
    }
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
        zoomEnabled
        scrollEnabled
        pitchEnabled
        rotateEnabled
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

        {crimeOverlayVisible && Platform.OS === 'android' && (
          <Heatmap
            points={crimePoints}
            opacity={0.7}
            radius={40}
            gradient={{
              colors: ['#00FF00', '#FFFF00', '#FF0000'],
              startPoints: [0.1, 0.45, 0.85],
              colorMapSize: 256,
            }}
          />
        )}
        {crimeOverlayVisible && Platform.OS === 'ios' &&
          crimePoints
            .filter((p) => p.weight >= 0.1)
            .map((p, i) => (
              <Circle
                key={`crime-${i}`}
                center={{ latitude: p.latitude, longitude: p.longitude }}
                radius={120}
                strokeWidth={0}
                strokeColor="transparent"
                fillColor={`rgba(220,30,30,${Math.min(p.weight * 0.7, 0.6)})`}
              />
            ))
        }
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
