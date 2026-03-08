import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

type ContractCardProps = {
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  title: string;
  subtitle: string;
  duration: string;
  progress?: number;
  status?: 'accepted' | 'rejected' | 'in-progress';
};

const ContractCard: React.FC<ContractCardProps> = ({ 
  image, 
  logo, 
  title, 
  subtitle, 
  duration, 
  progress,
  status 
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'accepted':
        return '#4CAF50'; // Green
      case 'rejected':
        return '#F44336'; // Red
      case 'in-progress':
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Grey
    }
  };

  const [isLiked, setIsLiked] = React.useState(status === 'accepted');

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    // You might want to add a callback here to update the parent component
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={logo} 
          style={styles.image} 
        />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
          {subtitle}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.duration, status && { color: getStatusColor() }]}>
            {duration}
          </Text>
         
        </View>
        {progress !== undefined && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
  },
  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    width: 36,
    height: 36,
    borderRadius: 2,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  logo: {
    width: 28,
    height: 28,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
  },
  duration: {
    fontSize: 13,
    color: '#666',
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});

export default ContractCard;