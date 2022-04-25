import PropTypes from 'prop-types';
import React from 'react';
import { FlatList } from 'react-native';

import { Title, TitleContainer, TitleShadow } from '../../Title';
import { Wrapper, WrapperRow } from '../../Wrapper';
import { device, texts, consts } from '../../../config';

import { ConsulTagListItem } from './ConsulTagListItem';

const a11yText = consts.a11yLabel;

export const ConsulTagList = ({ tags, onPress }) => {
  return (
    <>
      <TitleContainer>
        <Title accessibilityLabel={`(${texts.consul.tags}) ${a11yText.heading}`}>
          {texts.consul.tags}
        </Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}

      <Wrapper>
        <WrapperRow>
          <FlatList
            showsHorizontalScrollIndicator={false}
            horizontal
            data={tags}
            renderItem={({ item, index }) => (
              <ConsulTagListItem onPress={onPress} tagItem={item} index={index} />
            )}
          />
        </WrapperRow>
      </Wrapper>
    </>
  );
};

ConsulTagList.propTypes = {
  tags: PropTypes.array.isRequired,
  onPress: PropTypes.object
};
