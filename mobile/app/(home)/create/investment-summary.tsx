import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Utensils } from 'lucide-react-native';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function InvestmentSummaryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { 
    brandName, brandCategory, brandDescription, logoColor,
    area, doorNo, buildingName,
    franchiseFee, setupCost, workingCapital, totalInvestment
  } = params;

  const handleCreateFranchise = () => {
    // Navigate home or show success
    // For now, go back to Tabs
    router.push('/(home)/(tabs)');
  };

  const formatCurrency = (val: string | string[]) => {
    // Params come as strings usually
    const num = Number(val);
    return isNaN(num) ? val : '$' + num.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Brand Card Header */}
        <View style={styles.brandCard}>
             <View style={[styles.logoContainer, { backgroundColor: (logoColor as string) || '#333' }]}>
                <Utensils size={32} color="white" />
             </View>
             <View style={{ flex: 1 }}>
                 <Text style={styles.brandName}>{brandName}</Text>
                 <Text style={styles.brandDesc}>
                    {brandDescription} • {brandCategory}
                 </Text>
             </View>
        </View>

        <View style={styles.divider} />

        {/* Property Info */}
        <Text style={styles.sectionTitle}>Property Information</Text>
        
        <View style={styles.infoRow}>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Carpet Area</Text>
                <Text style={styles.infoValue}>{area} sq ft</Text>
            </View>
            <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Door Number</Text>
                <Text style={styles.infoValue}>{doorNo}</Text>
            </View>
             <View style={{ flex: 1 }}>
                <Text style={styles.infoLabel}>Building</Text>
                <Text style={styles.infoValue}>{buildingName}</Text>
            </View>
        </View>
        
        <View style={styles.infoBlock}>
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>South Ridge Tower 2 - Burj Khalifa - Downtown Dubai - Dubai - United Arab Emirates</Text>
        </View>

        <View style={styles.divider} />

        {/* Investment Breakdown */}
        <Text style={styles.sectionTitle}>Investment Breakdown</Text>
        
        <View style={styles.lineItem}>
            <Text style={styles.lineText}>Franchise Fee (One Time)</Text>
            <Text style={styles.lineValue}>{formatCurrency(franchiseFee)}</Text>
        </View>
        <View style={styles.lineItem}>
            <Text style={styles.lineText}>Setup Cost ($150 per sqft × {area} sqft)</Text>
            <Text style={styles.lineValue}>{formatCurrency(setupCost)}</Text>
        </View>
        <View style={styles.lineItem}>
            <Text style={styles.lineText}>Working Capital ($150 per sqft × {area} sqft)</Text>
            <Text style={styles.lineValue}>{formatCurrency(workingCapital)}</Text>
        </View>

        <View style={styles.dividerYellow} />
        
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Investment Required</Text>
            <Text style={styles.totalValue}>{formatCurrency(totalInvestment)}</Text>
        </View>

      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="black" />
              <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.createButton} onPress={handleCreateFranchise}>
              <Text style={styles.createButtonText}>Create Franchise</Text>
          </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
      padding: 20,
      paddingBottom: 100,
  },
  brandCard: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
  },
  logoContainer: {
      width: 50, 
      height: 50,
      borderRadius: 4,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
  },
  brandName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'black',
  },
  brandDesc: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 2,
  },
  divider: {
      height: 1,
      backgroundColor: '#E5E7EB',
      marginVertical: 20,
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: 'black',
      marginBottom: 16,
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
  },
  infoBlock: {
      marginBottom: 16,
  },
  infoLabel: {
      fontSize: 12,
      color: '#6B7280',
      marginBottom: 4,
  },
  infoValue: {
      fontSize: 14,
      fontWeight: '500',
      color: 'black',
  },
  // Breakdown
  lineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
  },
  lineText: {
      fontSize: 14,
      color: '#4B5563',
  },
  lineValue: {
      fontSize: 14,
      fontWeight: '600',
      color: 'black',
  },
  dividerYellow: {
      height: 1,
      backgroundColor: '#FDE047', // Yellow line from image
      marginVertical: 16,
  },
  totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
  },
  totalLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#1F2937', 
  },
  totalValue: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#D97706', // Amber/Orange
  },
  // Footer
  footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: 'white',
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
  },
  backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 10,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: 4,
  },
  backButtonText: {
      marginLeft: 6,
      fontWeight: '600',
      color: 'black',
  },
  createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#10B981', // Green
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 4,
  },
  createButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  },
});
