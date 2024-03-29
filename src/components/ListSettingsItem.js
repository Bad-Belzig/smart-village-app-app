import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { StyleSheet } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Divider, ListItem } from 'react-native-elements';

import { colors, consts, device, Icon, normalize, texts } from '../config';
import { storageHelper } from '../helpers';
import { SettingsContext } from '../SettingsProvider';

import { BoldText, RegularText } from './Text';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow } from './Wrapper';

const { a11yLabel, LIST_TYPES } = consts;

const RADIO_BUTTON_SIZE = normalize(16);

// TODO: snack bar / toast als nutzerinfo
export const ListSettingsItem = ({ item }) => {
  const { title, queryType } = item;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { listTypesSettings, setListTypesSettings } = useContext(SettingsContext);
  const listTypeForQuery = listTypesSettings[queryType];

  useContext(SettingsContext);

  const onPressTitle = useCallback(() => setIsCollapsed((value) => !value), []);
  const getOnPressListType = (listType) => () =>
    setListTypesSettings((previousListTypes) => {
      const updatedListTypesSettings = {
        ...previousListTypes,
        [queryType]: listType
      };

      storageHelper.setListTypesSettings(updatedListTypesSettings);

      return updatedListTypesSettings;
    });

  return (
    <>
      <Touchable
        accessibilityLabel={`(${item.title}) ${a11yLabel.dropDownMenu} (${
          isCollapsed
            ? texts.accessibilityLabels.dropDownMenu.closed
            : texts.accessibilityLabels.dropDownMenu.open
        })`}
        onPress={onPressTitle}
      >
        <Wrapper style={styles.wrapper}>
          <WrapperRow spaceBetween>
            <BoldText>{title}</BoldText>
            {isCollapsed ? <Icon.ArrowDown /> : <Icon.ArrowUp />}
          </WrapperRow>
        </Wrapper>
      </Touchable>
      <Divider style={styles.divider} />
      <Collapsible collapsed={isCollapsed}>
        {Object.values(LIST_TYPES).map((listType) => {
          const activeTabAccessibilityLabel =
            listType === listTypeForQuery
              ? texts.accessibilityLabels.tabs.active
              : texts.accessibilityLabels.tabs.inactive;

          return (
            <ListItem
              accessibilityLabel={`(${texts.settingsTitles.listLayouts[listType]}) ${a11yLabel.button} ${activeTabAccessibilityLabel}`}
              key={listType}
              bottomDivider
              containerStyle={styles.container}
              onPress={getOnPressListType(listType)}
              delayPressIn={0}
              Component={Touchable}
            >
              <ListItem.Content>
                <RegularText small>{texts.settingsTitles.listLayouts[listType]}</RegularText>
              </ListItem.Content>

              {listType === listTypeForQuery ? (
                <Icon.RadioButtonFilled size={RADIO_BUTTON_SIZE} />
              ) : (
                <Icon.RadioButtonEmpty color={colors.darkText} size={RADIO_BUTTON_SIZE} />
              )}
            </ListItem>
          );
        })}
      </Collapsible>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.transparent,
    paddingRight: normalize(18),
    paddingVertical: normalize(12)
  },
  divider: {
    backgroundColor: colors.placeholder
  },
  wrapper: {
    paddingBottom: device.platform === 'ios' ? normalize(16) : normalize(14),
    paddingTop: device.platform === 'ios' ? normalize(16) : normalize(18)
  }
});

ListSettingsItem.propTypes = {
  item: PropTypes.object.isRequired
};
