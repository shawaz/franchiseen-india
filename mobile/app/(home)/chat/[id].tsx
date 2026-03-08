import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


// Extend the Message type to support images
type MessageType = 'text' | 'image';

interface MessageBase {
  id: string;
  type: MessageType;
  sender: 'user' | 'other';
  timestamp: Date;
}

interface TextMessage extends MessageBase {
  type: 'text';
  text: string;
}

interface ImageMessage extends MessageBase {
  type: 'image';
  uri: string;
  width: number;
  height: number;
}

type Message = TextMessage | ImageMessage;

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme as keyof typeof Colors] || Colors.light;
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const navigation = useNavigation();

  // Set header options
  useEffect(() => {
    navigation.setOptions({
      headerTitle: 'Chat',
      headerBackTitle: 'Back',
      headerTintColor: theme.tint,
    });
  }, [navigation, theme]);

  // Mock data - replace with actual data fetching
  useEffect(() => {
    const fetchMessages = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockMessages: Message[] = [
        {
          id: '1',
          type: 'text',
          text: 'Hi there! How can I help you today?',
          sender: 'other',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          type: 'image',
          uri: 'https://images.unsplash.com/photo-1575936123452-b67c3203c357?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
          width: 1200,
          height: 800,
          sender: 'other',
          timestamp: new Date(Date.now() - 3500000)
        },
        {
          id: '3',
          type: 'text',
          text: 'I need help with my application',
          sender: 'user',
          timestamp: new Date(Date.now() - 1800000)
        },
      ];
      
      setMessages(mockMessages);
      setIsLoading(false);
    };

    fetchMessages();
  }, [id]);


  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  const handleSend = useCallback(() => {
    if (!message.trim() && !selectedImage) return;
    
    const newMessages: Message[] = [];
    
    if (selectedImage) {
      // Add image message
      newMessages.push({
        id: `img-${Date.now()}`,
        type: 'image',
        uri: selectedImage,
        width: 1200, // Default dimensions, in a real app you'd get these from the image
        height: 800,
        sender: 'user',
        timestamp: new Date()
      } as ImageMessage);
    }
    
    if (message.trim()) {
      // Add text message if there's text
      newMessages.push({
        id: `txt-${Date.now()}`,
        type: 'text',
        text: message,
        sender: 'user',
        timestamp: new Date()
      } as TextMessage);
    }
    
    setMessages(prev => [...prev, ...newMessages]);
    setMessage('');
    setSelectedImage(null);
    
    // Auto-scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [message, selectedImage]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isUser = item.sender === 'user';
    const messageStyle = isUser ? styles.userMessage : styles.otherMessage;
    
    return (
      <View style={[
        styles.messageContainer,
        isUser ? styles.userContainer : styles.otherContainer
      ]}>
        <View style={[styles.messageBubble, messageStyle]}>
          {item.type === 'image' ? (
            <Image 
              source={{ uri: item.uri }} 
              style={[
                styles.imageMessage,
                { 
                  aspectRatio: item.width / item.height,
                  maxWidth: '100%',
                  borderRadius: 12
                }
              ]} 
              resizeMode="cover"
            />
          ) : (
            <ThemedText style={styles.messageText}>{item.text}</ThemedText>
          )}
          <ThemedText style={styles.timestamp}>
            {formatTime(item.timestamp)}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      
      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
        renderItem={renderMessageItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText>No messages yet. Start the conversation!</ThemedText>
          </View>
        }
      />

      {/* Selected Image Preview */}
      {selectedImage && (
        <View style={styles.selectedImageContainer}>
          <Image 
            source={{ uri: selectedImage }} 
            style={styles.selectedImage} 
            resizeMode="cover"
          />
          <TouchableOpacity 
            style={styles.removeImageButton}
            onPress={removeSelectedImage}
          >
            <X size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Area */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.inputContainer, { backgroundColor: theme.background }]}
        keyboardVerticalOffset={Platform.select({ ios: 135, android: 0 })}
      >
        <TouchableOpacity 
          style={[styles.mediaButton, { borderColor: theme.icon }]}
          onPress={() => {}}
        >
          <ImageIcon size={24} color={theme.icon} />
        </TouchableOpacity>
        
        <TextInput
          style={[styles.input, { 
            color: theme.text, 
            backgroundColor: theme.background === '#fff' ? '#f5f5f5' : '#1e1e1e',
            borderColor: theme.icon 
          }]}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
          placeholderTextColor={theme.icon}
          multiline
        />
        
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            { 
              backgroundColor: message.trim() || selectedImage ? theme.tint : '#ccc',
              opacity: message.trim() || selectedImage ? 1 : 0.5
            }
          ]}
          onPress={handleSend}
          disabled={!message.trim() && !selectedImage}
        >
          <Send size={20} color="#fff" />
        </TouchableOpacity>
      </KeyboardAvoidingView>
      
      {/* Bottom safe area for devices with notches/homescreen indicators */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: theme.background }} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 8,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#0084FF',
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: '#E9E9EB',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  imageMessage: {
    borderRadius: 12,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  mediaButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedImageContainer: {
    margin: 12,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  selectedImage: {
    width: 150,
    height: 150,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
