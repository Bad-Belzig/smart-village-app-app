import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Icon as RNEIcon } from 'react-native-elements';

import { colors, consts, normalize } from '../../config';
import { mergeWebUrls } from '../../helpers';
import { Address, Contact, OpeningHour, WebUrl } from '../../types';
import { RegularText } from '../Text';
import { InfoBox } from '../Wrapper';

import { AddressSection } from './AddressSection';
import { ContactSection } from './ContactSection';
import { OpenStatus } from './OpenStatus';
import { UrlSection } from './UrlSection';

type WebUrlProps = {
  contact?: Contact;
  contacts?: Contact[];
  webUrls?: WebUrl[];
};

type Props = WebUrlProps & {
  address?: Address;
  addresses?: Address[];
  category?: { name?: string };
  name?: string;
  openingHours?: OpeningHour[];
  openWebScreen: (link: string) => void;
};

/* TODO: add a logic to display info category and url that fit the screen even if long text
         (not yet a problem) */
export const InfoCard = ({
  address,
  addresses,
  category,
  contact,
  contacts,
  name,
  webUrls,
  openingHours,
  openWebScreen
}: Props) => (
  <View>
    {!!name && (
      <InfoBox>
        <RegularText>{name}</RegularText>
      </InfoBox>
    )}

    {!!category && !!category.name && (
      <InfoBox>
        <RNEIcon name="list" type="material" color={colors.primary} iconStyle={styles.margin} />
        <RegularText accessibilityLabel={`${consts.a11yLabel.category} (${category.name})`}>
          {category.name}
        </RegularText>
      </InfoBox>
    )}

    <OpenStatus openingHours={openingHours} />

    <AddressSection address={address} addresses={addresses} openWebScreen={openWebScreen} />

    <ContactSection contact={contact} contacts={contacts} />

    <UrlSection
      openWebScreen={openWebScreen}
      webUrls={mergeWebUrls({ webUrls, contact, contacts })}
    />
  </View>
);

const styles = StyleSheet.create({
  margin: {
    marginRight: normalize(12)
  }
});

InfoCard.propTypes = {
  addresses: PropTypes.array,
  category: PropTypes.object,
  contact: PropTypes.object,
  contacts: PropTypes.array,
  name: PropTypes.string,
  webUrls: PropTypes.array,
  openWebScreen: PropTypes.func
};
