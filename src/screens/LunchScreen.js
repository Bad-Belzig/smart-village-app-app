import moment from 'moment';
import PropTypes from 'prop-types';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity
} from 'react-native';

import {
  BoldText,
  Button,
  ConnectedImagesCarousel,
  LunchSection,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperRow,
  WrapperWithOrientation
} from '../components';
import { colors, consts, Icon, normalize, texts } from '../config';
import { graphqlFetchPolicy } from '../helpers';
import { useMatomoTrackScreenView, useRefreshTime } from '../hooks';
import { NetworkContext } from '../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../queries';

const { MATOMO_TRACKING } = consts;

export const LunchScreen = ({ navigation, route }) => {
  const [poiId, setPoiId] = useState(route.params?.poiId);
  const [date, setDate] = useState(moment());
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const refreshTime = useRefreshTime('lunch-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const currentDate = moment(date).format('YYYY-MM-DD');

  const variables = {
    dateRange: [currentDate, currentDate]
  };

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.LUNCHES), {
    fetchPolicy,
    variables,
    skip: !refreshTime
  });

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.LUNCH);

  const onPressNext = useCallback(() => {
    setDate((oldDate) => moment(oldDate).add(1, 'day'));
  }, [setDate]);

  const onPressPrevious = useCallback(() => {
    setDate((oldDate) => moment(oldDate).subtract(1, 'day'));
  }, [setDate]);

  const renderItem = useCallback(
    ({ item }) => <LunchSection lunchOfferData={item} navigation={navigation} />,
    [navigation]
  );

  let lunchData = data?.[QUERY_TYPES.LUNCHES];

  if (poiId) {
    lunchData = lunchData?.filter((item) => item?.pointOfInterest?.id === poiId);
  }

  const ListHeaderComponent = (
    <>
      <ConnectedImagesCarousel
        navigation={navigation}
        publicJsonFile="lunchCarousel"
        refreshTimeKey="publicJsonFile-lunchCarousel"
      />
      <WrapperWithOrientation>
        <Wrapper>
          <WrapperRow>
            <TouchableOpacity
              hitSlop={{ bottom: 12, left: 12, right: 12, top: 12 }}
              onPress={onPressPrevious}
              style={styles.left}
            >
              <Icon.ArrowLeft />
            </TouchableOpacity>
            <BoldText big>{date.format('DD.MM.YYYY')}</BoldText>
            <TouchableOpacity
              hitSlop={{ bottom: 12, left: 12, right: 12, top: 12 }}
              onPress={onPressNext}
              style={styles.right}
            >
              <Icon.ArrowRight />
            </TouchableOpacity>
          </WrapperRow>
        </Wrapper>
      </WrapperWithOrientation>
    </>
  );

  const ListEmptyComponent = (
    <WrapperWithOrientation>
      <Wrapper>
        <RegularText>{texts.lunch.noOffers}</RegularText>
      </Wrapper>
    </WrapperWithOrientation>
  );

  const ListFooterComponent = (
    <Wrapper>
      <Button title={texts.lunch.showAll} onPress={() => setPoiId(undefined)} />
    </Wrapper>
  );

  return (
    <SafeAreaViewFlex>
      <FlatList
        refreshControl={
          <RefreshControl
            // using this refreshing prop causes the loading spinner to animate in from top and
            // push the list down, whenever we change the date
            refreshing={false}
            onRefresh={() => refetch?.()}
            colors={[colors.accent]}
            tintColor={colors.accent}
          />
        }
        data={!loading && lunchData}
        renderItem={renderItem}
        ListEmptyComponent={
          loading || !refreshTime ? <ActivityIndicator color={colors.accent} /> : ListEmptyComponent
        }
        ListHeaderComponent={ListHeaderComponent}
        keyExtractor={(item) => item.id}
        ListFooterComponent={poiId && ListFooterComponent}
      />
    </SafeAreaViewFlex>
  );
};

const styles = StyleSheet.create({
  left: {
    flex: 1,
    marginRight: normalize(12)
  },
  right: {
    flex: 1,
    alignItems: 'flex-end',
    marginLeft: normalize(12)
  }
});

LunchScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
