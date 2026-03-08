import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function InvestmentDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { brandName, brandCategory, brandDescription, logoColor } = params;

  // --- State ---
  const [ownership, setOwnership] = useState<'Owned' | 'Rented'>('Rented');
  const [area, setArea] = useState('100'); // Default 100 sq ft as per mock
  const [doorNo, setDoorNo] = useState('350');
  const [buildingName, setBuildingName] = useState('Empire State Building');

  // --- Calculations ---
  // Mock Logic: 
  // Franchise Fee = Fixed $5,000
  // Setup Cost = $150 * Area
  // Working Capital = $150 * Area
  const franchiseFee = 5000;
  
  // Safe parsing
  const areaNum = parseInt(area) || 0;
  
  const setupCost = 150 * areaNum;
  const workingCapital = 150 * areaNum;
  const totalInvestment = franchiseFee + setupCost + workingCapital;

  const handleContinue = () => {
    router.push({
      pathname: '/(home)/create/investment-summary',
      params: {
        brandName,
        brandCategory,
        brandDescription,
        logoColor,
        ownership,
        area,
        doorNo,
        buildingName,
        franchiseFee,
        setupCost,
        workingCapital,
        totalInvestment
      }
    });
  };

  const formatCurrency = (val: number) => {
    return '$' + val.toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header (Optional custom header depending on nav setup, 
          but usually we rely on Stack header or custom simple row) */}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Title */}
        <View style={styles.headerTitleRow}>
            <Text style={styles.screenTitle}>Property Ownership</Text>
            
            {/* Toggle Switch Mock */}
            <View style={styles.toggleContainer}>
                <TouchableOpacity 
                    onPress={() => setOwnership('Owned')}
                    style={[styles.toggleBtn, ownership === 'Owned' && styles.toggleBtnActive]}
                >
                    <Text style={[styles.toggleText, ownership === 'Owned' && styles.toggleTextActive]}>Owned</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setOwnership('Rented')}
                    style={[styles.toggleBtn, ownership === 'Rented' && styles.toggleBtnActive]}
                >
                    <Text style={[styles.toggleText, ownership === 'Rented' && styles.toggleTextActive]}>Rented</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Inputs */}
        <View style={styles.inputRow}>
            <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.label}>Area (sq ft)</Text>
                <TextInput 
                    style={styles.input} 
                    value={area}
                    onChangeText={setArea}
                    keyboardType="numeric"
                />
                <Text style={styles.helperText}>Min: 100 sq ft</Text>
            </View>
            
            <View style={{ flex: 1 }}>
                 <Text style={styles.label}>Door Number</Text>
                 <TextInput 
                    style={styles.input} 
                    value={doorNo}
                    onChangeText={setDoorNo}
                />
            </View>
        </View>

        <View style={styles.fullWidthInput}>
             <Text style={styles.label}>Building Name</Text>
             <TextInput 
                style={styles.input} 
                value={buildingName}
                onChangeText={setBuildingName}
            />
        </View>

        {/* Yellow Box Investment Breakdown */}
        <View style={styles.breakdownContainer}>
            <View style={styles.breakdownHeader}>
                <Text style={styles.breakdownTitle}>Carpet Area</Text>
                <Text style={styles.breakdownTitle}>{area} sq ft</Text>
            </View>
            
            <View style={styles.breakdownRowMain}>
                <Text style={styles.rowMainText}>Total Investment Required</Text>
                <Text style={styles.rowMainValue}>{formatCurrency(totalInvestment)}</Text>
            </View>

            <View style={styles.lineItem}>
                <Text style={styles.lineText}>• Franchise Fee (One Time)</Text>
                <Text style={styles.lineValue}>{formatCurrency(franchiseFee)}</Text>
            </View>

            <View style={styles.lineItem}>
                <Text style={styles.lineText}>• Setup Cost ($150 per sqft × {area} sqft)</Text>
                <Text style={styles.lineValue}>{formatCurrency(setupCost)}</Text>
            </View>

             <View style={styles.lineItem}>
                <Text style={styles.lineText}>• Working Capital ($150 per sqft × {area} sqft)</Text>
                <Text style={styles.lineValue}>{formatCurrency(workingCapital)}</Text>
            </View>

            <View style={styles.divider} />
            
            <View style={styles.breakdownRowMain}>
                <Text style={styles.rowMainText}>Total Investment Required</Text>
                <Text style={styles.rowMainValue}>{formatCurrency(totalInvestment)}</Text>
            </View>
        </View>

      </ScrollView>

      {/* Footer Actions */}
      <View style={styles.footer}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft size={20} color="black" />
              <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <ArrowLeft size={20} color="white" style={{ transform: [{ rotate: '180deg' }] }} />
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
  headerTitleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
  },
  screenTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: '#333',
  },
  toggleContainer: {
      flexDirection: 'row',
      backgroundColor: '#E5E7EB',
      borderRadius: 20,
      padding: 2,
  },
  toggleBtn: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 18,
  },
  toggleBtnActive: {
      backgroundColor: 'white',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
  },
  toggleText: {
      fontSize: 14,
      color: '#6B7280',
  },
  toggleTextActive: {
      color: 'black',
      fontWeight: '600',
  },
  inputRow: {
      flexDirection: 'row',
      marginBottom: 16,
  },
  fullWidthInput: {
      marginBottom: 24,
  },
  label: {
      fontSize: 14,
      color: '#4B5563',
      marginBottom: 6,
      fontWeight: '500',
  },
  input: {
      borderWidth: 1,
      borderColor: '#D1D5DB',
      borderRadius: 4,
      padding: 10,
      fontSize: 16,
      color: 'black',
  },
  helperText: {
      fontSize: 12,
      color: '#9CA3AF',
      marginTop: 4,
  },
  // Breakdown Box
  breakdownContainer: {
      backgroundColor: '#FEFCE8', // Light yellow
      borderWidth: 1,
      borderColor: '#FDE047', // Yellow border
      borderRadius: 8,
      padding: 16,
      marginTop: 20,
  },
  breakdownHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: '#FDF08A',
      paddingBottom: 12,
  },
  breakdownTitle: {
      fontSize: 14,
      color: '#4B5563',
  },
  breakdownRowMain: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
      marginTop: 4,
  },
  rowMainText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#4B5563',
  },
  rowMainValue: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#D97706', // Amber/Orange
  },
  lineItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  lineText: {
      fontSize: 14,
      color: '#4B5563',
  },
  lineValue: {
      fontSize: 14,
      color: 'black',
      fontWeight: '500',
  },
  divider: {
      height: 1,
      backgroundColor: '#FDE047',
      marginVertical: 12,
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
  continueButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#D97706', // Matching button color from image
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 4,
  },
  continueButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
      marginRight: 8,
  },
});
