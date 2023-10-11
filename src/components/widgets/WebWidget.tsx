import { useNavigation } from '@react-navigation/core';
import React, { useCallback } from 'react';

import { Icon, normalize } from '../../config';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

export const WebWidget = ({ text = '', additionalProps }: WidgetProps) => {
  const navigation = useNavigation();

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Web, {
      title: additionalProps?.staticContentTitle,
      webUrl: additionalProps?.webUrl
    });
  }, [navigation, text]);

  return (
    <DefaultWidget
      Icon={(props) => <Icon.Url {...props} size={normalize(26)} />}
      image={additionalProps?.image}
      onPress={onPress}
      text={text}
    />
  );
};
