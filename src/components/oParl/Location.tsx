import { StackNavigationProp } from '@react-navigation/stack';
import { isString } from 'lodash';
import React from 'react';
import { MapMarker } from 'react-native-webview-leaflet';

import { colors, texts } from '../../config';
import { location, locationIconAnchor } from '../../icons';
import { isFeature, isFeatureCollection, isMultiPoint, isPoint } from '../../jsonValidation';
import { LocationData } from '../../types';
import { WebViewMap } from '../map';
import { WrapperHorizontal } from '../Wrapper';

import { Row, SimpleRow } from './Row';
import {
  KeywordSection,
  ModifiedSection,
  OParlPreviewSection,
  WebRepresentation
} from './sections';

type Props = {
  data: LocationData;
  navigation: StackNavigationProp<any>;
};

const locationTexts = texts.oparl.location;

const getMapMarkers = (geoJson: unknown): MapMarker[] => {
  if (isPoint(geoJson) && geoJson.coordinates.length > 1) {
    return [
      {
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        position: {
          lat: geoJson.coordinates[1],
          lng: geoJson.coordinates[0]
        }
      }
    ];
  } else if (isMultiPoint(geoJson) && geoJson.coordinates.length) {
    const { coordinates } = geoJson;

    return coordinates
      .filter((entry) => entry.length > 1)
      .map((entry) => ({
        icon: location(colors.primary),
        iconAnchor: locationIconAnchor,
        position: {
          lat: entry[1],
          lng: entry[0]
        }
      }));
  } else if (isFeature(geoJson)) {
    return getMapMarkers(geoJson.geometry);
  } else if (isFeatureCollection(geoJson)) {
    return geoJson.features.reduce(
      (accumulated: MapMarker[], current) => accumulated.concat(getMapMarkers(current)),
      []
    );
  } else {
    return [];
  }
};

export const Location = ({ data, navigation }: Props) => {
  const {
    bodies,
    created,
    deleted,
    description,
    geoJson,
    keyword,
    license,
    locality,
    meeting,
    meetings,
    modified,
    organization,
    organizations,
    papers,
    persons,
    postalCode,
    room,
    streetAddress,
    subLocality,
    web
  } = data;

  let localityString: string | undefined;

  if (locality) {
    if (subLocality) {
      localityString = `${locality} (${subLocality})`;
    } else {
      localityString = locality;
    }
  } else {
    localityString = subLocality;
  }

  let mapMarkers: MapMarker[] = [];
  try {
    if (isString(geoJson)) {
      mapMarkers = getMapMarkers(JSON.parse(geoJson));
    }
  } catch (e) {
    console.warn('Error while parsing GeoJson:', e);
  }

  return (
    <>
      <Row fullText left={locationTexts.streetAddress} right={streetAddress} />
      <Row fullText left={locationTexts.postalCode} right={postalCode} />
      <Row fullText left={locationTexts.locality} right={localityString} />
      <Row fullText left={locationTexts.room} right={room} />
      {!!mapMarkers.length && <WebViewMap locations={mapMarkers} />}
      <OParlPreviewSection
        data={meetings ?? meeting}
        header={locationTexts.meeting}
        navigation={navigation}
      />
      <OParlPreviewSection data={bodies} header={locationTexts.bodies} navigation={navigation} />
      <OParlPreviewSection
        data={organizations ?? organization}
        header={locationTexts.organization}
        navigation={navigation}
      />
      <OParlPreviewSection data={persons} header={locationTexts.persons} navigation={navigation} />
      <OParlPreviewSection data={papers} header={locationTexts.papers} navigation={navigation} />
      <WrapperHorizontal>
        <SimpleRow fullText left={locationTexts.description} right={description} />
        <KeywordSection keyword={keyword} />
        <SimpleRow fullText left={locationTexts.license} right={license} />
        <WebRepresentation name={locationTexts.location} navigation={navigation} web={web} />
        <ModifiedSection created={created} deleted={deleted} modified={modified} />
      </WrapperHorizontal>
    </>
  );
};
