// app/(home)/_layout.tsx
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { Text, View } from 'react-native';

// Define the parameter list type for the brand/[id] route
type BrandScreenParams = {
  title?: string;
  [key: string]: any;
};

type BrandRouteProp = RouteProp<ParamListBase, 'brand/[id]'>;

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="upload" options={{ headerShown: false }} />
      <Stack.Screen 
        name="brand/[id]"
        options={{
          headerBackTitle: 'Back',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitle: ({ children }) => {
            return <View style={{ opacity: 0 }}><Text>{children}</Text></View>;
          },
        }}
      />
      <Stack.Screen 
        name="brand/outlet/[id]"
        options={{
          headerBackTitle: 'Back',
          headerTransparent: true,
          headerTintColor: '#fff',
          headerTitle: ({ children }) => {
            return <View style={{ opacity: 0 }}><Text>{children}</Text></View>;
          },
        }}
      />
      <Stack.Screen 
        name="deal/[id]"
        options={{
          headerBackTitle: 'Back',
          title: "Deal Details",
        }}
      />
      <Stack.Screen 
        name="create/property-create" 
        options={{ 
          headerBackTitle: 'Back',
          title: "Property Create",
        }} 
      />
      <Stack.Screen 
        name="create/select-franchise" 
        options={{ 
          headerBackTitle: 'Back',
          title: "Select Franchise",
        }} 
      />
      <Stack.Screen 
        name="create/investment-details" 
        options={{ 
          headerBackTitle: 'Back',
          title: "Investment Details",
        }} 
      />
       <Stack.Screen 
        name="create/investment-summary" 
        options={{ 
          headerBackTitle: 'Back',
          title: "Investment Summary",
        }} 
      />
    </Stack>
  );
}