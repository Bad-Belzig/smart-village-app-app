import PropTypes from 'prop-types';
import React from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Query } from 'react-apollo';

import { device, normalize } from '../config';
import { CardList, Image, TextList, Title, TitleContainer, TitleShadow } from '../components';
import { getQuery } from '../queries';
import { momentFormat, shareMessage } from '../helpers';

export const HomeScreen = ({ navigation }) => (
  <SafeAreaView>
    <ScrollView>
      <Image source={require('../../assets/images/home.jpg')} />
      <TitleContainer>
        <Title>{'Nachrichten'}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query query={getQuery('newsItems')} variables={{ limit: 3 }} fetchPolicy="cache-and-network">
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const newsItems =
            data &&
            data.newsItems &&
            data.newsItems.map((newsItem) => ({
              id: newsItem.id,
              subtitle: `${momentFormat(newsItem.publishedAt)} | ${newsItem.dataProvider &&
                newsItem.dataProvider.name}`,
              title: newsItem.contentBlocks[0].title,
              routeName: 'Detail',
              params: {
                title: 'Nachricht',
                query: 'newsItem',
                queryVariables: { id: `${newsItem.id}` },
                rootRouteName: 'NewsItems',
                shareContent: {
                  message: shareMessage(newsItem, 'newsItem')
                }
              },
              __typename: newsItem.__typename
            }));

          if (!newsItems.length) return null;

          // add index element, if not already present - check for the element with id: '-1'
          newsItems.map((newsItem) => newsItem.id).indexOf('-1') < 0 &&
            newsItems.push({
              id: '-1',
              title: 'Alle Nachrichten anzeigen',
              routeName: 'Index',
              params: {
                title: 'Nachrichten',
                query: 'newsItems',
                queryVariables: {},
                rootRouteName: 'NewsItems'
              },
              bottomDivider: false
            });

          return <TextList navigation={navigation} data={newsItems} />;
        }}
      </Query>
      <TitleContainer>
        <Title>{'Orte & Routen'}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('pointsOfInterest')}
        variables={{ limit: 10 }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const pointsOfInterest =
            data &&
            data.pointsOfInterest &&
            data.pointsOfInterest.map((pointOfInterest) => ({
              id: pointOfInterest.id,
              name: pointOfInterest.name,
              category: !!pointOfInterest.category && pointOfInterest.category.name,
              image: pointOfInterest.mediaContents[0].sourceUrl.url, // TODO: only if .contentType == "image"
              routeName: 'Detail',
              params: {
                title: 'Ort',
                query: 'pointOfInterest',
                queryVariables: { id: `${pointOfInterest.id}` },
                rootRouteName: 'PointsOfInterest',
                shareContent: {
                  message: shareMessage(pointOfInterest, 'pointOfInterest')
                }
              },
              __typename: pointOfInterest.__typename
            }));

          if (!pointsOfInterest || !pointsOfInterest.length) return null;

          return (
            <View>
              <CardList navigation={navigation} data={pointsOfInterest} horizontal />
              <TextList
                navigation={navigation}
                data={[
                  {
                    id: '-1',
                    title: 'Alle Orte & Routen anzeigen',
                    routeName: 'Index',
                    params: {
                      title: 'Orte & Routen',
                      query: 'pointsOfInterest',
                      queryVariables: {},
                      rootRouteName: 'PointsOfInterest'
                    },
                    bottomDivider: false,
                    topDivider: true
                  }
                ]}
              />
            </View>
          );
        }}
      </Query>
      <TitleContainer>
        <Title>{'Veranstaltungen'}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('eventRecords')}
        variables={{ limit: 3 }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          const eventRecords =
            data &&
            data.eventRecords &&
            data.eventRecords.map((eventRecord) => ({
              id: eventRecord.id,
              subtitle: `${momentFormat(eventRecord.createdAt)} | ${eventRecord.dataProvider &&
                eventRecord.dataProvider.name}`,
              title: eventRecord.title,
              routeName: 'Detail',
              params: {
                title: 'Veranstaltung',
                query: 'eventRecord',
                queryVariables: { id: `${eventRecord.id}` },
                rootRouteName: 'EventRecords',
                shareContent: {
                  message: shareMessage(eventRecord, 'eventRecord')
                }
              },
              __typename: eventRecord.__typename
            }));

          if (!eventRecords.length) return null;

          // add index element, if not already present - check for the element with id: '-1'
          eventRecords.map((eventRecord) => eventRecord.id).indexOf('-1') < 0 &&
            eventRecords.push({
              id: '-1',
              title: 'Alle Veranstaltungen anzeigen',
              routeName: 'Index',
              params: {
                title: 'Veranstaltungen',
                query: 'eventRecords',
                queryVariables: {},
                rootRouteName: 'EventRecords'
              },
              bottomDivider: false
            });

          return <TextList navigation={navigation} data={eventRecords} alternativeLayout />;
        }}
      </Query>
      <TitleContainer>
        <Title>{'Service'}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      <Query
        query={getQuery('publicJsonFile')}
        variables={{ name: 'homeRoutes' }}
        fetchPolicy="cache-and-network"
      >
        {({ data, loading }) => {
          if (loading) {
            return (
              <View style={styles.loadingContainer}>
                <ActivityIndicator />
              </View>
            );
          }

          let publicJsonFileContent =
            data && data.publicJsonFile && JSON.parse(data.publicJsonFile.content);

          if (publicJsonFileContent) {
            return <TextList navigation={navigation} data={publicJsonFileContent} noSubtitle />;
          }
        }}
      </Query>
    </ScrollView>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: normalize(14)
  }
});

HomeScreen.propTypes = {
  navigation: PropTypes.object.isRequired
};
