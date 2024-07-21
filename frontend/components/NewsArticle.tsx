import React from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, Linking, Image } from 'react-native';
import useNewsArticle from '../hooks/useNewsArticle';
import tw from 'twrnc';

const NewsArticle: React.FC = () => {
  const { article, loading, error } = useNewsArticle();

  if (loading) {
    return <ActivityIndicator size="large" color="#FFFFFF" />;
  }

  if (error) {
    return <Text style={tw`text-red-500`}>Error: {error}</Text>;
  }

  if (!article) {
    return null;
  }

  return (
    <View style={tw`p-2 bg-gray-800 rounded-lg mt-4`}>
      <Text style={tw`text-lg font-bold text-white mb-2`}>{article.title}</Text>
      <TouchableOpacity onPress={() => openArticle(article.url)} style={tw``}>
        <Text style={tw`text-blue-500 underline`}>Read more</Text>
      </TouchableOpacity>
    </View>
  );
};

const openArticle = (url: string) => {
  Linking.openURL(url);
};

export default NewsArticle;
