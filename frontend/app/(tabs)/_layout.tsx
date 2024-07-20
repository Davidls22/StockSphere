import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { useTheme } from '@react-navigation/native';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string; }) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: '#1a1a1a',  
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'gray',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="watchList"
        options={{
          title: 'Watch List',
          tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="portfolioAnalytics"
        options={{
          title: 'Portfolio',
          tabBarIcon: ({ color }) => <TabBarIcon name="line-chart" color={color} />,
          headerShown: false, 
        }}
      />
      <Tabs.Screen
        name="stockDetail/[symbol]"
        options={{
          title: 'Stock Details',
          tabBarIcon: ({ color }) => <TabBarIcon name="info" color={color} />,
          href: {
            pathname: '/stockDetail/[symbol]',
            params: { symbol: 'AAPL' }, 
          },
          headerShown: false, 
        }}
      />
    </Tabs>
  );
}
