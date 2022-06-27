import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Overlay } from 'react-native-elements';

import { colors, normalize, texts } from '../config';

import { BoldText } from './Text';
import { Touchable } from './Touchable';

export const Modal = ({
  children,
  isBackdropPress,
  isListView,
  isVisible,
  modalHiddenButtonName,
  onModalVisible
}) => {
  return (
    <Overlay
      animationType="fade"
      isVisible={isVisible}
      onBackdropPress={isBackdropPress ? onModalVisible : undefined}
      windowBackgroundColor={colors.overlayRgba}
      overlayStyle={!isListView && styles.overlay}
      width="80%"
      height="auto"
      borderRadius={8}
      supportedOrientations={['portrait', 'landscape']}
    >
      <>
        {children}

        <Touchable onPress={onModalVisible}>
          <BoldText center underline primary>
            {modalHiddenButtonName}
          </BoldText>
        </Touchable>
      </>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    padding: normalize(30)
  }
});

Modal.propTypes = {
  children: PropTypes.node.isRequired,
  isBackdropPress: PropTypes.bool,
  isListView: PropTypes.bool,
  isVisible: PropTypes.bool.isRequired,
  modalHiddenButtonName: PropTypes.string,
  onModalVisible: PropTypes.func.isRequired
};

Modal.defaultProps = {
  modalHiddenButtonName: texts.settingsTitles.arListLayouts.cancel
};
