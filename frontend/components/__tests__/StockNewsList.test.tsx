import { render, fireEvent } from '@testing-library/react-native';
import StockNewsList from '../../components/StockNewsList';
import { Linking } from 'react-native';

describe('StockNewsList component', () => {
  it('returns null if no articles are provided', () => {
    const { toJSON } = render(<StockNewsList articles={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('renders up to 3 articles', () => {
    const articles = [
      { title: 'Article 1', url: 'http://example.com/1' },
      { title: 'Article 2', url: 'http://example.com/2' },
      { title: 'Article 3', url: 'http://example.com/3' },
      { title: 'Article 4', url: 'http://example.com/4' },
    ];
    const { getByText, queryByText } = render(<StockNewsList articles={articles} />);
    expect(getByText('Article 1')).toBeTruthy();
    expect(getByText('Article 2')).toBeTruthy();
    expect(getByText('Article 3')).toBeTruthy();
    expect(queryByText('Article 4')).toBeNull();
  });

  it('calls Linking.openURL when "Read more" is pressed', () => {
    const articles = [{ title: 'Article 1', url: 'http://example.com/1' }];
    const openURLSpy = jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve());
    const { getByText } = render(<StockNewsList articles={articles} />);
    const readMoreButton = getByText('Read more');
    fireEvent.press(readMoreButton);
    expect(openURLSpy).toHaveBeenCalledWith('http://example.com/1');
    openURLSpy.mockRestore();
  });
});