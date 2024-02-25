// hooks/useSongMetadata.ts
import {useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {io} from 'socket.io-client';

interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  coverUrl?: string;
  listeners?: number;
}

export default function useSongMetadata() {
  const defaultCoverLight = 'https://webe.radio/images/logo-light.png';
  const defaultCoverDark = 'https://webe.radio/images/logo-dark.png';

  const [songMetadata, setSongMetadata] = useState<SongMetadata>({
    title: '',
    artist: '',
    album: '',
    year: '',
    coverUrl: '',
    listeners: 0,
  });
  const colorMode = useColorScheme();
  //console.log("colorMode: ", colorMode);

  const [defaultCover, setDefaultCover] = useState<string>(
    colorMode === 'light' ? defaultCoverLight : defaultCoverDark,
  );
  const [cover, setCover] = useState<string>(defaultCoverLight);

  // Change default cover when color mode changes
  useEffect(() => {
    const nextDefaultCover =
      colorMode === 'light' ? defaultCoverLight : defaultCoverDark;
    if (!cover || cover === defaultCover) {
      setCover(nextDefaultCover);
    }
    setDefaultCover(nextDefaultCover);
  }, [colorMode]);

  // Get current song metadata from the socket.io server
  useEffect(() => {
    console.log('Connecting...');
    const socket = io('https://metadata.webe.radio');

    try {
      socket.on('connect', () => {
        console.log('Connected!');
      });

      socket.on('metadata', data => {
        //console.log("metadata: ", data);
        setSongMetadata(data);
        setCover(data.coverUrl || defaultCover);
      });
    } catch (e) {
      console.log('Error: ', e);
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  return {songMetadata, cover};
}
