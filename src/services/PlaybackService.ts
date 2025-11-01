import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async function () {
    console.log('PlaybackService initialized');

    // Try using Event constants with additional logging
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        console.log('Remote play triggered');
        TrackPlayer.play();
    });
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        console.log('Remote pause triggered');
        TrackPlayer.pause();
    });
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        console.log('Remote next triggered');
        TrackPlayer.skipToNext();
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        console.log('Remote previous triggered');
        TrackPlayer.skipToPrevious();
    });
    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        console.log('Remote stop triggered');
        TrackPlayer.reset();
    });

    // Also try string-based listeners as fallback
    try {
        TrackPlayer.addEventListener('remote-play' as any, () => {
            console.log('String remote play triggered');
            TrackPlayer.play();
        });
        TrackPlayer.addEventListener('remote-pause' as any, () => {
            console.log('String remote pause triggered');
            TrackPlayer.pause();
        });
    } catch (e) {
        console.log('String event listeners not supported:', e);
    }
};

