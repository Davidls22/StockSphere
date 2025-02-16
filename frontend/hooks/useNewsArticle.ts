import { useState, useEffect } from 'react';
import { fetchNewsArticles } from '../services/api';

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
    const getNews = async () => {
      try {
        const data = await fetchNewsArticles();
        if (data.data && data.data.length > 0) {
          setArticle(data.data[0]); 
        } else {
          setError('No news articles found.');
        }
      } catch (err: any) {
        console.error('Error fetching news:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  return { article, loading, error };
};

export default useNewsArticle;