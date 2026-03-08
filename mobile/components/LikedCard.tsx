import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type LikedCardProps = {
  image: ImageSourcePropType;
  logo?: ImageSourcePropType;
  title: string;
  subtitle: string;
  category: string;
  isLiked: boolean;
  onLikePress: () => void;
};

const LikedCard: React.FC<LikedCardProps> = ({ 
  image, 
  logo, 
  title, 
  subtitle, 
  category,
  isLiked,
  onLikePress
}) => {
  const router = useRouter();
  
  const handlePress = () => {
    router.push({
      pathname: '/(home)/brand/[id]',
      params: { 
        id: title.toLowerCase().replace(/\s+/g, '-'),
        title: title,
        budget: subtitle.split(' • ')[1],
        earnings: '',
        category: category,
        image: typeof image === 'object' && 'uri' in image ? image.uri : '',
        logo: typeof logo === 'object' && 'uri' in logo ? logo.uri : ''
      }
    });
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={logo} 
          style={styles.image} 
          // defaultSource={require('@/assets/images/placeholder-logo.png')}
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
          <Text style={styles.category}>{category}</Text>
          <TouchableOpacity onPress={onLikePress} style={styles.heartButton}>
            <Heart 
              size={24} 
              fill={isLiked ? '#FF3B30' : 'transparent'} 
              color={isLiked ? '#FF3B30' : '#666'}
            />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 80,
    height: 80,
    marginRight: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  category: {
    fontSize: 15,
    color: '#888',
  },
  heartButton: {
    padding: 4,
  },
});

export default LikedCard;