import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ShareContent, StyleSheet } from 'react-native';

import { normalize } from '../config';

import { BookmarkHeader } from './bookmarks';
import { CalendarHeader } from './CalendarHeader';
import { ChatHeader } from './ChatHeader';
import { DrawerHeader } from './DrawerHeader';
import { EditHeader } from './EditHeader';
import { GroupHeader } from './GroupHeader';
import { ShareHeader } from './ShareHeader';
import { WrapperRow } from './Wrapper';
import { InfoHeader } from './InfoHeader';

type Props = {
  navigation: StackNavigationProp<any> & DrawerNavigationProp<any>;
  onPress?: () => void;
  route: RouteProp<any, string>;
  shareContent?: ShareContent;
  withBookmark?: boolean;
  withChat?: boolean;
  withCalendar?: boolean;
  withGroup?: boolean;
  withDrawer?: boolean;
  withEdit?: boolean;
  withShare?: boolean;
  withInfo?: boolean;
};

export const HeaderRight = ({
  navigation,
  onPress,
  route,
  shareContent = route.params?.shareContent,
  withBookmark = false,
  withChat = false,
  withCalendar = false,
  withGroup = false,
  withDrawer = false,
  withEdit = false,
  withShare = false,
  withInfo = false
}: Props) => (
  <WrapperRow style={styles.headerRight}>
    {withBookmark && <BookmarkHeader route={route} style={styles.icon} />}
    {withChat && <ChatHeader navigation={navigation} style={styles.icon} />}
    {withCalendar && <CalendarHeader navigation={navigation} style={styles.icon} />}
    {withGroup && <GroupHeader navigation={navigation} style={styles.icon} />}
    {withEdit && <EditHeader onPress={onPress} style={styles.icon} />}
    {withShare && <ShareHeader shareContent={shareContent} style={styles.icon} />}
    {withDrawer && <DrawerHeader navigation={navigation} style={styles.icon} />}
    {withInfo && <InfoHeader route={route} style={styles.icon} />}
  </WrapperRow>
);

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
