import PropTypes from 'prop-types';
import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CacheManager } from 'react-native-expo-image-cache';
import { Image as RNEImage } from 'react-native-elements';

import { consts, colors } from '../config';
import { imageHeight, imageWidth } from '../helpers';
import { SettingsContext } from '../SettingsProvider';
import { useInterval } from '../hooks';

import { ImageMessage } from './ImageMessage';
import { ImageRights } from './ImageRights';

const addQueryParam = (url, param) => {
  if (!url?.length) return;

  if (url.endsWith('/')) {
    url = url.slice(0, url.length - 1);
  }

  return url.includes('?') ? `${url}&${param}` : `${url}?${param}`;
};

export const Image = ({
  source,
  message,
  style,
  containerStyle,
  PlaceholderContent,
  aspectRatio,
  resizeMode,
  borderRadius,
  refreshInterval
}) => {
  const [uri, setUri] = useState(null);
  const { globalSettings } = useContext(SettingsContext);
  const timestamp = useInterval(refreshInterval);

  // only use cache when refreshInterval is undefined
  // if there is a source.uri to fetch, do it with the CacheManager and set the local path to show.
  // if there is no uri, the source itself should be already a local path, so set it immediately.
  useEffect(() => {
    // to fix the warning:
    // "Can't perform a React state update on an unmounted component.
    //  This is a no-op, but it indicates a memory leak in your application.
    //  To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function."
    // -> https://juliangaramendy.dev/use-promise-subscription/
    let mounted = true;

    effect: {
      if (source.uri && source.uri.startsWith('file:///')) {
        setUri(source.uri);

        // we have a local image and can return immediately
        break effect;
      }

      if (refreshInterval === undefined) {
        source.uri
          ? CacheManager.get(source.uri)
              .getPath()
              .then((path) => mounted && setUri(path))
              .catch((err) =>
                console.warn('An error occurred with cache management for an image', err)
              )
          : mounted && setUri(source);
      } else {
        // add an artificial query param to the end of the url to trigger a rerender and refetch
        mounted && setUri(addQueryParam(source.uri ?? source, `svaRefreshCount=${timestamp}`));
      }
    }

    return () => (mounted = false);
  }, [timestamp, refreshInterval, source, setUri]);

  return (
    <View>
      <RNEImage
        source={uri ? (source.uri ? { uri } : uri) : null}
        style={style || stylesForImage(aspectRatio).defaultStyle}
        containerStyle={containerStyle}
        PlaceholderContent={PlaceholderContent}
        placeholderStyle={{ backgroundColor: colors.transparent }}
        accessible={!!source?.captionText}
        accessibilityLabel={`${source.captionText ? source.captionText : ''} ${
          consts.a11yLabel.image
        }`}
        resizeMode={resizeMode}
        borderRadius={borderRadius}
      >
        {!!message && <ImageMessage message={message} />}
        {!!globalSettings?.showImageRights && !!source?.copyright && (
          <ImageRights imageRights={source.copyright} />
        )}
      </RNEImage>
    </View>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that eslint warning */
// we need to call the default styles in a method to ensure correct defaults for image aspect ratio,
// which could be overwritten bei server global settings. otherwise (as default prop) the style
// would be set before the overwriting occurred.
const stylesForImage = (aspectRatio) => {
  const width = imageWidth();

  return StyleSheet.create({
    defaultStyle: {
      height: imageHeight(width, aspectRatio),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

Image.propTypes = {
  source: PropTypes.oneOfType([PropTypes.object, PropTypes.number]).isRequired,
  message: PropTypes.string,
  containerStyle: PropTypes.object,
  style: PropTypes.object,
  PlaceholderContent: PropTypes.object,
  aspectRatio: PropTypes.object,
  resizeMode: PropTypes.string,
  borderRadius: PropTypes.number,
  refreshInterval: PropTypes.number
};

Image.defaultProps = {
  PlaceholderContent: <ActivityIndicator color={colors.accent} />,
  resizeMode: 'cover',
  borderRadius: 0
};
