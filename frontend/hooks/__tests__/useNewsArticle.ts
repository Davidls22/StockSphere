import { renderHook, waitFor } from '@testing-library/react-native';
import useNewsArticle from '../../hooks/useNewsArticle';
import { fetchNewsArticles } from '../../services/api';

jest.mock('../../services/api', () => ({
  fetchNewsArticles: jest.fn(),
}));

describe('useNewsArticle hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should set article when fetch is successful', async () => {
    const mockArticle = {
      title: 'Test Title',
      description: 'Test Description',
      url: 'http://example.com',
    };
    (fetchNewsArticles as jest.Mock).mockResolvedValue({ data: [mockArticle] });

    const { result } = renderHook(() => useNewsArticle());

    await waitFor(() => result.current.loading === false);

    expect(result.current.article).toEqual(mockArticle);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should set error if no articles are found', async () => {
    (fetchNewsArticles as jest.Mock).mockResolvedValue({ data: [] });

    const { result } = renderHook(() => useNewsArticle());

    await waitFor(() => result.current.loading === false);

    expect(result.current.article).toBeNull();
    expect(result.current.error).toBe('No news articles found.');
    expect(result.current.loading).toBe(false);
  });

  it('should set error on fetch failure', async () => {
    const errorMessage = 'Network error';
    (fetchNewsArticles as jest.Mock).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useNewsArticle());

    // Wait until loading is false and the error state has been updated.
    await waitFor(() => result.current.loading === false);
    await waitFor(() => result.current.error !== null);

    expect(result.current.article).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.loading).toBe(false);
  });
});