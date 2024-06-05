import { DrawerNavigationProp } from '@react-navigation/drawer';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { Icon, colors, normalize } from '../config';
import { addToStore, findClosestItem, isActive, readFromStore } from '../helpers';
import { useHomeRefresh, useStaticContent } from '../hooks';

import { Button } from './Button';
import { Image } from './Image';
import { HeadlineText, RegularText } from './Text';
import { Wrapper, WrapperHorizontal } from './Wrapper';

type Props = {
  navigation: DrawerNavigationProp<any>;
  publicJsonFile: string;
};

interface DateRange {
  dateEnd: string;
  dateStart: string;
}

interface DataItem {
  backgroundColor?: string;
  button: {
    navigationTo: string;
    params: { title?: string; webUrl: string };
    title?: string;
  };
  headline?: string;
  dates: DateRange[];
  description: string;
  id: number;
  picture?: { aspectRatio?: { HEIGHT: number; WIDTH: number }; uri: string };
  showButtonToClose?: boolean;
  title: string;
}

// eslint-disable-next-line complexity
export const Disturber = ({ navigation, publicJsonFile }: Props) => {
  const [isVisible, setIsVisible] = useState(false);

  const { data, refetch } = useStaticContent<DataItem[]>({
    refreshTimeKey: `publicJsonFile-${publicJsonFile}`,
    name: publicJsonFile,
    type: 'json'
  });

  useHomeRefresh(refetch);

  // find the closest item to the current date/time
  const closestItem: DataItem | null = findClosestItem(
    data?.filter((item) => item && isActive(item)) || []
  );

  const setDisturberComplete = () => {
    setIsVisible(false);
    !!closestItem && addToStore(publicJsonFile, closestItem.id.toString());
  };

  useEffect(() => {
    const disturberStatus = async () => {
      try {
        const disturberComplete = await readFromStore(publicJsonFile);

        if (closestItem?.id && closestItem.id.toString() !== disturberComplete) {
          setIsVisible(true);
        }
      } catch (e) {
        setIsVisible(false);

        console.error(e);
      }
    };

    disturberStatus();
  }, [closestItem]);

  if (!isVisible || !closestItem) return null;

  const {
    backgroundColor,
    button,
    description,
    headline,
    picture,
    showButtonToClose = true,
    title
  } = closestItem;

  const showButton = !!button && !!button.title && !!button.navigationTo && !!button.params;

  return (
    <Wrapper style={styles.wrapperPadding}>
      <View style={[styles.containerRadius, { backgroundColor }]}>
        {!!closestItem && (
          <>
            {showButtonToClose && (
              <TouchableOpacity onPress={setDisturberComplete} style={styles.closeButton}>
                <Icon.Close color={colors.lighterPrimary} size={normalize(16)} />
              </TouchableOpacity>
            )}

            {!!picture && (
              <Image
                source={picture}
                borderRadius={normalize(8)}
                aspectRatio={picture.aspectRatio || { HEIGHT: 0.7, WIDTH: 1 }}
                resizeMode="cover"
              />
            )}

            <Wrapper style={styles.smallPaddingBottom}>
              <WrapperHorizontal>
                {!!headline && (
                  <HeadlineText center uppercase style={styles.headlineText}>
                    {headline}
                  </HeadlineText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <WrapperHorizontal>
                {!!title && (
                  <HeadlineText center big>
                    {title}
                  </HeadlineText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper style={styles.noPaddingTop}>
              <WrapperHorizontal>
                {!!description && (
                  <RegularText center big>
                    {description}
                  </RegularText>
                )}
              </WrapperHorizontal>
            </Wrapper>

            <Wrapper>
              <WrapperHorizontal>
                {showButton && (
                  <Button
                    big
                    title={button.title}
                    onPress={() => {
                      navigation.navigate(button.navigationTo, button.params);
                    }}
                  />
                )}
              </WrapperHorizontal>
            </Wrapper>
          </>
        )}
      </View>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: colors.darkText,
    borderRadius: 25,
    height: normalize(32),
    justifyContent: 'center',
    opacity: 0.64,
    position: 'absolute',
    right: normalize(16),
    top: normalize(16),
    width: normalize(32),
    zIndex: 1
  },
  containerRadius: {
    borderRadius: normalize(8)
  },
  headlineText: {
    fontSize: normalize(14),
    fontWeight: '700',
    lineHeight: normalize(16)
  },
  smallPaddingBottom: {
    paddingBottom: normalize(8)
  },
  noPaddingTop: {
    paddingTop: 0
  },
  wrapperPadding: {
    padding: normalize(24)
  }
});
