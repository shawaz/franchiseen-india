import { useLocalSearchParams } from 'expo-router';
import { Calendar, Check, Clock, Lock, MessageCircle } from 'lucide-react-native';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DealDetailScreen = () => {
  const { id } = useLocalSearchParams();
  
  // In a real app, you would fetch the deal details by ID
  const deal = {
    id: '1',
    title: 'Subway Franchise #402',
    company: 'Subway',
    amount: '$150k',
    progress: 0.4,
    phase: 2,
    totalPhases: 5,
    status: 'On Track',
    appliedDate: 'Oct 10, 2023',
    deadline: 'Oct 24, 2023',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Subway_Logo_2009.svg/1280px-Subway_Logo_2009.svg.png'
  };

  const phases = [
    { id: 1, title: 'Initial Deposit', status: 'completed', date: 'Oct 12, 2023', transactionId: '#883920' },
    { id: 2, title: 'Location Confirmation', status: 'current', description: 'Please review the site survey and upload the signed lease agreement for the proposed location at 123 Market St.', location: 'Seattle, WA' },
    { id: 3, title: 'Store Setup & Buildout', status: 'upcoming' },
    { id: 4, title: 'Grand Launch', status: 'upcoming' },
  ];

  return (
    <View style={styles.container}>

      <ScrollView style={styles.scrollView}>
        {/* Active Deal Card */}
        <View style={styles.activeDealCard}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>ACTIVE DEAL</Text>
            <View style={[styles.statusPill, styles.onTrackPill]}>
              <Text style={styles.statusPillText}>{deal.status}</Text>
            </View>
          </View>
          
          <View style={styles.dealHeader}>
            <View>
              <Text style={styles.dealTitle}>{deal.title}</Text>
              <Text style={styles.dealAmount}>Total Investment: {deal.amount}</Text>
            </View>
            <Image source={{ uri: deal.logo }} style={styles.dealLogo} />
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${deal.progress * 100}%` }]} />
            </View>
            <Text style={styles.progressText}>Phase {deal.phase} of {deal.totalPhases} • {Math.round(deal.progress * 100)}% Complete</Text>
          </View>
        </View>

        {/* Timeline Cards */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineCard}>
            <Clock size={20} color="#666" />
            <Text style={styles.timelineLabel}>ELAPSED</Text>
            <Text style={styles.timelineValue}>14 Days</Text>
          </View>
          <View style={styles.timelineCard}>
            <Calendar size={20} color="#666" />
            <Text style={styles.timelineLabel}>DEADLINE</Text>
            <Text style={styles.timelineValue}>{deal.deadline}</Text>
          </View>
        </View>

        {/* Deal Roadmap */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Deal Roadmap</Text>
          
          {phases.map((phase) => (
            <View key={phase.id} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <View style={styles.phaseIndicator}>
                  {phase.status === 'completed' ? (
                    <View style={[styles.phaseIcon, styles.completedIcon]}>
                      <Check size={16} color="#fff" />
                    </View>
                  ) : phase.status === 'current' ? (
                    <View style={[styles.phaseIcon, styles.currentIcon]}>
                      <Text style={styles.phaseNumber}>{phase.id}</Text>
                    </View>
                  ) : (
                    <View style={[styles.phaseIcon, styles.upcomingIcon]}>
                      <Lock size={16} color="#666" />
                    </View>
                  )}
                  <Text style={[
                    styles.phaseTitle,
                    phase.status === 'current' && styles.currentPhaseTitle,
                    phase.status === 'completed' && styles.completedPhaseTitle
                  ]}>
                    {phase.title}
                  </Text>
                </View>
                {phase.status === 'completed' && (
                  <Text style={styles.completedText}>Completed</Text>
                )}
              </View>

              {phase.status === 'completed' && phase.transactionId && (
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseDescription}>Paid</Text>
                  <Text style={styles.phaseMeta}>Transaction ID: {phase.transactionId} • {phase.date}</Text>
                  <TouchableOpacity style={styles.linkButton}>
                    <Text style={styles.linkText}>View Receipt</Text>
                  </TouchableOpacity>
                </View>
              )}

              {phase.status === 'current' && (
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseDescription}>{phase.description}</Text>
                  <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>{phase.location}</Text>
                  </View>
                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={[styles.actionButton, styles.primaryButton]}>
                      <Text style={styles.primaryButtonText}>Upload Lease Agreement</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.secondaryButton]}>
                      <Text style={styles.secondaryButtonText}>Contact Landlord</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {phase.status === 'upcoming' && (
                <View style={styles.phaseContent}>
                  <Text style={styles.phaseDescription}>Awaiting previous step</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Assistance Card */}
        <View style={styles.assistanceCard}>
          <View>
            <Text style={styles.assistanceTitle}>Need assistance?</Text>
            <Text style={styles.assistanceText}>Talk to your franchise consultant</Text>
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <MessageCircle size={20} color="#fff" />
            <Text style={styles.chatButtonText}>Chat Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 16,
  },
  activeDealCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  onTrackPill: {
    backgroundColor: '#e6f7ee',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  dealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dealTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  dealAmount: {
    fontSize: 14,
    color: '#666',
  },
  dealLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
  },
  timelineContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timelineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: "#eee"
  },
  timelineLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  timelineValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  phaseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  phaseIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  completedIcon: {
    backgroundColor: '#10b981',
  },
  currentIcon: {
    backgroundColor: '#3b82f6',
  },
  upcomingIcon: {
    backgroundColor: '#e5e7eb',
  },
  phaseNumber: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  currentPhaseTitle: {
    color: '#000',
    fontWeight: '600',
  },
  completedPhaseTitle: {
    color: '#10b981',
  },
  completedText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  phaseContent: {
    marginLeft: 32,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  phaseMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 8,
  },
  linkButton: {
    alignSelf: 'flex-start',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
    fontWeight: '500',
  },
  mapPlaceholder: {
    height: 100,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  mapText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
  },
  secondaryButtonText: {
    color: '#374151',
    fontWeight: '500',
    fontSize: 14,
  },
  assistanceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  assistanceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  assistanceText: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  chatButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 14,
    marginLeft: 8,
  },
});

export default DealDetailScreen;