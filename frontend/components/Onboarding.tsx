import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import tw from 'twrnc';

const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  return (
    <View style={tw`flex-1 bg-[#1a1a1a] p-4`}>
      {step === 0 && (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-3xl font-bold text-white mb-4 text-center`}>Welcome to StockSphere!</Text>
          <Image
            source={require('../assets/images/stocks.jpg')}
            style={tw`w-full h-64 mb-6 rounded-lg`}
            resizeMode="cover"
          />
          <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={nextStep}>
            <Text style={tw`text-white text-center font-bold`}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 1 && (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-xl font-bold text-white mb-4 text-center`}>Register or Login to start using StockSphere.</Text>
          <Image
            source={require('../assets/images/register_login.png')}
            style={tw`w-full h-64 mb-6 rounded-lg`}
            resizeMode="cover"
          />
          <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={nextStep}>
            <Text style={tw`text-white text-center font-bold`}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 2 && (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-xl font-bold text-white mb-4 text-center`}>Search for stocks to get detailed information.</Text>
          <Image
            source={require('../assets/images/search_stocks.png')}
            style={tw`w-full h-64 mb-6 rounded-lg`}
            resizeMode="cover"
          />
          <TouchableOpacity style={tw`bg-blue-600 p-3 rounded-lg`} onPress={nextStep}>
            <Text style={tw`text-white text-center font-bold`}>Next</Text>
          </TouchableOpacity>
        </View>
      )}
      {step === 3 && (
        <View style={tw`flex-1 justify-center items-center`}>
          <Text style={tw`text-xl font-bold text-white mb-4 text-center`}>Add stocks to your watchlist and portfolio, and stay updated with related news.</Text>
          <Image
            source={require('../assets/images/watchlist_portfolio.png')}
            style={tw`w-full h-64 mb-6 rounded-lg`}
            resizeMode="cover"
          />
          <TouchableOpacity style={tw`bg-green-600 p-3 rounded-lg`} onPress={onFinish}>
            <Text style={tw`text-white text-center font-bold`}>Let's Get Started!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default Onboarding;
