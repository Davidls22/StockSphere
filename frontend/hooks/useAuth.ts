import { useUser } from '../contexts/AuthContext';
import { loginUser, registerUser, setAuthToken } from '../services/api';

export const useAuth = () => {
  const { signIn } = useUser();

  const login = async (username: string, password: string) => {
    try {
      const response = await loginUser(username, password);
      const { token, user } = response.data;

      setAuthToken(token);
      signIn(token, user);
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await registerUser(username, password);
      const { token, user } = response.data;

      setAuthToken(token);
      signIn(token, user);
    } catch (error) {
      console.error('Failed to register:', error);
      throw error;
    }
  };

  return { login, register };
};