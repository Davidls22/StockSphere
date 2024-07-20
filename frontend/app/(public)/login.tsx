import { useRouter } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/AuthContext';
import tw from 'twrnc'; 

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { signIn } = useUser();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', { username, password });
      if (response.status === 200) {
        const { token, user } = response.data;
        console.log('Login successful. User data:', user); 
        signIn(token, user); 
        router.replace('/');
      } else {
        console.error('Failed to sign in: Invalid response status');
      }
    } catch (error) {
      console.error('Failed to sign in:', error);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
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
        onPress={handleSignIn}
      >
        <Text style={tw`text-white text-center font-bold`}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={tw`bg-green-600 p-3 rounded-lg w-full`}
        onPress={navigateToRegister}
      >
        <Text style={tw`text-white text-center font-bold`}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}
