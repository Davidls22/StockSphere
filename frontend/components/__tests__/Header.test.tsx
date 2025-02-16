import { render, fireEvent } from '@testing-library/react-native';
import Header from '../../components/Header';
import { useUser } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

jest.mock('../../contexts/AuthContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

describe('Header component', () => {
  const signOutMock = jest.fn();
  const routerReplaceMock = jest.fn();

  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({
      user: { username: 'John' },
      signOut: signOutMock,
    });
    (useRouter as jest.Mock).mockReturnValue({ replace: routerReplaceMock });
    signOutMock.mockClear();
    routerReplaceMock.mockClear();
  });

  it('renders welcome message with username', () => {
    const { getByText } = render(<Header />);
    expect(getByText('Welcome, John')).toBeTruthy();
  });

  it('calls signOut and navigates when Logout is pressed', () => {
    const { getByText } = render(<Header />);
    const logoutButton = getByText('Logout');
    fireEvent.press(logoutButton);
    expect(signOutMock).toHaveBeenCalled();
    expect(routerReplaceMock).toHaveBeenCalledWith('/signIn');
  });

  it('renders "User" when username is missing', () => {
    (useUser as jest.Mock).mockReturnValue({
      user: {},
      signOut: signOutMock,
    });
    const { getByText } = render(<Header />);
    expect(getByText('Welcome, User')).toBeTruthy();
  });
});