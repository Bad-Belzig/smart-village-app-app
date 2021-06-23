import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { FlatList, TouchableOpacity } from 'react-native';

import { BoldText } from '../Text';

import { AZFilterElement } from './AZFilterElement';

export const AZFilter = memo(({ data, setData }) => {
  const selectedData = data.find((entry) => entry.selected) || {};

  return (
    <FlatList
      keyExtractor={(item, index) => `index${index}-id${item.id}`}
      data={data}
      renderItem={({ item, index }) => (
        <TouchableOpacity
          onPress={() => {
            // only trigger onPress if a new selection is made
            if (selectedData.id === item.id) return;

            const updatedData = data.map((entry) => {
              if (entry.id === item.id) {
                entry.selected = true;
              } else {
                entry.selected = false;
              }

              return entry;
            });

            setData(updatedData);
          }}
        >
          <AZFilterElement
            first={index === 0}
            last={index === data.length - 1}
            selected={item.selected}
          >
            <BoldText link={item.selected}>{item.value}</BoldText>
          </AZFilterElement>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      horizontal
      initialNumToRender={data.length}
    />
  );
});

AZFilter.displayName = 'AZFilter';
AZFilter.propTypes = {
  data: PropTypes.array,
  setData: PropTypes.func
};
