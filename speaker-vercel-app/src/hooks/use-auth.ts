import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { verifyUser, createUser } from '../lib/db';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthState {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  updateUserData: (userData: User) => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: async (email: string, password: string) => {
        const user = await verifyUser(email, password);
        if (user) {
          const { password: _, ...userWithoutPassword } = user;
          set({ user: userWithoutPassword });
        }
      },
      register: async (email: string, password: string, name: string) => {
        const userId = await createUser(email, password, name);
        set({
          user: {
            id: userId,
            email,
            name,
          },
        });
      },
      logout: () => set({ user: null }),
      updateUserData: (userData: User) => set({ user: userData }),
    }),
    {
      name: 'auth-storage',
    }
  )
);