// useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '../../hooks/useAuth'; 
import { useUser } from '../../contexts/AuthContext';
import { loginUser, registerUser, setAuthToken } from '../../services/api';

jest.mock('../../contexts/AuthContext', () => ({
  useUser: jest.fn(),
}));

jest.mock('../../services/api', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  setAuthToken: jest.fn(),
}));

describe('useAuth hook', () => {
  const signInMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useUser as jest.Mock).mockReturnValue({ signIn: signInMock });
  });

  it('should login successfully and call setAuthToken and signIn', async () => {
    const token = 'test-token';
    const user = { id: 'user1', name: 'Test User' };
    (loginUser as jest.Mock).mockResolvedValue({ token, user });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('testuser', 'testpass');
    });

    expect(loginUser).toHaveBeenCalledWith('testuser', 'testpass');
    expect(setAuthToken).toHaveBeenCalledWith(token);
    expect(signInMock).toHaveBeenCalledWith(token, user);
  });

  it('should throw an error on login failure', async () => {
    const error = new Error('Login failed');
    (loginUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.login('testuser', 'testpass');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBe(error);
    expect(loginUser).toHaveBeenCalledWith('testuser', 'testpass');
    expect(setAuthToken).not.toHaveBeenCalled();
    expect(signInMock).not.toHaveBeenCalled();
  });

  it('should register successfully and call setAuthToken and signIn', async () => {
    const token = 'register-token';
    const user = { id: 'user2', name: 'New User' };
    (registerUser as jest.Mock).mockResolvedValue({ token, user });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.register('newuser', 'newpass');
    });

    expect(registerUser).toHaveBeenCalledWith('newuser', 'newpass');
    expect(setAuthToken).toHaveBeenCalledWith(token);
    expect(signInMock).toHaveBeenCalledWith(token, user);
  });

  it('should throw an error on register failure', async () => {
    const error = new Error('Register failed');
    (registerUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    let caughtError: unknown;
    await act(async () => {
      try {
        await result.current.register('newuser', 'newpass');
      } catch (err) {
        caughtError = err;
      }
    });

    expect(caughtError).toBe(error);
    expect(registerUser).toHaveBeenCalledWith('newuser', 'newpass');
    expect(setAuthToken).not.toHaveBeenCalled();
    expect(signInMock).not.toHaveBeenCalled();
  });
});