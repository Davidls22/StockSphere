import { useState, useEffect } from 'react';

const API_URL = 'https://api.marketaux.com/v1/news/all';  // Verify the correct endpoint
const API_KEY = 'AalumZDxOZfmeUY0hNgV1r7Ox8tET0MAsqSJAHcr';  // Ensure this is your correct API key

export interface Article {
  title: string;
  description: string;
  url: string;
}

const useNewsArticle = () => {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`${API_URL}?country=us&api_token=${API_KEY}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        const contentType = response.headers.get('content-type');

        console.log('Response Content-Type:', contentType);
        console.log('Response:', response);

        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('Data:', data);
          if (data.data && data.data.length > 0) {
            setArticle(data.data[0]); // Get the first article
          } else {
            setError('No news articles found.');
          }
        } else {
          const text = await response.text();
          console.log('HTML Response:', text);
          setError('Unexpected response format. Check the API endpoint and API key.');
        }
      } catch (error: any) {
        console.error('Error fetching news:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return { article, loading, error };
};

export default useNewsArticle;
