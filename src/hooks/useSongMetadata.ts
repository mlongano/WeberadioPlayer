// hooks/useSongMetadata.ts
import { useEffect, useState } from 'react';
import { useColorScheme, AppState } from 'react-native';
import { icecastMetadataService, SongMetadata as IcecastMetadata } from '../../src/services/IcecastMetadataService';

interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  year?: string;
  coverUrl?: string;
  listeners?: number;
}

export default function useSongMetadata() {
  const defaultCoverLight = "https://webe.radio/images/logo-light.png";
  const defaultCoverDark = "https://webe.radio/images/logo-dark.png";

  const [songMetadata, setSongMetadata] = useState<SongMetadata>({ title: '', artist: '', album: '', year: '', coverUrl: '', listeners: 0 });
  const colorMode = useColorScheme();

  const [defaultCover, setDefaultCover] = useState<string>(colorMode === "light" ? defaultCoverLight : defaultCoverDark);
  const [cover, setCover] = useState<string>(defaultCoverLight);

  // Change default cover when color mode changes
  useEffect(() => {
    const nextDefaultCover = colorMode === "light" ? defaultCoverLight : defaultCoverDark;
    if ((!cover) || cover === defaultCover) {
      setCover(nextDefaultCover);
    }
    setDefaultCover(nextDefaultCover);
  }, [colorMode]);

  // Get current song metadata from ICY metadata enriched by IcecastMetadataService
  useEffect(() => {
    // Listen to enriched ICY metadata from IcecastMetadataService
    const handleEnrichedMetadata = (metadata: IcecastMetadata) => {
      setSongMetadata(metadata);
      setCover(metadata.coverUrl || defaultCover);
    };

    icecastMetadataService.addListener(handleEnrichedMetadata);

    return () => {
      icecastMetadataService.removeListener(handleEnrichedMetadata);
    };
  }, [defaultCover]);

  // Restore metadata when app resumes from background
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // App came to foreground - restore last metadata if available
        const lastMetadata = icecastMetadataService.getLastMetadata();
        if (lastMetadata && (!songMetadata.title || songMetadata.title === '')) {
          setSongMetadata(lastMetadata);
          setCover(lastMetadata.coverUrl || defaultCover);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [songMetadata.title, defaultCover]);

  return { songMetadata, cover };
}
