import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useUser } from '../contexts/AuthContext';
import { useRouter } from 'expo-router';
import tw from 'twrnc'; 

export default function Header() {
  const { user, signOut } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    signOut();
    router.replace('/signIn'); 
  };

  return (
    <View style={tw`flex-row justify-between items-center p-4 m-3 mt-10 bg-[#2a2a2a] rounded-lg`}>
      <Text style={tw`text-lg font-bold text-white`}>
      Welcome, {user?.username ? user.username : 'User'}
      </Text>
      <TouchableOpacity onPress={handleLogout} style={tw`bg-red-600 p-2 rounded-lg`}>
        <Text style={tw`text-white font-bold`}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
