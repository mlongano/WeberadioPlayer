import TrackPlayer, { Event } from 'react-native-track-player';

export const PlaybackService = async function () {
    if (__DEV__) console.log('PlaybackService initialized');

    // Try using Event constants with additional logging
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        if (__DEV__) console.log('Remote play triggered');
        TrackPlayer.play();
    });
    TrackPlayer.addEventListener(Event.RemotePause, () => {
        if (__DEV__) console.log('Remote pause triggered');
        TrackPlayer.pause();
    });
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        if (__DEV__) console.log('Remote next triggered');
        TrackPlayer.skipToNext();
    });
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        if (__DEV__) console.log('Remote previous triggered');
        TrackPlayer.skipToPrevious();
    });
    TrackPlayer.addEventListener(Event.RemoteStop, () => {
        if (__DEV__) console.log('Remote stop triggered');
        TrackPlayer.reset();
    });

};

