import PropTypes from 'prop-types';
import React from 'react';
import { ListItem } from 'react-native-elements';

import { colors, Icon, normalize } from '../config';

import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';

export class CategoryListItem extends React.PureComponent {
  render() {
    const { navigation, noSubtitle, item, index, section } = this.props;
    const {
      routeName: name,
      params,
      subtitle,
      title,
      pointsOfInterestCount,
      toursCount,
      bottomDivider,
      topDivider
    } = item;

    const count = pointsOfInterestCount > 0 ? pointsOfInterestCount : toursCount;

    return (
      <ListItem
        title={noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
        subtitle={<BoldText noSubtitle={noSubtitle}>{`${title} (${count})`}</BoldText>}
        bottomDivider={
          bottomDivider !== undefined
            ? bottomDivider
            : item.toursCount > 0
            ? index < section.data.length - 1 // do not show a bottomDivider after last entry
            : true
        }
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={{
          backgroundColor: colors.transparent,
          paddingVertical: normalize(12)
        }}
        rightIcon={<Icon.ArrowRight />}
        onPress={() =>
          navigation.navigate({
            name,
            params
          })
        }
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={`${title} (Anzahl verfügbarer Einträge: ${count}) (Taste)`}
      />
    );
  }
}

CategoryListItem.propTypes = {
  navigation: PropTypes.object.isRequired,
  item: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  section: PropTypes.object.isRequired,
  noSubtitle: PropTypes.bool
};

CategoryListItem.defaultProps = {
  noSubtitle: false
};
