import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import moment from 'moment';
import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import { UseFormGetValues, UseFormSetValue } from 'react-hook-form';
import { Alert, StyleSheet, View } from 'react-native';
import { useQuery } from 'react-query';

import { ConfigurationsContext } from '../../../ConfigurationsProvider';
import { device, normalize, texts } from '../../../config';
import { parseListItemsFromQuery } from '../../../helpers';
import {
  useLastKnownPosition,
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../../hooks';
import { QUERY_TYPES, getQuery } from '../../../queries';
import { TValues, mapToMapMarkers } from '../../../screens';
import { MapMarker, ScreenName } from '../../../types';
import { LoadingSpinner } from '../../LoadingSpinner';
import { RegularText } from '../../Text';
import { Wrapper, WrapperHorizontal } from '../../Wrapper';
import { Input } from '../../form';
import { Map } from '../../map';
import { getLocationMarker } from '../../settings';

enum SueStatus {
  IN_PROCESS = 'TICKET_STATUS_IN_PROCESS',
  INVALID = 'TICKET_STATUS_INVALID',
  OPEN = 'TICKET_STATUS_OPEN',
  WAIT_REQUESTOR = 'TICKET_STATUS_WAIT_REQUESTOR',
  WAIT_THIRDPARTY = 'TICKET_STATUS_WAIT_THIRDPARTY'
}

export const useReverseGeocode = () => {
  return useCallback(
    async ({
      areaServiceData,
      errorMessage,
      position,
      setValue
    }: {
      areaServiceData: { postalCodes: string[] } | undefined;
      errorMessage: string;
      position: { latitude: number; longitude: number };
      setValue: UseFormSetValue<TValues>;
    }) => {
      const { latitude, longitude } = position;

      try {
        const response = await (
          await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
        ).json();

        const city = response?.address?.city || '';
        const houseNumber = response?.address?.house_number || '';
        const street = response?.address?.road || '';
        const zipCode = response?.address?.postcode || '';

        if (!areaServiceData?.postalCodes?.includes(zipCode)) {
          setValue('city', '');
          setValue('houseNumber', '');
          setValue('street', '');
          setValue('zipCode', '');

          throw new Error(errorMessage);
        }

        setValue('city', city);
        setValue('houseNumber', houseNumber);
        setValue('street', street);
        setValue('zipCode', zipCode);
      } catch (error) {
        throw new Error(error.message);
      }
    },
    []
  );
};

/* eslint-disable complexity */
export const SueReportLocation = ({
  areaServiceData,
  control,
  errorMessage,
  getValues,
  requiredInputs,
  selectedPosition,
  setSelectedPosition,
  setValue
}: {
  areaServiceData: { postalCodes: string[] } | undefined;
  control: any;
  errorMessage: string;
  getValues: UseFormGetValues<TValues>;
  requiredInputs: keyof TValues[];
  selectedPosition: Location.LocationObjectCoords | undefined;
  setSelectedPosition: (position: Location.LocationObjectCoords | undefined) => void;
  setValue: UseFormSetValue<TValues>;
}) => {
  const reverseGeocode = useReverseGeocode();
  const navigation = useNavigation();
  const { locationSettings } = useLocationSettings();
  const systemPermission = useSystemPermission();
  const { appDesignSystem = {} } = useContext(ConfigurationsContext);
  const { sueStatus = {} } = appDesignSystem;
  const { statusViewColors = {}, statusTextColors = {} } = sueStatus;
  const now = moment();

  const { position } = usePosition(systemPermission?.status !== Location.PermissionStatus.GRANTED);
  const { position: lastKnownPosition } = useLastKnownPosition(
    systemPermission?.status !== Location.PermissionStatus.GRANTED
  );
  const [updatedRegion, setUpdatedRegion] = useState(false);

  const streetInputRef = useRef();
  const houseNumberInputRef = useRef();
  const zipCodeInputRef = useRef();
  const cityInputRef = useRef();

  const queryVariables = {
    start_date: '1900-01-01T00:00:00+01:00',
    status: Object.values(SueStatus).map((status) => status)
  };

  const { data, isLoading } = useQuery(
    [QUERY_TYPES.SUE.REQUESTS, queryVariables],
    () => getQuery(QUERY_TYPES.SUE.REQUESTS)(queryVariables),
    {
      cacheTime: moment().endOf('day').diff(now) // end of day
    }
  );

  const mapMarkers = useMemo(
    () =>
      mapToMapMarkers(
        parseListItemsFromQuery(QUERY_TYPES.SUE.REQUESTS_WITH_SERVICE_REQUEST_ID, data, undefined, {
          appDesignSystem
        }),
        statusViewColors,
        statusTextColors
      ) || [],
    [data]
  );

  const geocode = useCallback(async () => {
    const { street, houseNumber, zipCode, city } = getValues();

    if (!street || !zipCode || !city) {
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&street=${street}+${houseNumber}&city=${city}&country=germany&postalcode=${zipCode}`
      );

      const data = await response.json();
      const latitude = data?.[0]?.lat;
      const longitude = data?.[0]?.lon;

      if (latitude && longitude) {
        setUpdatedRegion(true);
        setSelectedPosition({ latitude: Number(latitude), longitude: Number(longitude) });
      }
    } catch (error) {
      console.error('Geocoding Error:', error);
    }
  }, []);

  const handleGeocode = async (position: { latitude: number; longitude: number }) => {
    try {
      await reverseGeocode({
        areaServiceData,
        errorMessage,
        position,
        setValue
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };

  if (!systemPermission) {
    return <LoadingSpinner loading />;
  }

  const { alternativePosition, defaultAlternativePosition } = locationSettings || {};
  const baseLocationMarker = {
    iconName: 'location'
  };

  let locations = mapMarkers as MapMarker[];
  let mapCenterPosition = {} as { latitude: number; longitude: number };

  if (selectedPosition) {
    locations = [...mapMarkers, { ...baseLocationMarker, position: selectedPosition }];
  }

  if (alternativePosition) {
    mapCenterPosition = getLocationMarker(alternativePosition).position;
  } else if (defaultAlternativePosition) {
    mapCenterPosition = getLocationMarker(defaultAlternativePosition).position;
  }

  if (isLoading) {
    return <LoadingSpinner loading />;
  }

  return (
    <View style={styles.container}>
      <WrapperHorizontal>
        <Map
          calloutTextEnabled
          isMaximizeButtonVisible
          isMyLocationButtonVisible
          locations={locations}
          mapCenterPosition={mapCenterPosition}
          mapStyle={styles.map}
          onMyLocationButtonPress={() =>
            Alert.alert(texts.sue.report.alerts.hint, texts.sue.report.alerts.myLocation, [
              {
                text: texts.sue.report.alerts.no
              },
              {
                text: texts.sue.report.alerts.yes,
                onPress: async () => {
                  const location = position || lastKnownPosition;

                  if (location) {
                    setUpdatedRegion(true);
                    setSelectedPosition(location.coords);

                    try {
                      await handleGeocode(location.coords);
                    } catch (error) {
                      setSelectedPosition(undefined);
                      Alert.alert(texts.sue.report.alerts.hint, error.message);
                    }
                  }
                }
              }
            ])
          }
          onMapPress={async ({ nativeEvent }) => {
            if (
              nativeEvent.action !== 'marker-press' &&
              nativeEvent.action !== 'callout-inside-press'
            ) {
              setUpdatedRegion(false);
              setSelectedPosition(nativeEvent.coordinate);

              try {
                await handleGeocode(nativeEvent.coordinate);
              } catch (error) {
                setSelectedPosition(undefined);
                Alert.alert(texts.sue.report.alerts.hint, error.message);
              }
            }
          }}
          onMaximizeButtonPress={() => navigation.navigate(ScreenName.MapView, { locations })}
          updatedRegion={
            !!selectedPosition && updatedRegion
              ? { ...selectedPosition, latitudeDelta: 0.01, longitudeDelta: 0.01 }
              : undefined
          }
        />
      </WrapperHorizontal>

      <Wrapper>
        <RegularText small>{texts.sue.report.mapHint}</RegularText>
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="street"
          label={`${texts.sue.report.street} ${requiredInputs?.includes('street') ? '*' : ''}`}
          placeholder={texts.sue.report.street}
          textContentType="streetAddressLine1"
          control={control}
          onChange={geocode}
          ref={streetInputRef}
          onSubmitEditing={() => houseNumberInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="houseNumber"
          label={`${texts.sue.report.houseNumber} ${
            requiredInputs?.includes('houseNumber') ? '*' : ''
          }`}
          placeholder={texts.sue.report.houseNumber}
          textContentType="off"
          control={control}
          onChange={geocode}
          ref={houseNumberInputRef}
          onSubmitEditing={() => zipCodeInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="zipCode"
          label={`${texts.sue.report.zipCode} ${requiredInputs?.includes('zipCode') ? '*' : ''}`}
          placeholder={texts.sue.report.zipCode}
          maxLength={5}
          keyboardType="numeric"
          textContentType="postalCode"
          control={control}
          onChange={geocode}
          ref={zipCodeInputRef}
          onSubmitEditing={() => cityInputRef.current?.focus()}
        />
      </Wrapper>

      <Wrapper style={styles.noPaddingTop}>
        <Input
          name="city"
          label={`${texts.sue.report.city} ${requiredInputs?.includes('city') ? '*' : ''}`}
          placeholder={texts.sue.report.city}
          control={control}
          textContentType="addressCity"
          onChange={geocode}
          ref={cityInputRef}
        />
      </Wrapper>
    </View>
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  container: {
    paddingTop: normalize(14),
    width: '100%'
  },
  map: {
    width: device.width - 2 * normalize(14)
  },
  noPaddingTop: {
    paddingTop: 0
  }
});
