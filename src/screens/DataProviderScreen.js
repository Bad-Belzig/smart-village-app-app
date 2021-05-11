import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView } from 'react-native';

import { CrossData, HeaderLeft, Logo, RegularText, Wrapper } from '../components';
import { texts } from '../config';

export const DataProviderScreen = ({ navigation, route }) => {
  const dataProviderName = route.params?.dataProviderName ?? '';
  const logo = route.params?.logo ?? '';

  if (!dataProviderName) {
    return (
      <Wrapper>
        <RegularText>{texts.errors.unexpected}</RegularText>
      </Wrapper>
    );
  }

  return (
    <ScrollView>
      {!!logo && (
        <Wrapper>
          <Logo source={{ uri: logo }} />
        </Wrapper>
      )}

      <CrossData dataProviderName={dataProviderName} navigation={navigation} />
    </ScrollView>
  );
};

// FIXME: Nav
// DataProviderScreen.navigationOptions = ({ navigation }) => {
//   return {
//     headerLeft: <HeaderLeft navigation={navigation} />
//   };
// };

DataProviderScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired
};
