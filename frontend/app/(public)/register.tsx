import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useUser } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import tw from 'twrnc';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useUser();
  const router = useRouter();

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/register', { username, password });
      signIn(response.data.token, { id: response.data.user.id, username: response.data.user.username });
      router.push('/');
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  const navigateToLogin = () => {
    router.push('/login');
  };

  return (
    <View style={tw`flex-1 justify-center items-center p-4 bg-[#1a1a1a]`}>
      <View style={tw`mb-8`}>
        <Text style={tw`text-3xl font-bold text-white text-center`}>StockSphere</Text>
      </View>
      <TextInput
        style={tw`h-12 border border-gray-300 rounded-lg mb-4 px-4 text-white w-full bg-[#2a2a2a]`}
        placeholder="Username"
        placeholderTextColor="#888888"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={tw`h-12 border border-gray-300 rounded-lg mb-4 px-4 text-white w-full bg-[#2a2a2a]`}
        placeholder="Password"
        placeholderTextColor="#888888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={tw`bg-blue-600 p-3 rounded-lg mb-4 w-full`}
        onPress={handleRegister}
      >
        <Text style={tw`text-white text-center font-bold`}>Register</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-green-600 p-3 rounded-lg w-full`}
        onPress={navigateToLogin}
      >
        <Text style={tw`text-white text-center font-bold`}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}
