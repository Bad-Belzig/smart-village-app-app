import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { FlatList, RefreshControl, ScrollView, StyleSheet } from 'react-native';

import { NetworkContext } from '../../NetworkProvider';
import {
  BoldText,
  Button,
  Discount,
  HtmlView,
  INCREMENT_VOUCHER_COUNT,
  INITIAL_VOUCHER_COUNT,
  ImageSection,
  LoadingSpinner,
  OperatingCompany,
  RegularText,
  SectionHeader,
  VoucherListItem,
  VoucherRedeem,
  Wrapper
} from '../../components';
import { colors, texts } from '../../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../../helpers';
import { useOpenWebScreen, useVoucher } from '../../hooks';
import { QUERY_TYPES, getQuery } from '../../queries';
import { ScreenName, TVoucherContentBlock, TVoucherItem } from '../../types';

/* eslint-disable complexity */
export const VoucherDetailScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { memberId } = useVoucher();
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);
  const [loadedVoucherDataCount, setLoadedVoucherDataCount] = useState(INITIAL_VOUCHER_COUNT);

  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  // action to open source urls
  const openWebScreen = useOpenWebScreen('Anbieter', undefined, route.params?.rootRouteName);

  const { data, loading, refetch } = useQuery(getQuery(query), {
    variables: { memberId, ...queryVariables },
    fetchPolicy
  });

  const {
    contentBlocks,
    dataProvider,
    discountType,
    id,
    mediaContents,
    payload,
    pointOfInterest,
    quota,
    subtitle,
    title
  } = data?.[QUERY_TYPES.GENERIC_ITEM] ?? {};

  const ids = pointOfInterest?.vouchers
    .map((voucher: TVoucherItem) => voucher.id)
    .filter((id: string) => id !== queryVariables?.id);

  const { data: actualVouchersData, refetch: actualVouchersRefetch } = useQuery(
    getQuery(QUERY_TYPES.VOUCHERS),
    {
      variables: { ids },
      skip: !ids?.length,
      fetchPolicy
    }
  );

  const voucherListItems = useMemo(() => {
    return parseListItemsFromQuery(QUERY_TYPES.VOUCHERS, actualVouchersData, undefined, {
      withDate: false
    });
  }, [actualVouchersData]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch();
      await actualVouchersRefetch();
    }
    setRefreshing(false);
  }, [isConnected, refetch, setRefreshing]);

  if (!data || loading) {
    return <LoadingSpinner loading />;
  }

  const dataProviderLogo = dataProvider?.logo?.url;
  const { availableQuantity, frequency, maxPerPerson, maxQuantity } = quota || {};

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          colors={[colors.accent]}
          tintColor={colors.accent}
        />
      }
    >
      <ImageSection mediaContents={mediaContents} />

      <Wrapper>
        {!!quota &&
          (maxQuantity && frequency ? (
            <>
              <BoldText small primary>
                {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
              </BoldText>
              <RegularText small primary>
                {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
              </RegularText>
            </>
          ) : maxQuantity ? (
            <BoldText small primary>
              {texts.voucher.detailScreen.limit(availableQuantity, maxQuantity)}
            </BoldText>
          ) : (
            <BoldText small primary>
              {texts.voucher.detailScreen.frequency(maxPerPerson, frequency)}
            </BoldText>
          ))}

        {!!discountType && (
          <Discount
            discount={discountType}
            id={id}
            payloadId={payload.id}
            query={QUERY_TYPES.VOUCHERS}
          />
        )}
      </Wrapper>

      {!!title && (
        <Wrapper style={styles.noPaddingTop}>
          <BoldText>{title}</BoldText>
        </Wrapper>
      )}

      {!!subtitle && (
        <Wrapper style={styles.noPaddingTop}>
          <RegularText>{subtitle}</RegularText>
        </Wrapper>
      )}

      {!!contentBlocks?.length &&
        contentBlocks.map((item: TVoucherContentBlock, index: number) => (
          <Wrapper key={index}>
            {!!item.title && <BoldText>{item.title}</BoldText>}
            {!!item.body && <HtmlView html={item.body} />}
          </Wrapper>
        ))}

      {!!quota && (
        <Wrapper style={styles.noPaddingTop}>
          <VoucherRedeem quota={quota} voucherId={id} />
        </Wrapper>
      )}

      {!!pointOfInterest?.operatingCompany && (
        <>
          <OperatingCompany
            logo={dataProviderLogo}
            openWebScreen={openWebScreen}
            operatingCompany={pointOfInterest.operatingCompany}
            title={texts.pointOfInterest.operatingCompany}
          />

          <Wrapper>
            <Button
              title={texts.voucher.detailScreen.toPartnerButton}
              onPress={() =>
                navigation.navigate(ScreenName.Detail, {
                  query: QUERY_TYPES.POINT_OF_INTEREST,
                  title: pointOfInterest.name,
                  queryVariables: {
                    id: pointOfInterest.id
                  }
                })
              }
              invert
            />
          </Wrapper>
        </>
      )}

      {!!voucherListItems?.length && (
        <>
          <SectionHeader title={texts.pointOfInterest.vouchers} />
          <FlatList
            data={voucherListItems.slice(0, loadedVoucherDataCount)}
            renderItem={({ item }) => <VoucherListItem item={item} navigation={navigation} />}
            ListFooterComponent={() =>
              voucherListItems.length > loadedVoucherDataCount && (
                <Wrapper>
                  <Button
                    title={texts.pointOfInterest.loadMoreVouchers}
                    onPress={() =>
                      setLoadedVoucherDataCount((prev) => prev + INCREMENT_VOUCHER_COUNT)
                    }
                  />
                </Wrapper>
              )
            }
          />
        </>
      )}
    </ScrollView>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  noPaddingTop: {
    paddingTop: 0
  }
});
