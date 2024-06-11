import { useFocusEffect } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';
import { useQuery as RQuseQuery } from 'react-query';

import {
  Button,
  EmptyMessage,
  ListComponent,
  LoadingContainer,
  LoginModal,
  navigateWithSubQuery,
  NoticeboardCategoryTabs,
  SafeAreaViewFlex,
  Wrapper
} from '../../components';
import { colors, Icon, normalize, texts } from '../../config';
import {
  graphqlFetchPolicy,
  parseListItemsFromQuery,
  profileAuthToken,
  profileUserData,
  storeProfileAuthToken,
  storeProfileUserData
} from '../../helpers';
import { useStaticContent } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { member } from '../../queries/profile';
import { ProfileMember } from '../../types';
import { ListHeaderComponent } from '../NestedInfoScreen';
import { ProfileUpdateScreen } from '../profile';

/* eslint-disable complexity */
export const NoticeboardIndexScreen = ({ navigation, route }: StackScreenProps<any>) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });
  const [refreshing, setRefreshing] = useState(false);
  const [isProfileLoggedIn, setIsProfileLoggedIn] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [userData, setUserData] = useState<ProfileMember | null>(null);

  const isLoginRequired = route.params?.isLoginRequired || false;
  const content = route.params?.content ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};
  const subQuery = route.params?.subQuery ?? '';
  const rootRouteName = route.params?.rootRouteName ?? '';
  const categoryIds = queryVariables?.categoryIds ?? [];
  const currentMember = queryVariables?.currentMember ?? false;

  const [selectedCategory, setSelectedCategory] = useState<number>();

  const { isLoading: isLoadingMember } = RQuseQuery(QUERY_TYPES.PROFILE.MEMBER, member, {
    enabled: isLoginRequired && isProfileLoggedIn,
    onSuccess: (responseData: ProfileMember) => {
      if (!responseData?.member || !responseData?.member?.keycloak_refresh_token) {
        storeProfileAuthToken();

        return;
      }

      storeProfileUserData(responseData);
    }
  });

  const { data, loading, refetch } = useQuery(getQuery(query), {
    fetchPolicy,
    skip: !isProfileLoggedIn,
    variables: queryVariables
  });

  const listItems = parseListItemsFromQuery(query, data, '', {
    queryVariables,
    subQuery
  });

  // create new object of list items filtered by selected category
  const filteredListItems = listItems?.filter((item: { categories: { id: string }[] }) =>
    item.categories.some((category: { id: string }) => category.id == selectedCategory)
  );

  // get all category names from list items
  const categoryNames = listItems?.reduce((acc, item) => {
    if (item.categories.length) {
      acc[item.categories[0].id] = item.categories[0].name;
    }

    return acc;
  }, {});

  // filter out the category ids
  const categoryIdsTabs = categoryIds?.filter((categoryId: number) => !!categoryNames[categoryId]);

  const {
    data: dataHtml,
    loading: loadingHtml,
    refetch: refetchHtml
  } = useStaticContent<string>({
    name: content,
    type: 'html',
    skip: !content
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await refetch?.();
      await refetchHtml?.();
    }
    setRefreshing(false);
  }, [isConnected, refetch]);

  useFocusEffect(
    useCallback(() => {
      const getLoginStatus = async () => {
        setIsLoginLoading(true);
        const storedProfileAuthToken = await profileAuthToken();
        const { currentUserData } = await profileUserData();

        setIsProfileLoggedIn(!!storedProfileAuthToken);
        setUserData(currentUserData);
        setIsLoginLoading(false);
      };

      !isLoadingMember && getLoginStatus();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      // if there are no filtered list items for the selected category, select the other category
      if (
        !loading &&
        !filteredListItems?.filter((item: any) => !item.component)?.length &&
        !!categoryIdsTabs?.length
      ) {
        setSelectedCategory(
          categoryIdsTabs.find((categoryId: number) => categoryId != selectedCategory)
        );
      }
    }, [loading, filteredListItems, selectedCategory, categoryIdsTabs])
  );

  // add the section header component to the beginning of the list items, that will be at index 1,
  // that we want to stick to the top of the screen when scrolling
  !!categoryIdsTabs?.length &&
    filteredListItems?.unshift({
      component: (
        <NoticeboardCategoryTabs
          categoryIdsTabs={categoryIdsTabs}
          categoryNames={categoryNames}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
      )
    });

  if (userData && userData.member && !Object.keys(userData.member.preferences).length) {
    return <ProfileUpdateScreen navigation={navigation} route={route} />;
  }

  if (isLoginLoading || (loading && !filteredListItems?.length)) {
    return (
      <LoadingContainer>
        <ActivityIndicator color={colors.refreshControl} />
      </LoadingContainer>
    );
  }

  if (!categoryIdsTabs?.length) {
    return (
      <SafeAreaViewFlex>
        <EmptyMessage title={texts.noticeboard.emptyTitle} />
        {!!subQuery && !!subQuery.routeName && !!subQuery.params && (
          <>
            <Divider style={styles.divider} />
            <Wrapper style={styles.noPaddingBotton}>
              <Button
                icon={<Icon.PencilPlus size={normalize(24)} />}
                iconPosition="left"
                title={subQuery.buttonTitle}
                onPress={() =>
                  navigateWithSubQuery({
                    navigation,
                    subQuery,
                    rootRouteName,
                    title: subQuery?.buttonTitle
                  })
                }
              />
            </Wrapper>
          </>
        )}

        {isLoginRequired && !isProfileLoggedIn && (
          <LoginModal publicJsonFile="loginModal" navigation={navigation} />
        )}
      </SafeAreaViewFlex>
    );
  }

  return (
    <SafeAreaViewFlex>
      <ListComponent
        data={filteredListItems}
        ListHeaderComponent={
          !currentMember ? (
            <ListHeaderComponent html={dataHtml} loading={loadingHtml} navigation={navigation} />
          ) : (
            <View />
          )
        }
        navigation={navigation}
        query={query}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.refreshControl]}
            tintColor={colors.refreshControl}
          />
        }
        stickyHeaderIndices={[1]}
      />
      {!!subQuery && !!subQuery.routeName && !!subQuery.params && (
        <>
          <Divider style={styles.divider} />
          <Wrapper style={styles.noPaddingBotton}>
            <Button
              icon={<Icon.PencilPlus />}
              iconPosition="left"
              title={subQuery.buttonTitle}
              onPress={() =>
                navigateWithSubQuery({
                  navigation,
                  subQuery,
                  rootRouteName,
                  title: subQuery?.buttonTitle
                })
              }
            />
          </Wrapper>
        </>
      )}
      {isLoginRequired && !isProfileLoggedIn && (
        <LoginModal publicJsonFile="loginModal" navigation={navigation} />
      )}
    </SafeAreaViewFlex>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  divider: {
    backgroundColor: colors.placeholder
  },
  noPaddingBotton: {
    paddingBottom: 0
  }
});
