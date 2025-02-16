import { render, fireEvent } from '@testing-library/react-native';
import NewsArticle from '../../components/NewsArticle';
import { Linking } from 'react-native';
import useNewsArticle from '../../hooks/useNewsArticle';

jest.mock('../../hooks/useNewsArticle');

describe('NewsArticle component', () => {
  it('renders loading indicator when loading', () => {
    (useNewsArticle as jest.Mock).mockReturnValue({
      loading: true,
      article: null,
      error: null,
    });
    const { queryByText, getByTestId } = render(<NewsArticle />);
    expect(queryByText(/Read more/i)).toBeNull();
  });

  it('renders error message when there is an error', () => {
    const errorMessage = 'Something went wrong';
    (useNewsArticle as jest.Mock).mockReturnValue({
      loading: false,
      article: null,
      error: errorMessage,
    });
    const { getByText } = render(<NewsArticle />);
    expect(getByText(`Error: ${errorMessage}`)).toBeTruthy();
  });

  it('renders article and opens URL when "Read more" is pressed', () => {
    const article = { title: 'Test Article', url: 'http://example.com' };
    (useNewsArticle as jest.Mock).mockReturnValue({
      loading: false,
      article,
      error: null,
    });

    const openURLSpy = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
    
    const { getByText } = render(<NewsArticle />);
    expect(getByText(article.title)).toBeTruthy();
    
    const readMoreButton = getByText('Read more');
    fireEvent.press(readMoreButton);
    expect(openURLSpy).toHaveBeenCalledWith(article.url);
    
    openURLSpy.mockRestore();
  });
});