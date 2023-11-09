/* eslint-disable react-native/no-inline-styles */
import React from 'react';

import { OrientationAwareIcon } from '../../components';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../../types';
import { colors } from '../colors';
import { Icon } from '../Icon';
import { normalize } from '../normalize';
import { texts } from '../texts';

import { defaultStackConfig } from './defaultStackConfig';

type TabBarIconProps = {
  focused: boolean;
  color: string;
  size: number;
};

const homeTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Home,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.home,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon.Home}
        stroke={focused ? 2 : 1}
        landscapeStyle={{ marginRight: -normalize(6) }}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

const serviceTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Profile,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.profile,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={focused ? Icon.ProfileFilled : Icon.Profile}
        landscapeStyle={{ marginRight: -normalize(6) }}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

const bookmarksTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.Bookmarks,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.favorites,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={focused ? Icon.HeartFilled : Icon.HeartEmpty}
        landscapeStyle={{ marginRight: -normalize(6) }}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

const aboutTabConfig: TabConfig = {
  stackConfig: defaultStackConfig({
    initialRouteName: ScreenName.About,
    isDrawer: false
  }),
  tabOptions: {
    tabBarLabel: texts.tabBarLabel.about,
    tabBarIcon: ({ color, focused }: TabBarIconProps) => (
      <OrientationAwareIcon
        color={color}
        Icon={Icon.About}
        stroke={focused ? 2 : 1}
        landscapeStyle={{ marginRight: -normalize(6) }}
        size={normalize(28)}
        style={{ marginTop: normalize(3) }}
      />
    )
  }
};

export const tabNavigatorConfig: TabNavigatorConfig = {
  activeTintColor: colors.darkText,
  inactiveTintColor: colors.gray120,
  activeBackgroundColor: colors.surface,
  inactiveBackgroundColor: colors.surface,
  tabConfigs: [homeTabConfig, serviceTabConfig, bookmarksTabConfig, aboutTabConfig]
};
