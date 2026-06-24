import { useAuth as useCoreAuth } from '@contexts/AuthContext';

export function useAuth() {
  return useCoreAuth();
}
