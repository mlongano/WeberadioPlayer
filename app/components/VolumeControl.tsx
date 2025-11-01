import Slider from "@react-native-community/slider";
import { Text, View } from "react-native";
import { MD3Theme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";
import React from "react";

interface Props {
  volume: number;
  setVolume: (volume: number) => void;
  volumeDown: () => void;
  volumeUp: () => void;
  toggleMute: () => void;
  theme: MD3Theme;
}
export default function VolumeControl(
  { volume, setVolume, volumeDown, volumeUp, toggleMute, theme }: Props
): React.JSX.Element {
  return (
    <View style={{ flexDirection: 'row', }} >
      <Text style={{ color: theme.colors.primary, fontSize: 10, fontWeight: 'bold', marginTop: 10, marginLeft: 15, marginRight: 0, width: 20 }}>{Math.round(volume * 100)}</Text>
      <Slider
        minimumValue={0}
        maximumValue={1}
        step={0.01}
        onValueChange={setVolume}
        value={volume}
        style={{ flex: 1, marginLeft: 0, marginRight: 10, marginTop: 10, marginBottom: 10 }}
        minimumTrackTintColor={theme.colors.primary}
        maximumTrackTintColor={theme.colors.shadow}
      />
      <Icon.Button name='volume-down' color={theme.colors.primary} backgroundColor={'transparent'} size={20}
        onPress={volumeDown} />
      <Icon.Button name='volume-off' color={theme.colors.primary} backgroundColor={'transparent'} size={20}
        onPress={toggleMute} />
      <Icon.Button name='volume-up' color={theme.colors.primary} backgroundColor={'transparent'} size={20}
        onPress={volumeUp} />

    </View>
  )
}
