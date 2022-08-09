import 'moment/locale/de';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar } from 'react-native-elements';
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  MessageText,
  Send
} from 'react-native-gifted-chat';

import { colors, Icon, normalize } from '../config';
import { momentFormat } from '../helpers';

import { RegularText } from './Text';

/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/prop-types */

const UserAvatar = ({ uri, title }) => (
  <Avatar
    containerStyle={styles.spacing}
    overlayContainerStyle={[styles.overlayContainerStyle, !uri && styles.border]}
    placeholderStyle={styles.placeholderStyle}
    rounded
    source={uri ? { uri } : undefined}
    renderPlaceholderContent={
      <Avatar
        containerStyle={[styles.containerStyle]}
        overlayContainerStyle={[styles.overlayContainerStyle, styles.border]}
        rounded
        title={title}
        titleStyle={styles.titleStyle}
      />
    }
  />
);

/**
 * it is the component used to realise the chat function
 * @param {array} data please make sure that the data format is as shown in the document
 *                      https://github.com/FaridSafi/react-native-gifted-chat#message-object
 * @param {object} bubbleWrapperStyleLeft  style of chat balloons on the left
 * @param {object} bubbleWrapperStyleRight style of chat balloons on the right
 * @param {object} messageTextStyleLeft    style of chat text on the left
 * @param {object} messageTextStyleRight   style of chat text on the right
 * @param {func}   onSendButton            function returning message text
 * @param {string} placeholder             placeholder text of `textInput`
 * @param {object} textInputProps          props to customise text input
 * @param {number} userId                  prop to recognise whether the message is the owner
 *                                         or another user
 */
export const Chat = ({
  bubbleWrapperStyleLeft,
  bubbleWrapperStyleRight,
  data,
  messageTextStyleLeft,
  messageTextStyleRight,
  onSendButton,
  placeholder,
  textInputProps,
  userId
}) => {
  const [messages, setMessages] = useState(data);
  const [onFocus, setOnFocus] = useState(false);

  useEffect(() => {
    setMessages(data);
  }, [data]);

  const onSend = useCallback((messages) => {
    onSendButton(messages[0].text);
  }, []);

  return (
    <GiftedChat
      alwaysShowSend
      messages={messages}
      messagesContainerStyle={{ bottom: onFocus ? 0 : normalize(48) }}
      onSend={(messages) => onSend(messages)}
      placeholder={placeholder || ''}
      scrollToBottom
      user={{
        _id: parseInt(userId) || 1
      }}
      renderAvatar={(props) => (
        <UserAvatar
          uri={props?.currentMessage?.user?.avatar}
          title={props?.currentMessage?.user?.name}
        />
      )}
      renderBubble={(props) => (
        <Bubble
          {...props}
          wrapperStyle={{
            left: bubbleWrapperStyleLeft || {
              backgroundColor: colors.gray20
            },
            right: bubbleWrapperStyleRight || {
              // TODO: added manually because there is no similar colour in the colours file.
              //       can be edited later!
              backgroundColor: '#E8F1E9'
            }
          }}
        />
      )}
      renderComposer={(props) => (
        <Composer
          {...props}
          composerHeight={normalize(48)}
          textInputProps={
            textInputProps || {
              multiline: true,
              onFocus: () => setOnFocus(true),
              onBlur: () => setOnFocus(false)
            }
          }
          textInputStyle={styles.textInputStyle}
        />
      )}
      renderDay={() => null}
      renderInputToolbar={(props) => (
        <InputToolbar
          {...props}
          containerStyle={{
            height: normalize(88)
          }}
          primaryStyle={styles.inputToolbarPrimary}
        />
      )}
      renderMessageText={(props) => (
        <MessageText
          {...props}
          textStyle={{
            left: messageTextStyleLeft || { color: colors.darkText, fontSize: normalize(14) },
            right: messageTextStyleRight || { color: colors.darkText, fontSize: normalize(14) }
          }}
        />
      )}
      renderSend={(props) => (
        <Send {...props} containerStyle={styles.sendButtonContainer}>
          <Icon.NamedIcon name="send" color={colors.surface} />
        </Send>
      )}
      renderTime={(props) => (
        <View style={{ paddingHorizontal: 10 }}>
          <RegularText smallest placeholder>
            {momentFormat(props.currentMessage.createdAt, 'lll')} Uhr
          </RegularText>
        </View>
      )}
    />
  );
};

const styles = StyleSheet.create({
  textInputStyle: {
    alignItems: 'center',
    borderColor: colors.gray20,
    borderRadius: normalize(4),
    borderWidth: normalize(1),
    fontSize: normalize(14),
    height: normalize(48),
    marginLeft: normalize(20),
    paddingHorizontal: normalize(5)
  },
  inputToolbarPrimary: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  sendButtonContainer: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: normalize(4),
    height: normalize(48),
    justifyContent: 'center',
    margin: normalize(20),
    marginLeft: normalize(8),
    width: normalize(48)
  },
  border: {
    borderColor: colors.darkText,
    borderWidth: 1
  },
  containerStyle: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  overlayContainerStyle: {
    backgroundColor: colors.surface
  },
  placeholderStyle: {
    backgroundColor: colors.surface
  },
  titleStyle: {
    color: colors.darkText,
    fontSize: normalize(12)
  },
  spacing: {
    marginVertical: normalize(5)
  }
});

Chat.propTypes = {
  bubbleWrapperStyleLeft: PropTypes.object,
  bubbleWrapperStyleRight: PropTypes.object,
  data: PropTypes.array.isRequired,
  messageTextStyleLeft: PropTypes.object,
  messageTextStyleRight: PropTypes.object,
  onSendButton: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  textInputProps: PropTypes.object,
  userId: PropTypes.string || PropTypes.number
};

UserAvatar.propTypes = {
  uri: PropTypes.string,
  title: PropTypes.string
};
