// hooks/useSongMetadata.ts
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
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
  //console.log("colorMode: ", colorMode);

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
    console.log("Setting up metadata listeners...");

    // Listen to enriched ICY metadata from IcecastMetadataService
    const handleEnrichedMetadata = (metadata: IcecastMetadata) => {
      console.log("useSongMetadata: Received enriched metadata:", metadata);
      setSongMetadata(metadata);
      setCover(metadata.coverUrl || defaultCover);
      console.log("useSongMetadata: Updated state - title:", metadata.title, "cover:", metadata.coverUrl);
    };

    icecastMetadataService.addListener(handleEnrichedMetadata);
    console.log("useSongMetadata: Listener registered");

    return () => {
      console.log("useSongMetadata: Cleaning up listeners");
      icecastMetadataService.removeListener(handleEnrichedMetadata);
    };
  }, [defaultCover]);

  return { songMetadata, cover };
}
