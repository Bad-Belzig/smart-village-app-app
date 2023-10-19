import { FlashList } from '@shopify/flash-list';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';

import { useRenderItem } from '../hooks';

import { QUERY_TYPES } from '../queries';
import { LoadingSpinner } from './LoadingSpinner';

const keyExtractor = (item, index) => `index${index}-id${item.id}`;

const MAX_INITIAL_NUM_TO_RENDER = 15;

const sectionData = (data) => {
  const groupDataByDate = (data) => {
    const grouped = {};
    data.forEach((item) => {
      if (item.listDate) {
        if (!grouped[item.listDate]) {
          grouped[item.listDate] = [];
        }
        grouped[item.listDate].push(item);
      }
    });
    return grouped;
  };

  const transformGroupedDataToArray = (groupedData) => {
    const resultArray = [];
    for (const date in groupedData) {
      resultArray.push(date);
      resultArray.push(...groupedData[date]);
    }
    return resultArray;
  };

  const groupedByDate = groupDataByDate(data);
  return transformGroupedDataToArray(groupedByDate);
};

export const EventList = ({
  data,
  fetchMoreData,
  ListEmptyComponent,
  ListHeaderComponent,
  navigation,
  noSubtitle,
  queryVariables,
  refreshControl
}) => {
  const [listEndReached, setListEndReached] = useState(false);
  const [sectionedData, setSectionedData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setRefreshing(true);
    setSectionedData(sectionData(data));
    setRefreshing(false);
  }, [data]);

  const onEndReached = async () => {
    if (fetchMoreData) {
      // if there is a pagination, the end of the list is reached, when no more data is returned
      // from partially fetching, so we need to check the data to determine the lists end
      const { data: moreData } = await fetchMoreData();

      setListEndReached(!moreData[QUERY_TYPES.EVENT_RECORDS].length);
    } else {
      setListEndReached(true);
    }
  };

  const renderItem = useRenderItem(QUERY_TYPES.EVENT_RECORDS, navigation, {
    noSubtitle,
    queryVariables
  });

  const stickyHeaderIndices = sectionedData
    .map((item, index) => {
      if (typeof item === 'string') {
        return index;
      } else {
        return null;
      }
    })
    .filter((item) => item !== null);

  return (
    <FlashList
      data={sectionedData}
      refreshing={refreshing}
      estimatedItemSize={MAX_INITIAL_NUM_TO_RENDER}
      keyExtractor={keyExtractor}
      ListFooterComponent={() => {
        if (data?.length >= MAX_INITIAL_NUM_TO_RENDER) {
          return <LoadingSpinner loading={!listEndReached} />;
        }

        return null;
      }}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      refreshControl={refreshControl}
      renderItem={renderItem}
      stickyHeaderIndices={stickyHeaderIndices}
    />
  );
};

EventList.propTypes = {
  data: PropTypes.array,
  fetchMoreData: PropTypes.func,
  ListEmptyComponent: PropTypes.object,
  ListHeaderComponent: PropTypes.object,
  navigation: PropTypes.object,
  noSubtitle: PropTypes.bool,
  query: PropTypes.string,
  queryVariables: PropTypes.object,
  refreshControl: PropTypes.object
};
