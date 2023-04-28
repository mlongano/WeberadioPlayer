import Slider from "@react-native-community/slider";
import { Text, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface Props {
  volume: number;
  setVolume: (volume: number) => void;
  volumeDown: () => void;
  volumeUp: () => void;
  toggleMute: () => void;
}
export default function VolumeControl(
  { volume, setVolume, volumeDown, volumeUp, toggleMute }: Props
): JSX.Element {
  return (
    <View style={{ flexDirection: 'row', }} >
    <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold', marginTop: 10, marginLeft: 15, marginRight: 0, width: 20 }}>{Math.round(volume * 100)}</Text>
    <Slider
      minimumValue={0}
      maximumValue={1}
      step={0.01}
      onValueChange={setVolume}
      value={volume}
      style={{ flex: 1, marginLeft: 0, marginRight: 10, marginTop: 10, marginBottom: 10 }}
      minimumTrackTintColor='#fff'
      maximumTrackTintColor='rgba(255, 255, 255, 0.14)'
    />
    <Icon.Button name='volume-down' color={'white'} backgroundColor={'transparent'} size={20}
      onPress={volumeDown} />
    <Icon.Button name='volume-off' color={'white'} backgroundColor={'transparent'} size={20}
      onPress={toggleMute} />
    <Icon.Button name='volume-up' color={'white'} backgroundColor={'transparent'} size={20}
      onPress={volumeUp} />

  </View>
  )}
