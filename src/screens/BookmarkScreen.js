import PropTypes from 'prop-types';
import React, { useCallback, useState } from 'react';
import { ScrollView } from 'react-native';

import {
  BookmarkSection,
  RegularText,
  SafeAreaViewFlex,
  Wrapper,
  WrapperWithOrientation
} from '../components';
import { consts, texts } from '../config';
import { getKeyFromTypeAndSuffix } from '../helpers';
import { getGenericItemSectionTitle } from '../helpers/genericTypeHelper';
import { useBookmarks, useMatomoTrackScreenView, useNewsCategories } from '../hooks';
import { QUERY_TYPES } from '../queries';
import { GenericType } from '../types';

const { MATOMO_TRACKING } = consts;

const getInitialConnectionState = (categoriesNews) => {
  let initialState = {};
  categoriesNews.forEach(({ categoryId }) => {
    initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.NEWS_ITEMS, categoryId)] = true;
  });
  initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.GENERIC_ITEMS, GenericType.Commercial)] = true;
  initialState[getKeyFromTypeAndSuffix(QUERY_TYPES.GENERIC_ITEMS, GenericType.Job)] = true;
  initialState[QUERY_TYPES.POINTS_OF_INTEREST] = true;
  initialState[QUERY_TYPES.TOURS] = true;

  return initialState;
};

const getBookmarkCount = (bookmarks) => {
  if (!bookmarks) return 0;

  let count = 0;

  for (let key in bookmarks) {
    count += bookmarks[key]?.length ?? 0;
  }
  return count;
};

export const BookmarkScreen = ({ navigation }) => {
  const bookmarks = useBookmarks();
  const categoriesNews = useNewsCategories();
  const [connectionState, setConnectionState] = useState(getInitialConnectionState(categoriesNews));

  const getSection = useCallback(
    (itemType, categoryTitle, suffix, categoryTitleDetail) => {
      const bookmarkKey = getKeyFromTypeAndSuffix(itemType, suffix);

      if (!bookmarks[bookmarkKey]?.length) return null;

      return (
        <BookmarkSection
          bookmarkKey={bookmarkKey}
          suffix={suffix}
          categoryTitleDetail={categoryTitleDetail}
          ids={bookmarks[bookmarkKey]}
          key={bookmarkKey}
          navigation={navigation}
          query={itemType}
          sectionTitle={categoryTitle}
          setConnectionState={setConnectionState}
        />
      );
      // if there are more than three of that category, show "show all" button
    },
    [navigation, bookmarks, setConnectionState]
  );

  useMatomoTrackScreenView(MATOMO_TRACKING.SCREEN_VIEW.BOOKMARKS);

  if (!bookmarks || getBookmarkCount(bookmarks) === 0) {
    return (
      <WrapperWithOrientation>
        <Wrapper>
          <RegularText>{texts.bookmarks.noBookmarksYet}</RegularText>
        </Wrapper>
      </WrapperWithOrientation>
    );
  }

  const connection = Object.keys(connectionState).reduce(
    (previousValue, currentValue) =>
      previousValue && (connectionState[currentValue] || !bookmarks[currentValue]?.length),
    true
  );

  return (
    <SafeAreaViewFlex>
      <ScrollView>
        {!connection && (
          <Wrapper>
            <RegularText>{texts.errors.noData}</RegularText>
          </Wrapper>
        )}
        {categoriesNews?.map(({ categoryId, categoryTitle, categoryTitleDetail }) =>
          getSection(QUERY_TYPES.NEWS_ITEMS, categoryTitle, categoryId, categoryTitleDetail)
        )}
        {getSection(QUERY_TYPES.POINTS_OF_INTEREST, texts.categoryTitles.pointsOfInterest)}
        {getSection(QUERY_TYPES.TOURS, texts.categoryTitles.tours)}
        {getSection(QUERY_TYPES.EVENT_RECORDS, texts.homeTitles.events)}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.Commercial),
          GenericType.Commercial
        )}
        {getSection(
          QUERY_TYPES.GENERIC_ITEMS,
          getGenericItemSectionTitle(GenericType.Job),
          GenericType.Job
        )}
      </ScrollView>
    </SafeAreaViewFlex>
  );
};

BookmarkScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
