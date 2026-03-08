import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { MapPin, Search, X } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MapView, { PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Constants ---
const DUBAI_COORDINATES = {
  latitude: 25.1972,
  longitude: 55.2744,
  latitudeDelta: 0.005,
  longitudeDelta: 0.005,
};

type Step = 'SELECTING' | 'CONFIRMING';
type PostType = 'PROPERTY' | 'FRANCHISE_DEAL' | 'SELL_FRANCHISE';

export default function CreateListingScreen() {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  
  // State
  const [step, setStep] = useState<Step>('SELECTING');
  const [region, setRegion] = useState<Region>(DUBAI_COORDINATES);
  const [address, setAddress] = useState({ title: 'Loading...', subtitle: 'Dubai, UAE' });
  const [modalVisible, setModalVisible] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // 1. Initial Permissions & Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    })();
  }, []);

  // 2. Helper: Get Address from Coordinates (Reverse Geocode)
  const fetchAddress = async (lat: number, long: number) => {
    setIsGeocoding(true);
    try {
      const result = await Location.reverseGeocodeAsync({ latitude: lat, longitude: long });
      if (result.length > 0) {
        const item = result[0];
        setAddress({
          title: item.name || item.street || 'Unknown Location',
          subtitle: `${item.district || ''}, ${item.city || 'Dubai'}`
        });
      }
    } catch (e) {
      setAddress({ title: 'Selected Location', subtitle: 'Dubai, UAE' });
    } finally {
      setIsGeocoding(false);
    }
  };

  // 3. Handlers
  const handleSelectLocation = () => {
    // When user clicks "SELECT LOCATION", we fetch details and show the Confirm card
    fetchAddress(region.latitude, region.longitude);
    setStep('CONFIRMING');
  };

  const handleConfirmFinal = () => {
    // Navigate to the new Property Create page
    router.push('/(home)/create/select-franchise');
  };

  const handleRegionChange = (r: Region) => {
    setRegion(r);
    // If user moves map while in 'CONFIRMING' state, go back to 'SELECTING'
    if (step === 'CONFIRMING') {
      setStep('SELECTING');
    }
  };

  const handleSelectType = (type: PostType) => {
    setModalVisible(false);
    console.log(`Selected: ${type} at ${region.latitude}, ${region.longitude}`);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* MAP LAYER */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={DUBAI_COORDINATES}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={true}
        rotateEnabled={false}
      />

      {/* CENTER PIN */}
      <View style={styles.centerMarkerContainer} pointerEvents="none">
        <View style={styles.markerWrapper}>
          <MapPin size={48} color="black" fill="black" />
          <View style={styles.markerShadow} />
        </View>
      </View>

      {/* TOP SEARCH BAR */}
      <SafeAreaView style={styles.topContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="black" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search location"
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </SafeAreaView>

      {/* BOTTOM UI: SWITCHES BASED ON STEP */}
      <View style={styles.bottomContainer}>
        
        {/* State 1: SELECT LOCATION BUTTON */}
        {step === 'SELECTING' && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleSelectLocation}
            style={styles.selectButton}
          >
            <Text style={styles.buttonTextWhite}>SELECT LOCATION</Text>
          </TouchableOpacity>
        )}

        {/* State 2: CONFIRM CARD (White Box) */}
        {step === 'CONFIRMING' && (
          <View style={styles.confirmCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.locationTitle}>
                {isGeocoding ? 'Loading...' : address.title}
              </Text>
              <Text style={styles.locationSubtitle}>
                {address.subtitle}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.confirmButtonSmall} 
              onPress={handleConfirmFinal}
            >
              <Text style={styles.buttonTextWhite}>CONFIRM</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* MODAL: POST TYPE */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE NEW</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionButton} onPress={() => handleSelectType('PROPERTY')}>
              <Text style={styles.buttonTextWhite}>PROPERTY LISTING</Text>
            </TouchableOpacity>
            <Text style={styles.optionDescription}>List commercial property starting at AED 9/month</Text>

            <TouchableOpacity style={styles.optionButton} onPress={() => handleSelectType('FRANCHISE_DEAL')}>
              <Text style={styles.buttonTextWhite}>NEW FRANCHISE DEAL</Text>
            </TouchableOpacity>
            <Text style={styles.optionDescription}>Add new property and create new franchise deal</Text>

            <TouchableOpacity style={styles.optionButton} onPress={() => handleSelectType('SELL_FRANCHISE')}>
              <Text style={styles.buttonTextWhite}>SELL YOUR FRANCHISE</Text>
            </TouchableOpacity>
            <Text style={styles.optionDescription}>List an existing franchise for resale</Text>
          </View>
        </View>
      </Modal>

    </View>
  );
}

// --- PURE STYLES (No NativeWind) ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // Map Pin
  centerMarkerContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerWrapper: {
    alignItems: 'center',
    marginBottom: 40, // Lift pin slightly above center
  },
  markerShadow: {
    width: 8,
    height: 8,
    backgroundColor: 'black',
    borderRadius: 4,
    marginTop: 2,
    opacity: 0.3,
  },
  // Top Search
  topContainer: {
    position: 'absolute',
    top: 0,
    width: '100%',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: 'black',
  },
  // Bottom Area
  bottomContainer: {
    position: 'absolute',
    bottom: 40,
    width: '100%',
    paddingHorizontal: 20,
  },
  selectButton: {
    backgroundColor: 'black',
    paddingVertical: 18,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  // Confirm Card Style
  confirmCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  confirmButtonSmall: {
    backgroundColor: 'black',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginLeft: 10,
  },
  buttonTextWhite: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: 'black',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 8,
  },
  optionDescription: {
    color: '#6B7280',
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
  },
});