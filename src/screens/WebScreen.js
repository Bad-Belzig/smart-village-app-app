import { noop } from 'lodash';
import PropTypes from 'prop-types';
import React, { useContext, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';

import appJson from '../../app.json';
import { LoadingContainer, SafeAreaViewFlex } from '../components';
import { colors, consts } from '../config';
import { useTrackScreenViewAsync } from '../hooks';
import { NetworkContext } from '../NetworkProvider';

const { MATOMO_TRACKING } = consts;

export const WebScreen = ({ route }) => {
  const { isConnected } = useContext(NetworkContext);
  const trackScreenViewAsync = useTrackScreenViewAsync();
  const webUrl = route.params?.webUrl ?? '';
  const injectedJavaScript = route.params?.injectedJavaScript ?? '';

  // NOTE: we cannot use the `useMatomoTrackScreenView` hook here, as we need the `webUrl`
  //       dependency
  useEffect(() => {
    isConnected && webUrl && trackScreenViewAsync(`${MATOMO_TRACKING.SCREEN_VIEW.WEB} / ${webUrl}`);
  }, [webUrl]);

  if (!webUrl) return null;

  return (
    <SafeAreaViewFlex>
      <WebView
        source={{ uri: webUrl }}
        startInLoadingState
        mediaPlaybackRequiresUserAction
        renderLoading={() => (
          <LoadingContainer web>
            <ActivityIndicator color={colors.accent} />
          </LoadingContainer>
        )}
        injectedJavaScript={injectedJavaScript}
        onMessage={noop} // needed for making `injectedJavaScript` work in some cases
        // https://github.com/react-native-webview/react-native-webview/blob/19980d888d66554875f3ac64b3e8a35bd7ad998b/src/WebViewTypes.ts#L378-L389
        decelerationRate="normal"
        // https://github.com/react-native-webview/react-native-webview/blob/master/docs/Reference.md#applicationnameforuseragent
        applicationNameForUserAgent={
          !webUrl.includes('bbnavi.de') ? appJson.expo.scheme : undefined
        }
      />
    </SafeAreaViewFlex>
  );
};

WebScreen.propTypes = {
  route: PropTypes.object.isRequired
};
