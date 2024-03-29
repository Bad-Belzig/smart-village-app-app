import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { useQuery } from 'react-apollo';

import { useHomeRefresh, useVolunteerData } from '../hooks';
import { getQuery, QUERY_TYPES } from '../queries';

import { DataListSection } from './DataListSection';

type Props = {
  title: string;
  titleDetail?: string;
  buttonTitle: string;
  fetchPolicy:
    | 'cache-first'
    | 'network-only'
    | 'cache-only'
    | 'no-cache'
    | 'standby'
    | 'cache-and-network';
  navigate: () => void;
  navigation: StackNavigationProp<any>;
  placeholder?: React.ReactElement;
  query: string;
  queryVariables: { limit?: number };
  showVolunteerEvents?: boolean;
};

export const HomeSection = ({
  buttonTitle,
  title,
  titleDetail,
  fetchPolicy,
  navigate,
  navigation,
  placeholder,
  query,
  queryVariables,
  showVolunteerEvents = false
}: Props) => {
  const { data, loading: isLoading, refetch } = useQuery(getQuery(query), {
    variables: queryVariables,
    fetchPolicy
  });

  const isCalendarWithVolunteerEvents = query === QUERY_TYPES.EVENT_RECORDS && showVolunteerEvents;

  const {
    data: dataVolunteerEvents,
    isLoading: isLoadingVolunteerEvents = false,
    refetch: refetchVolunteerEvents
  } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryOptions: { enabled: isCalendarWithVolunteerEvents },
    isCalendar: isCalendarWithVolunteerEvents,
    isSectioned: false
  });

  useHomeRefresh(() => {
    refetch();
    isCalendarWithVolunteerEvents && refetchVolunteerEvents();
  });

  let showButton = !!data?.[query]?.length;

  if (query === QUERY_TYPES.POINTS_OF_INTEREST_AND_TOURS) {
    showButton =
      !!data?.[QUERY_TYPES.POINTS_OF_INTEREST]?.length || !!data?.[QUERY_TYPES.TOURS]?.length;
  }

  const loading = isLoading || isLoadingVolunteerEvents;
  const additionalData = isCalendarWithVolunteerEvents ? dataVolunteerEvents : undefined;

  return (
    <DataListSection
      buttonTitle={buttonTitle}
      limit={queryVariables?.limit}
      loading={loading}
      navigate={navigate}
      navigateButton={navigate}
      navigation={navigation}
      placeholder={placeholder}
      query={query}
      sectionData={data}
      additionalData={additionalData}
      sectionTitle={title}
      sectionTitleDetail={titleDetail}
      showButton={showButton}
    />
  );
};
