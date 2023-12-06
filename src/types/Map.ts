import { Point } from 'react-native-maps';

export type MapMarker = {
  iconAnchor?: Point;
  iconBackgroundColor?: string;
  iconColor?: string;
  iconName?: string;
  id?: string;
  position: {
    latitude: number;
    longitude: number;
  };
  title?: string;
};
