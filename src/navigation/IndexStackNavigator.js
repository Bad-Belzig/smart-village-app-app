import { createStackNavigator } from 'react-navigation';

import IndexScreen from '../screens/IndexScreen';
import DetailScreen from '../screens/DetailScreen';
import { defaultStackNavigatorConfig } from './defaultStackNavigatorConfig';

export const IndexStackNavigator = createStackNavigator(
  {
    Index: {
      screen: IndexScreen,
      navigationOptions: ({ navigation }) => ({
        title: 'Index'
      })
    },
    Detail: {
      screen: DetailScreen
    }
  },
  defaultStackNavigatorConfig('Index')
);
