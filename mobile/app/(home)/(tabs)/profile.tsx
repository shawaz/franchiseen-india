import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Book, Briefcase, Calendar, Menu, Plus, Search, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Mock data
const jobsData = [
  {
    id: '1',
    title: 'Senior Software Engineer',
    company: 'Tech Solutions Inc.',
    duration: '2022 - Present',
    image: { uri: 'https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png' },
  },
  {
    id: '2',
    title: 'Frontend Developer',
    company: 'Digital Creations',
    duration: '2020 - 2022',
    image: {uri: 'https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png'},
  },
];

const coursesData = [
  {
    id: '1',
    title: 'Advanced React Native',
    institution: 'Udemy',
    duration: 'Completed 2023',
    image: {uri: 'https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png'},
  },
  {
    id: '2',
    title: 'UI/UX Design Masterclass',
    institution: 'Coursera',
    duration: 'In Progress',
    image: { uri: 'https://b.zmtcdn.com/web_assets/81f3ff974d82520780078ba1cfbd453a1583259680.png' },
  },
];

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

const ProfileScreen = () => {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = Colors[colorScheme as keyof typeof Colors] || Colors.light;
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);


  const filteredOutlets = outlets.filter(outlet => {
    const matchesSearch = outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        outlet.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const { 
      id, 
      title = '', 
      budget = '', 
      earnings = '', 
      category = '',
      image = '',
      logo = ''
    } = useLocalSearchParams();

  const handleOutletPress = (outlet: any) => {
    router.push({
      pathname: '/(home)/brand/outlet/[id]',
      params: {
        id: outlet.id,
        title: title,
        budget: budget,
        earnings: '',
        category: category,
        image: outlet.image,
        logo: logo
      }
    } as any);
  };

  return (
    <ThemedView style={styles.container}>
      {/* Fixed Header */}
      <ThemedView style={[styles.appBar, { backgroundColor: theme.background }]}>
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={styles.appBarContent}>
            <ThemedText type="subtitle" style={styles.title}>ACCOUNT</ThemedText>
            <TouchableOpacity onPress={() => router.push('/dashboard')}>
              <Menu size={24} color={theme.text} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ThemedView>
      
      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContent}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.ctfassets.net/lh3zuq09vnm2/yBDals8aU8RWtb0xLnPkI/19b391bda8f43e16e64d40b55561e5cd/How_tracking_user_behavior_on_your_website_can_improve_customer_experience.png' }}
                style={styles.avatar}
              />
            </View>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.tint }]}
              onPress={() => router.push('/dashboard')}
            >
              <ThemedText style={styles.actionButtonText}>VIEW DASHBOARD</ThemedText>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <ThemedText style={styles.name}>Muhammed Shayan</ThemedText>
          <ThemedText style={styles.location}>34 Outlets • Bfj6...JHef</ThemedText>
        </View>

        
         <View style={styles.section}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color="#666" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search outlets..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#999"
            />
          </View>
          
          {/* Outlets List */}
          <View style={styles.outletsList}>
            {filteredOutlets.length > 0 ? (
              filteredOutlets.map((outlet) => (
                <TouchableOpacity 
                  key={outlet.id} 
                  style={styles.outletCard}
                  onPress={() => handleOutletPress(outlet)}
                >
                  <Image 
                    source={{ uri: outlet.image }} 
                    style={styles.outletImage}
                    resizeMode="cover"
                  />
                  
                  <View style={styles.outletInfo}>
                    <ThemedText style={styles.outletName}>{outlet.name}</ThemedText>
                      <ThemedText style={styles.outletAddress}>{outlet.address}</ThemedText>
                      <ThemedText style={styles.outletAddress}>{outlet.state} • {outlet.country}</ThemedText>
                      {/* <ThemedText style={styles.outletHours}>{outlet.hours}</ThemedText> */}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.noResultsContainer}>
                <ThemedText style={styles.noResultsText}>No outlets found</ThemedText>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Upload Resume Modal */}
      <Modal
        visible={showUploadModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowUploadModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>UPLOAD RESUME</ThemedText>
              <TouchableOpacity onPress={() => setShowUploadModal(false)}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={[styles.uploadOption, { borderBottomColor: theme.border }]}
              onPress={() => {
                setShowUploadModal(false);
                router.push('/(home)/upload?type=job');
              }}
            >
              <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                <Briefcase size={24} color={theme.text} />
                <ThemedText style={styles.uploadOptionText}>JOB</ThemedText>
              </View>
              <Plus />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadOption, { borderBottomColor: theme.border }]}
              onPress={() => {
                setShowUploadModal(false);
                router.push('/(home)/upload?type=course');
              }}
            >
              <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                <Book size={24} color={theme.text} />
                <ThemedText style={styles.uploadOptionText}>COURSE</ThemedText>
              </View>
              <Plus />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.uploadOption, { borderBottomWidth: 0 }]}
              onPress={() => {
                setShowUploadModal(false);
                // Handle event registration
              }}
            >
              <View style={{flex: 1, flexDirection: "row", alignItems: "center"}}>
                <Calendar size={24} color={theme.text} />
              <ThemedText style={styles.uploadOptionText}>EVENT</ThemedText>
              </View>
              <Plus />
              
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    width: '100%',
  },
  appBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 45,
    backgroundColor: "#f2f2f2"
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
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
  },
  appBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  scrollView: {
    flex: 1,
    marginTop: 60, // Height of the appBar
  },
  scrollViewContent: {
    paddingBottom: 20,
    paddingTop: 50,
  },
  headerContent: {
    padding: 20,
    paddingTop: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 50,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  profileInfo: {
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  location: {
    color: '#666',
    marginBottom: 3,
  },
  tabContainer: {
    flexDirection: 'row',
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: "#eee"
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabContent: {
    padding: 15,
  },
  section: {
    marginBottom: 20,
    padding: 16
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  talentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  talentImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
  },
  talentContent: {
    padding: 15,
  },
  talentTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  talentCategory: {
    color: '#666',
    marginBottom: 15,
  },
  talentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#666',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 50,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    marginRight: 10,
    marginTop: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  uploadOption: {
    padding: 20,
    backgroundColor: "#f2f2f2",
    borderRadius: 5,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  uploadOptionText: {
    marginLeft: 20,
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default ProfileScreen;