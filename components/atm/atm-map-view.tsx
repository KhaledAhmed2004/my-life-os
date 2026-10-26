import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useRef } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Callout,
  Circle,
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

import {
  BANKS_METADATA,
  DARK_MAP_STYLE,
} from '@/components/atm/atm-constants';
import { formatDistance } from '@/stores/atm-store';
import { Vital } from '@/constants/vital-theme';
import { AtmLocation, UserCoordinates } from '@/types/atm';

const C = Vital.colors;
const F = Vital.fonts;

interface AtmMapViewProps {
  atms: AtmLocation[];
  userLocation: UserCoordinates;
  selectedAtmId: string | null;
  onSelectAtm: (atm: AtmLocation) => void;
}

export function AtmMapView({
  atms,
  userLocation,
  selectedAtmId,
  onSelectAtm,
}: AtmMapViewProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (selectedAtmId && mapRef.current) {
      const selected = atms.find((a) => a.id === selectedAtmId);
      if (selected) {
        mapRef.current.animateToRegion(
          {
            latitude: selected.latitude,
            longitude: selected.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          },
          400
        );
      }
    }
  }, [selectedAtmId, atms]);

  const handleRecenter = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        },
        500
      );
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={StyleSheet.absoluteFill}
        customMapStyle={DARK_MAP_STYLE}
        initialRegion={{
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.045,
          longitudeDelta: 0.045,
        }}
        showsCompass={false}
        showsUserLocation={false}>
        {/* User Current Location Dot */}
        <Circle
          center={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          radius={120}
          fillColor="rgba(56, 189, 248, 0.25)"
          strokeColor="#38BDF8"
          strokeWidth={2}
        />
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.userPin}>
            <View style={styles.userInnerDot} />
          </View>
        </Marker>

        {/* ATM Markers */}
        {atms.map((atm) => {
          const bankMeta = BANKS_METADATA[atm.bank] || BANKS_METADATA.DBBL;
          const isSelected = atm.id === selectedAtmId;
          const isCrm = atm.capabilities.includes('CASH_DEPOSIT_CRM');

          return (
            <Marker
              key={atm.id}
              coordinate={{
                latitude: atm.latitude,
                longitude: atm.longitude,
              }}
              onPress={() => onSelectAtm(atm)}>
              <View
                style={[
                  styles.markerContainer,
                  isSelected && styles.markerContainerSelected,
                  { borderColor: isSelected ? '#FFFFFF' : bankMeta.color },
                ]}>
                <View
                  style={[
                    styles.markerBadge,
                    { backgroundColor: bankMeta.color },
                  ]}>
                  <MaterialIcons
                    name={isCrm ? 'savings' : 'local-atm'}
                    size={14}
                    color="#FFFFFF"
                  />
                </View>
              </View>

              <Callout tooltip>
                <View style={styles.calloutCard}>
                  <Text style={styles.calloutTitle}>{atm.name}</Text>
                  <Text style={styles.calloutSub}>
                    {bankMeta.shortName} • {formatDistance(atm.distanceMeters)}
                  </Text>
                  {isCrm && (
                    <Text style={styles.calloutCrm}>
                      CRM Cash Deposit Available
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Recenter Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleRecenter}
        style={styles.recenterBtn}>
        <MaterialIcons name="my-location" size={20} color="#38BDF8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#101416',
    position: 'relative',
  },
  userPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(56, 189, 248, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInnerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#38BDF8',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerContainer: {
    padding: 3,
    borderRadius: 20,
    backgroundColor: '#181F23',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.25 }],
    backgroundColor: '#38BDF8',
  },
  markerBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calloutCard: {
    backgroundColor: '#181F23',
    borderRadius: 12,
    padding: 10,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 160,
  },
  calloutTitle: {
    fontFamily: F.bold,
    fontSize: 12,
    color: '#FFFFFF',
  },
  calloutSub: {
    fontFamily: F.regular,
    fontSize: 10,
    color: C.onSurfaceVariant,
  },
  calloutCrm: {
    fontFamily: F.bold,
    fontSize: 9,
    color: '#D4A017',
    marginTop: 2,
  },
  recenterBtn: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#181F23',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    elevation: 4,
  },
});
