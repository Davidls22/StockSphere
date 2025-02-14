import { useRouter } from 'expo-router';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import tw from 'twrnc';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await login(username, password);
      router.replace('/');
    } catch (error) {
      console.error('Login failed:', error);
    }
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
    </View>
  );
}