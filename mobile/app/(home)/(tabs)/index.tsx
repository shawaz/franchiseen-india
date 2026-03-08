import FeedCard from '@/components/FeedCard';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { brandData } from '@/data/brand-data';
import { Search } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  Platform,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const propData = [
  {
    id: 'cat1',
    category: 'Food - QSR',
    items: [
      {
        id: '1',
        title: 'Subway',
        budget: '20K AED',
        earnings: 2,
        category: 'Food - QSR',
        image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx3ABBSYuHV1uk3ykgyz5XBzp9oRpM-Lgcfg&s' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
      },
      {
        id: '2',
        title: 'McDonalds',
        budget: '25K AED',
        earnings: 3,
        category: 'Food - QSR',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
      },
      {
        id: '3',
        title: 'Burger King',
        budget: '22K AED',
        earnings: 2,
        category: 'Food - QSR',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
    ],
  },
  {
    id: 'cat2',
    category: 'Café & Bakery',
    items: [
      {
        id: '4',
        title: 'Starbucks',
        budget: '30K AED',
        earnings: 4,
        category: 'Café & Bakery',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
      {
        id: '5',
        title: 'Costa Coffee',
        budget: '28K AED',
        earnings: 3,
        category: 'Café & Bakery',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Costa_Coffee_Logo.svg/1200px-Costa_Coffee_Logo.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
    ],
  },
];

const saleData = [
  {
    id: 'cat1',
    category: 'Food - QSR',
    items: [
      {
        id: '1',
        title: 'Subway',
        budget: '20K AED',
        earnings: 2,
        category: 'Food - QSR',
        image: { uri: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQx3ABBSYuHV1uk3ykgyz5XBzp9oRpM-Lgcfg&s' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
      {
        id: '2',
        title: 'McDonalds',
        budget: '25K AED',
        earnings: 3,
        category: 'Food - QSR',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
      {
        id: '3',
        title: 'Burger King',
        budget: '22K AED',
        earnings: 2,
        category: 'Food - QSR',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Burger_King_logo_%281999%29.svg/2024px-Burger_King_logo_%281999%29.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
      },
    ],
  },
  {
    id: 'cat2',
    category: 'Café & Bakery',
    items: [
      {
        id: '4',
        title: 'Starbucks',
        budget: '30K AED',
        earnings: 4,
        category: 'Café & Bakery',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d3/Starbucks_Corporation_Logo_2011.svg/1200px-Starbucks_Corporation_Logo_2011.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },
      },
      {
        id: '5',
        title: 'Costa Coffee',
        budget: '28K AED',
        earnings: 3,
        category: 'Café & Bakery',
        image: { uri: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/5f/Costa_Coffee_Logo.svg/1200px-Costa_Coffee_Logo.svg.png' },
        logo: { uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/McDonald%27s_Golden_Arches.svg/1200px-McDonald%27s_Golden_Arches.svg.png' },

      },
    ],
  },
];

const { width } = Dimensions.get('window');

type TabType = 'brands' | 'properties' | 'forSale';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabType>('brands');

  const containerStyle: StyleProp<ViewStyle> = [styles.container, { paddingTop: insets.top }];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'brands':
        return (
         <FlatList
            data={brandData}
            keyExtractor={(item, index) => `category-${index}`}
            contentContainerStyle={styles.verticalList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionContainer}>
                <Image 
                  source={require("@/assets/images/cover.png")}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>
            }
            renderItem={({ item: category }) => (
                <View style={styles.categoryContainer} key={category.category}>
                  <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                      {category.category}
                    </ThemedText>
                    <TouchableOpacity>
                      <ThemedText style={styles.seeAllText} type="defaultSemiBold">
                        VIEW ALL
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={category.items}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                                            <FeedCard item={item} />

                    )}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  />
                </View>
              )}
          />
        );
      case 'properties':
        return (
          <FlatList
            data={propData}
            keyExtractor={(item, index) => `category-${index}`}
            contentContainerStyle={styles.verticalList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionContainer}>
                <Image 
                  source={require("@/assets/images/cover.png")}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>
            }
            renderItem={({ item: category }) => (
                <View style={styles.categoryContainer} key={category.category}>
                  <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                      {category.category}
                    </ThemedText>
                    <TouchableOpacity>
                      <ThemedText style={styles.seeAllText} type="defaultSemiBold">
                        See all
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={category.items}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                                            <FeedCard item={item} />

                    )}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  />
                </View>
              )}
          />
        );
        case 'forSale':
    return (
    <FlatList
            data={saleData}
            keyExtractor={(item, index) => `category-${index}`}
            contentContainerStyle={styles.verticalList}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={
              <View style={styles.sectionContainer}>
                <Image 
                  source={require("@/assets/images/cover.png")}
                  style={styles.coverImage}
                  resizeMode="cover"
                />
              </View>
            }
            renderItem={({ item: category }) => (
                <View style={styles.categoryContainer} key={category.category}>
                  <View style={styles.sectionHeader}>
                    <ThemedText type="subtitle" style={styles.sectionTitle}>
                      {category.category}
                    </ThemedText>
                    <TouchableOpacity>
                      <ThemedText style={styles.seeAllText} type="defaultSemiBold">
                        See all
                      </ThemedText>
                    </TouchableOpacity>
                  </View>
                  
                  <FlatList
                    data={category.items}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                    renderItem={({ item }) => (
                      <FeedCard item={item} />
                    )}
                    keyExtractor={(item) => item.id}
                    ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
                  />
                </View>
              )}
          />
  );

      default:
        return null;
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.appBar, { paddingTop: insets.top }]}>
        <View style={styles.appBarTop}>
          <Image
            source={require('@/assets/icons/ios-light.png')}
            style={styles.logoImage}
          />
          <View style={styles.searchContainer}>
            <ThemedText style={styles.titleText}>FRANCHISEEN</ThemedText>
            
          </View>
          <TouchableOpacity
            style={styles.appBarButton}
          >
            <Search size={20} color="#000" />
            <ThemedText style={styles.searchText}>SEARCH</ThemedText>
          </TouchableOpacity>
        </View>
        
        {/* Tabs */}
        {/* <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'brands' && styles.activeTab]}
            onPress={() => setActiveTab('brands')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'brands' && styles.activeTabText]}>
              Brands
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'forSale' && styles.activeTab]}
            onPress={() => setActiveTab('forSale')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'forSale' && styles.activeTabText]}>
              For Sale
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'properties' && styles.activeTab]}
            onPress={() => setActiveTab('properties')}
          >
            <ThemedText style={[styles.tabText, activeTab === 'properties' && styles.activeTabText]}>
              Properties
            </ThemedText>
          </TouchableOpacity>
        </View> */}
      </View>
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        {renderTabContent()}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  // Header styles
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
  appBar: {
    width: '100%',
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  appBarTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  appBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    padding: 10,
    borderRadius: 50,
  },
  searchText: {
    marginHorizontal: 8,
    fontSize: 14,
    fontWeight: "700"
  },
   coverImage: {
    width: '100%',
    height: 250,
    marginBottom: 16,
  },
  
  // Tab styles
  tabContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    height: 4,
    backgroundColor: '#000',
    borderRadius: 3,
  },
  logoImage: {
    width: 45,
    height: 45,
    borderRadius: 4,
  },
  

  
  
  // Layout styles
  verticalList: {
    paddingBottom: 100, // Extra padding at the bottom for better scrolling
  },
  categoryContainer: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '700',
    borderColor: "#eee",
    backgroundColor: "#eee",
    borderWidth: 2,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 50
  },
  horizontalList: {
    paddingHorizontal: 16,
  },
  locationText: {
    marginLeft: 8,
    marginRight: 16,
    fontSize: 16,
  },
  titleText: {
    marginLeft: 8,
    marginRight: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  iconsContainer: {
    marginLeft: 'auto',
  },
  iconButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#e0e0e0',
    borderWidth: 1,
    backgroundColor: '#f5f5f5',
  },
  sectionContainer: {
    marginBottom: 8,
  },
  bannerContainer: {
    width: width - 32,
    height: 200,
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    resizeMode: 'cover',
  },
  categoryImage: {
    width: 130,
    height: 130,
    resizeMode: 'cover',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  categoriesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  categoryItem: {
    width: '33%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    width: 130,
    height: 130,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryEmoji: {
    fontSize: 24,
    height: '100%',
  },
  featuredBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF385C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  saleDetails: {
    padding: 12,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  saleTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  saleLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  saleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  saleType: {
    fontSize: 12,
    color: '#666',
  },
  saleSize: {
    fontSize: 12,
    color: '#666',
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
    // Removed unused styles
});
