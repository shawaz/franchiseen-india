import { useRouter } from 'expo-router';
import { ArrowLeft, ChevronsUpDown, Image as ImageIcon } from 'lucide-react-native';
import React from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

export default function PropertyCreateScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Main Image Area */}
        <View style={styles.mainImagePlaceholder}>
          <ImageIcon size={64} color="#333" />
        </View>
        <View style={styles.mainLabelContainer}>
           <Text style={styles.mainLabelText}>MAIN</Text>
        </View>

        {/* Gallery Carousel */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
           <TouchableOpacity style={styles.carouselItem}>
              <ArrowLeft size={20} color="black" style={{ transform: [{ rotate: '180deg' }] }} />
           </TouchableOpacity>
           
           <View style={styles.carouselImageContainer}>
              <View style={styles.carouselImagePlaceholder}>
                  <ImageIcon size={32} color="#666" />
              </View>
              <View style={styles.carouselLabelBar}>
                  <Text style={styles.carouselLabelText}>MAIN</Text>
              </View>
           </View>

           <View style={styles.carouselImageContainer}>
              <View style={styles.carouselImagePlaceholder}>
                  <ImageIcon size={32} color="#666" />
              </View>
              <View style={styles.carouselLabelBar}>
                  <Text style={styles.carouselLabelText}>LOBBY</Text>
                  <Text style={styles.carouselLabelText}>01</Text>
              </View>
           </View>

           <View style={styles.carouselImageContainer}>
              <View style={styles.carouselImagePlaceholder}>
                  <ImageIcon size={32} color="#666" />
              </View>
              <View style={styles.carouselLabelBar}>
                  <Text style={styles.carouselLabelText}>LOBBY</Text>
              </View>
           </View>
        </ScrollView>

        <View style={styles.divider} />

        {/* Form Fields */}
        <View style={styles.formContainer}>
            
            {/* Property Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Property Name</Text>
                <View style={styles.inputWrapper}>
                    <TextInput 
                        style={styles.textInput} 
                        placeholder="Burj Kalifa" 
                        placeholderTextColor="black"
                        defaultValue="Burj Kalifa"
                    />
                    <ChevronsUpDown size={20} color="#ccc" />
                </View>
            </View>

            {/* Row: Door No & Floor No */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Door No</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="505" 
                            placeholderTextColor="black"
                            defaultValue="505"
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>Floor No</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="08" 
                            placeholderTextColor="black"
                            defaultValue="08"
                        />
                    </View>
                </View>
            </View>

            {/* Row: Annual Rent & Carpet Area */}
            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <View style={styles.labelRow}>
                        <Text style={styles.inputLabel}>Annual Rent</Text>
                        <Text style={styles.inputLabelSmall}>Dirams</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="1,500,000" 
                            placeholderTextColor="black"
                            defaultValue="1,500,000"
                        />
                        <Text style={{ fontSize: 18, color: '#999', fontWeight: 'bold' }}>AED</Text>
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <View style={styles.labelRow}>
                        <Text style={styles.inputLabel}>Carpet Area</Text>
                        <Text style={styles.inputLabelSmall}>3245/sqft</Text>
                    </View>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="500" 
                            placeholderTextColor="black"
                            defaultValue="500"
                        />
                        <Text style={{ fontSize: 14, color: '#999' }}>SQFT</Text>
                    </View>
                </View>
            </View>

             {/* Row: Payment Interval & Property Type */}
             <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.inputLabel}>Payment Interval</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="Monthly" 
                            placeholderTextColor="black"
                            defaultValue="Monthly"
                            editable={false}
                        />
                         <ChevronsUpDown size={20} color="#ccc" />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                    <Text style={styles.inputLabel}>Property Type</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput 
                            style={styles.textInput} 
                            placeholder="Commercial" 
                            placeholderTextColor="black"
                            defaultValue="Commercial"
                            editable={false}
                        />
                         <ChevronsUpDown size={20} color="#ccc" />
                    </View>
                </View>
            </View>

        </View>

        {/* Bottom Button */}
        <TouchableOpacity style={styles.selectButton}>
            <Text style={styles.selectButtonText}>SELECT FRANCHISE</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 5,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  sectionSubLabel: {
      fontSize: 14,
      fontWeight: 'bold',
      marginTop: 2,
  },
  manageButton: {
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 16,
  },
  manageButtonText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  mainImagePlaceholder: {
    height: 200,
    backgroundColor: '#333',
    marginHorizontal: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainLabelContainer: {
      backgroundColor: '#1a1a1a', 
      paddingVertical: 10, 
      paddingHorizontal: 20
  },
  mainLabelText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 14,
  },
  carousel: {
      marginTop: 20,
      paddingLeft: 10,
      paddingBottom: 20,
  },
  carouselItem: {
      width: 40,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 10,
  },
  carouselImageContainer: {
      width: 120,
      height: 90,
      marginRight: 10,
      backgroundColor: '#333',
  },
  carouselImagePlaceholder: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
  },
  carouselLabelBar: {
      backgroundColor: '#1a1a1a',
      paddingVertical: 4,
      paddingHorizontal: 8,
      flexDirection: 'row',
      justifyContent: 'space-between'
  },
  carouselLabelText: {
      color: 'white',
      fontSize: 10,
      fontWeight: 'bold',
  },
  divider: {
      height: 1,
      backgroundColor: '#F3F4F6', // Light gray
      marginVertical: 10,
  },
  formContainer: {
      paddingHorizontal: 20,
      paddingTop: 10,
  },
  row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
  },
  inputGroup: {
      backgroundColor: '#F9FAFB', // Very light gray background
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
  },
  inputLabel: {
      fontSize: 12,
      color: '#6B7280', // Gray text
      marginBottom: 4,
  },
  inputLabelSmall: {
      fontSize: 10,
      color: '#9CA3AF',
  },
  labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 4,
  },
  inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  textInput: {
      fontSize: 16,
      fontWeight: '600',
      color: 'black',
      flex: 1,
      padding: 0, 
  },
  selectButton: {
      backgroundColor: 'black',
      marginHorizontal: 20,
      marginVertical: 20,
      paddingVertical: 18,
      borderRadius: 30,
      alignItems: 'center',
  },
  selectButtonText: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: 16,
  }
});
