"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import spotifyService from '../services/spotify.service';
import useUserStore from '@/lib/store/useUserStore';


const Callback: React.FC = () => {
  const router = useRouter();
  const setUser = useUserStore((state) => state.setUser);
  const setAccessToken = useUserStore((state) => state.setAccessToken);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split('&').reduce((initial: any, item) => {
      const parts = item.split('=');
      initial[parts[0]] = decodeURIComponent(parts[1]);
      return initial;
    }, {});

    const accessToken = hash.access_token;

    if (accessToken) {
      spotifyService.setAccessToken(accessToken);

      spotifyService.getCurrentUser().then((userData: any) => {
        setUser(userData);
        setAccessToken(accessToken);
        console.log(userData);

        router.push('/dashboard');
      });
    }
  }, [router, setUser, setAccessToken]);

  return (
    <div>
      <h1>Logging in...</h1>
    </div>
  );
};

export default Callback;
