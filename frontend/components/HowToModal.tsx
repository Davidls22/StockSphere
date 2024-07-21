import React, { useState } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import Carousel from 'react-native-snap-carousel';
import tw from 'twrnc';

const { width: screenWidth } = Dimensions.get('window');

const HowToModal = ({ isVisible, onClose }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  const data = [
    {
      title: 'Welcome to StockSphere',
      text: 'Track your favorite stocks and stay updated with the latest market trends.',
    },
    {
      title: 'Search Stocks',
      text: 'Use the search feature to find and track the stocks you are interested in.',
    },
    {
      title: 'Add Stocks to Your Watchlist',
      text: 'Add stocks to your watchlist to monitor their performance closely.',
    },
    {
      title: 'Manage Your Portfolio',
      text: 'Add stocks to your portfolio and view detailed analytics.',
    },
    {
      title: 'Set Alerts',
      text: 'Set price alerts to get notified when a stock reaches your target price.',
    },
    {
      title: 'Get News Updates',
      text: 'Stay informed with the latest news related to the stocks you are tracking.',
    },
  ];

  const renderItem = ({ item }) => (
    <View style={tw`justify-center items-center p-5`}>
      <Text style={tw`text-2xl font-bold mb-4`}>{item.title}</Text>
      <Text style={tw`text-lg text-center`}>{item.text}</Text>
    </View>
  );

  return (
    <Modal isVisible={isVisible} onBackdropPress={onClose} style={tw`justify-center items-center`}>
      <View style={tw`bg-white rounded-lg p-6`}>
        <Carousel
          data={data}
          renderItem={renderItem}
          sliderWidth={screenWidth}
          itemWidth={screenWidth * 0.8}
          onSnapToItem={(index) => setActiveSlide(index)}
        />
        <Text style={tw`mt-4 text-center text-lg`}>{`${activeSlide + 1}/${data.length}`}</Text>
      </View>
    </Modal>
  );
};

export default HowToModal;
