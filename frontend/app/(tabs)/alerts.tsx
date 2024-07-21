import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert as RNAlert } from 'react-native';
import axios from 'axios';
import Header from '../../components/Header';
import { useUser } from '../../contexts/AuthContext';
import tw from 'twrnc';

interface AlertItem {
  _id: string;
  symbol: string;
  targetPrice: number;
  createdAt: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useUser();

  useEffect(() => {
    const fetchAlerts = async () => {
      if (!user) {
        console.log('No user available. Please log in.');
        setError('No user available. Please log in.');
        setLoading(false);
        return;
      }

      try {
        console.log(`Fetching alerts for user: ${user.id}`);
        const response = await axios.get(`http://localhost:8080/api/alerts/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetched alerts:', response.data);
        setAlerts(response.data);
        setError(null);
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
        setError('Failed to fetch alerts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [user, token]);

  const handleRemoveAlert = async (alertId: string) => {
    try {
      await axios.delete(`http://localhost:8080/api/alerts/${alertId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== alertId));
    } catch (error) {
      console.error('Failed to remove alert:', error);
      RNAlert.alert('Error', 'Failed to remove alert');
    }
  };

  return (
    <View style={tw`flex-1 p-2 bg-[#1a1a1a]`}>
      <Header />
      {loading ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={tw`text-white mt-4`}>Loading...</Text>
        </View>
      ) : error ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-red-500 text-center mt-4`}>{error}</Text>
        </View>
      ) : alerts.length === 0 ? (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-white`}>No alerts found.</Text>
        </View>
      ) : (
        <FlatList
          data={alerts}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={tw`p-4 border-b border-gray-600`}>
              <Text style={tw`text-lg font-bold text-white`}>{item.symbol}</Text>
              <Text style={tw`text-white`}>Target Price: ${item.targetPrice}</Text>
              <Text style={tw`text-gray-400 text-sm`}>{new Date(item.createdAt).toLocaleString()}</Text>
              <TouchableOpacity
                style={tw`bg-red-600 p-2 rounded-lg mt-2`}
                onPress={() => handleRemoveAlert(item._id)}
              >
                <Text style={tw`text-white text-center`}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}
