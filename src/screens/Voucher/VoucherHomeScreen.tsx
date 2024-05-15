import { StackScreenProps } from '@react-navigation/stack';
import moment from 'moment';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { useMutation } from 'react-query';

import {
  Button,
  HtmlView,
  Image,
  LoadingSpinner,
  SafeAreaViewFlex,
  ServiceTiles,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { addToStore, readFromStore } from '../../helpers';
import {
  storeVoucherAuthToken,
  storeVoucherMemberId,
  storeVoucherMemberLoginInfo,
  voucherMemberLoginInfo
} from '../../helpers/voucherHelper';
import { useStaticContent, useVoucher } from '../../hooks';
import { logIn } from '../../queries/vouchers';
import { ScreenName, VoucherLogin } from '../../types';

const SAVED_DATE_OF_LAST_ACCOUNT_CHECK = 'savedDateOfLastAccountCheck';

export const VoucherHomeScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { refresh, isLoggedIn, memberId } = useVoucher();
  const [loadingAccountCheck, setLoadingAccountCheck] = useState(true);

  const imageUri = route?.params?.headerImage;

  const {
    data: dataHomeText,
    loading: loadingHomeText,
    refetch: refetchHomeText
  } = useStaticContent({
    refreshTimeKey: 'publicHtmlFile-voucherHomeText',
    name: 'voucherHomeText',
    type: 'html'
  });

  const refreshAuth = useCallback(() => {
    refresh();
  }, [refresh]);

  // refresh if the refreshAuth param changed, which happens after login
  useEffect(refreshAuth, [route.params?.refreshAuth]);

  const { mutate: mutateLogIn } = useMutation(logIn);

  useEffect(() => {
    const accountCheck = async () => {
      const loginInfo = await voucherMemberLoginInfo();
      const savedDate =
        (await readFromStore(SAVED_DATE_OF_LAST_ACCOUNT_CHECK)) || moment().format('YYYY-MM-DD');

      if (loginInfo && !moment().isSame(savedDate, 'day')) {
        mutateLogIn(JSON.parse(loginInfo as string) as VoucherLogin, {
          onSuccess: (responseData) => {
            if (!responseData?.member) {
              storeVoucherAuthToken();
              storeVoucherMemberId();
              storeVoucherMemberLoginInfo();
              refresh();
            }
          }
        });

        addToStore(SAVED_DATE_OF_LAST_ACCOUNT_CHECK, moment().format('YYYY-MM-DD'));
      }

      setLoadingAccountCheck(false);
    };

    accountCheck();
  }, []);

  const refreshHome = useCallback(async () => {
    await refetchHomeText();
  }, []);

  if (loadingHomeText || loadingAccountCheck) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaViewFlex>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refreshHome}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
      >
        {!!imageUri && (
          <Image source={{ uri: imageUri }} containerStyle={styles.imageContainerStyle} />
        )}

        {!!dataHomeText && (
          <Wrapper>
            <HtmlView html={dataHomeText} />
          </Wrapper>
        )}

        {(!isLoggedIn || !memberId) && (
          <Wrapper>
            <Button
              title={texts.voucher.loginButton}
              onPress={() => navigation.navigate(ScreenName.VoucherLogin, { imageUri })}
            />
          </Wrapper>
        )}

        <ServiceTiles staticJsonName="voucherHome" />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  imageContainerStyle: {
    alignSelf: 'center'
  }
});
