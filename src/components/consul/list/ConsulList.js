import PropTypes from 'prop-types';
import React from 'react';
import { SectionList, View } from 'react-native';

import { SectionHeader } from '../../SectionHeader';

import { ConsulListItem } from './ConsulListItem';

const renderSectionHeader = ({ section: { title, data } }) => {
  if (!data?.length) return null;

  return (
    <View>
      <SectionHeader title={title} />
    </View>
  );
};

export const ConsulList = ({ data, navigation }) => {
  return (
    <SectionList
      sections={data}
      keyExtractor={(item, index) => item + index}
      renderItem={({ item }) => <ConsulListItem item={item} navigation={navigation} />}
      renderSectionHeader={renderSectionHeader}
    />
  );
};

ConsulList.propTypes = {
  data: PropTypes.array.isRequired,
  navigation: PropTypes.object.isRequired
};
