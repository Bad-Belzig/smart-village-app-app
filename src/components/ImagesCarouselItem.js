import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { TouchableOpacity } from 'react-native';

import { consts } from '../config';

import { Image } from './Image';

/**
 * Smart item component for `ImagesCarousel`, that renders an image or an image wrapped in a
 * touchable that can navigate to a given `routeName` with `params`.
 *
 * @return {ReactElement} `Image` or an `Image` wrapped in a `TouchableOpacity`
 */
export const ImagesCarouselItem = memo(
  ({ navigation, source, message, containerStyle, aspectRatio, refreshInterval }) => {
    const { routeName: name, params } = source;

    if (name && params) {
      return (
        <TouchableOpacity
          accessibilityLabel={`${
            source.captionText ? source.captionText : consts.a11yLabel.imageCarousel
          } ${consts.a11yLabel.button}`}
          onPress={() => navigation.navigate({ name, params })}
          activeOpacity={0.8}
        >
          <Image {...{ source, message, containerStyle, aspectRatio }} />
        </TouchableOpacity>
      );
    }

    return <Image {...{ source, message, containerStyle, aspectRatio, refreshInterval }} />;
  }
);

ImagesCarouselItem.displayName = 'ImagesCarouselItem';

ImagesCarouselItem.propTypes = {
  navigation: PropTypes.object,
  source: PropTypes.object.isRequired,
  message: PropTypes.string,
  containerStyle: PropTypes.object,
  aspectRatio: PropTypes.object,
  refreshInterval: PropTypes.number
};
//Fix:Accessibility
