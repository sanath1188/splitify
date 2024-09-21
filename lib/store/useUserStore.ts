import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
	user: any | null;
	accessToken: string | null;
	setUser: (user: any) => void;
	setAccessToken: (token: string) => void;
}

const useUserStore = create<UserState>(
	persist(
		(set) => ({
			user: null,
			accessToken: null,
			setUser: (user) => set({ user }),
			setAccessToken: (token) => set({ accessToken: token }),
		}),
		{
			name: "spotify-user-store", // Name of the localStorage key
			getStorage: () => localStorage, // Store in localStorage
		}
	)
);

export default useUserStore;
