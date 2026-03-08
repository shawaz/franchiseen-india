import { ThemedText } from '@/components/themed-text';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';

const OutletPage = () => {
  const router = useRouter();
  const { 
    id, 
    title = '', 
    budget = '', 
    earnings = '', 
    category = '',
    image = '',
    logo = ''
  } = useLocalSearchParams();

  const [activeTab, setActiveTab] = useState('about');
  const [visibleCount, setVisibleCount] = useState(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCountryFilter, setShowCountryFilter] = useState(false);
  const [showStateFilter, setShowStateFilter] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('All Countries');
  const [selectedState, setSelectedState] = useState('All States');
  
  const countries = ['All Countries', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait'];
  const states = {
    'UAE': ['All States', 'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
    'Saudi Arabia': ['All States', 'Riyadh', 'Jeddah', 'Mecca', 'Medina'],
    'Qatar': ['All States', 'Doha', 'Al Rayyan', 'Al Wakrah', 'Al Khor'],
    'Kuwait': ['All States', 'Kuwait City', 'Hawalli', 'Farwaniya', 'Ahmadi']
  };
  
  const outlets = [
    {
      id: 1,
      name: 'Downtown Branch',
      address: '123 Business Bay',
      country: 'UAE',
      state: 'Dubai',
      distance: '1.2 km away',
      hours: 'Open: 9:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=1'
    },
    {
      id: 2,
      name: 'Marina Mall',
      address: '104, 1st Floor, Dubai Marina',
      country: 'UAE',
      state: 'Dubai',
      distance: '3.5 km away',
      hours: 'Open: 10:00 AM - 12:00 AM',
      image: 'https://picsum.photos/300/200?random=2'
    },
    {
      id: 3,
      name: 'Riyadh Park',
      address: 'King Fahd Rd, Riyadh, Saudi Arabia',
      country: 'Saudi Arabia',
      state: 'Riyadh',
      distance: '5.2 km away',
      hours: 'Open: 10:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=3'
    },
    {
      id: 4,
      name: 'Doha Festival City',
      address: 'Al Daayen, Doha, Qatar',
      country: 'Qatar',
      state: 'Doha',
      distance: '2.8 km away',
      hours: 'Open: 10:00 AM - 10:00 PM',
      image: 'https://picsum.photos/300/200?random=4'
    }
  ];

  const products = [
    {
      id: 1,
      name: 'Espresso',
      address: '123 Business Bay',
      country: 'UAE',
      state: 'Dubai',
      distance: '1.2 km away',
      hours: 'Open: 9:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=1'
    },
    {
      id: 2,
      name: 'Americano',
      address: '104, 1st Floor, Dubai Marina',
      country: 'UAE',
      state: 'Dubai',
      distance: '3.5 km away',
      hours: 'Open: 10:00 AM - 12:00 AM',
      image: 'https://picsum.photos/300/200?random=2'
    },
    {
      id: 3,
      name: 'Latte',
      address: 'King Fahd Rd, Riyadh, Saudi Arabia',
      country: 'Saudi Arabia',
      state: 'Riyadh',
      distance: '5.2 km away',
      hours: 'Open: 10:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=3'
    },
    {
      id: 4,
      name: 'Cappuccino',
      address: 'Al Daayen, Doha, Qatar',
      country: 'Qatar',
      state: 'Doha',
      distance: '2.8 km away',
      hours: 'Open: 10:00 AM - 10:00 PM',
      image: 'https://picsum.photos/300/200?random=4'
    }
  ];

  const properties = [
    {
      id: 1,
      name: 'Downtown Branch',
      address: '123 Business Bay',
      country: 'UAE',
      state: 'Dubai',
      distance: '1.2 km away',
      hours: 'Open: 9:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=1'
    },
    {
      id: 2,
      name: 'Marina Mall',
      address: '104, 1st Floor, Dubai Marina',
      country: 'UAE',
      state: 'Dubai',
      distance: '3.5 km away',
      hours: 'Open: 10:00 AM - 12:00 AM',
      image: 'https://picsum.photos/300/200?random=2'
    },
    {
      id: 3,
      name: 'Riyadh Park',
      address: 'King Fahd Rd, Riyadh, Saudi Arabia',
      country: 'Saudi Arabia',
      state: 'Riyadh',
      distance: '5.2 km away',
      hours: 'Open: 10:00 AM - 11:00 PM',
      image: 'https://picsum.photos/300/200?random=3'
    },
    {
      id: 4,
      name: 'Doha Festival City',
      address: 'Al Daayen, Doha, Qatar',
      country: 'Qatar',
      state: 'Doha',
      distance: '2.8 km away',
      hours: 'Open: 10:00 AM - 10:00 PM',
      image: 'https://picsum.photos/300/200?random=4'
    }
  ];
  
  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        outlet.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All Countries' || outlet.country === selectedCountry;
    const matchesState = selectedState === 'All States' || outlet.state === selectedState;
    
    return matchesSearch && matchesCountry && matchesState;
  });

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        property.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All Countries' || property.country === selectedCountry;
    const matchesState = selectedState === 'All States' || property.state === selectedState;
    
    return matchesSearch && matchesCountry && matchesState;
  });

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        product.address.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry = selectedCountry === 'All Countries' || product.country === selectedCountry;
    const matchesState = selectedState === 'All States' || product.state === selectedState;
    
    return matchesSearch && matchesCountry && matchesState;
  });
  
  const totalOutlets = filteredOutlets.length;

  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand Cover Image */}
        <Image 
          source={{ uri: image as string }} 
          style={styles.coverImage}
          resizeMode="cover"
        />
        
        {/* Brand Info */}
        <View style={styles.content}>
          

          <View >

         

          <View>
              <View style={styles.section}>
                <ThemedText style={styles.description}>
                  {title} is a leading {category} franchise with a strong presence in the market. 
                  With a minimum investment of {budget}, you can be part of this successful brand.
                </ThemedText>
              </View>

              <View style={styles.section}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Estimated Annual Returns</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionValue}>50,000 AED</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Franchise Fee</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionValue}>50,000 AED</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Investment</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionValue}>5,000 AED / SQFT</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Royalty</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionValue}>5%</ThemedText>
                </View>
              </View>

              <View style={styles.section}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Outlets</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>97 Outlets</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Products</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>45 Products</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Properties</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>15 Properties</ThemedText>
                </View>
              </View>

              <View style={styles.section}>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>United Arab Emerites</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionValue}>Nationwide</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>India</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>45 Cities</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Saudi Arabia</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>15 Cities</ThemedText>
                </View>
                <View style={{flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <ThemedText type="subtitle" style={styles.sectionTitle}>Oman</ThemedText>
                  <ThemedText type="subtitle" style={styles.sectionButton}>5 Cities</ThemedText>
                </View>
              </View>

              
            </View>
          </View>
          
        </View>
      </ScrollView>
      
    </View>
  );
};

export default OutletPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    position: 'relative',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  outletCard: {
    borderRadius: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  outletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  outletName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  outletDistance: {
    color: '#666',
    fontSize: 14,
  },
  outletAddress: {
    color: '#444',
    marginBottom: 4,
  },
  outletHours: {
    color: '#2ecc71',
    fontSize: 14,
  },
  scrollContent: {
    paddingBottom: 120, // IMPORTANT: Add enough padding so content scrolls above the button
  },
  productsList: {
    marginBottom: 8,
  },
  productItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  productImage: {
    width: 90,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  productDetails: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productName: {
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 8,
  },
  productPrice: {
    fontWeight: '700',
    fontSize: 17,
    marginBottom: 8
  },
  productCategory: {
    color: '#7f8c8d',
    fontSize: 15,
  },
  showMoreButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#eee',
  },
  searchContainer: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    padding: 0,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonText: {
    marginRight: 6,
    fontSize: 14,
    color: '#333',
  },
  outletsList: {
    marginBottom: 20,
    
  },

  outletImage: {
    width: 120,
    height: 70,
    borderRadius: 8,
  },
  outletInfo: {
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  detailsContainer: {
    marginTop: 8,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    color: '#666',
    fontSize: 14,
  },
  detailValue: {
    color: '#333',
    fontWeight: '500',
    fontSize: 14,
  },

  noResultsContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    color: '#999',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 16,
    color: '#333',
  },
  selectedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#000',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  showMoreText: {
    color: '#000',
    fontWeight: '600',
    fontSize: 16,
  },
  // --- Floating Logic ---
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
  },
  button: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  coverImage: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: 96,
    height: 96,
    borderRadius: 12,
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#eee',
  },
  brandTitleContainer: {
    flex: 1,
    textAlign: "center"
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
  },
  brandCategory: {
    color: '#666',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#eee",
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  sectionValue: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  sectionButton: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: "#eee",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },

  productInfo: {
    padding: 12,
  },
  
  description: {
    color: '#444',
    lineHeight: 22,
  },
  contactButton: {
    backgroundColor: '#000',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  contactButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});