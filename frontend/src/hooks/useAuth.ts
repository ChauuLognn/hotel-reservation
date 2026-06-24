import { useAuth as useCoreAuth } from '@app/AuthContext';

export function useAuth() {
  return useCoreAuth();
}
