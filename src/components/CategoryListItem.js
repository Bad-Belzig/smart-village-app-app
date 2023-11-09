import PropTypes from 'prop-types';
import React from 'react';
import { Badge, ListItem } from 'react-native-elements';
import { StyleSheet } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

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
      pointsOfInterestTreeCount,
      toursTreeCount,
      bottomDivider,
      topDivider
    } = item;

    const count = pointsOfInterestTreeCount > 0 ? pointsOfInterestTreeCount : toursTreeCount;
    return (
      <ListItem
        bottomDivider={
          bottomDivider !== undefined
            ? bottomDivider
            : item.toursTreeCount > 0
            ? index < section.data.length - 1 // do not show a bottomDivider after last entry
            : true
        }
        topDivider={topDivider !== undefined ? topDivider : false}
        containerStyle={styles.container}
        onPress={() => navigation.push(name, params)}
        delayPressIn={0}
        Component={Touchable}
        accessibilityLabel={`(${title}) ${consts.a11yLabel.poiCount} ${count} ${consts.a11yLabel.button}`}
      >
        <ListItem.Content>
          {noSubtitle || !subtitle ? null : <RegularText small>{subtitle}</RegularText>}
          <BoldText noSubtitle={noSubtitle}>{title}</BoldText>
        </ListItem.Content>

        <Badge value={count} badgeStyle={styles.badge} textStyle={styles.badgeText} />

        <Icon.ArrowRight color={colors.darkText} size={normalize(18)} />
      </ListItem>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingHorizontal: 0,
    paddingVertical: normalize(12)
  },
  badge: {
    backgroundColor: colors.transparent,
    marginTop: normalize(-5)
  },
  badgeText: {
    color: colors.darkText,
    fontSize: normalize(14),
    fontFamily: 'bold',
    lineHeight: normalize(20)
  }
});

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
