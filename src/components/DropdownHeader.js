import _uniqBy from 'lodash/uniqBy';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { texts } from '../config';
import { usePermanentFilter } from '../hooks';
import { QUERY_TYPES } from '../queries';

import { DropdownSelect } from './DropdownSelect';
import { Wrapper } from './Wrapper';

export const DropdownHeader = ({ query, queryVariables, data, updateListData }) => {
  const dropdownLabel = {
    [QUERY_TYPES.EVENT_RECORDS]: texts.categoryFilter.category,
    [QUERY_TYPES.NEWS_ITEMS]: texts.categoryFilter.dataProvider
  }[query];

  const { state: excludedDataProviders } = usePermanentFilter();

  const dropdownInitialData = useCallback(() => {
    switch (query) {
      case QUERY_TYPES.EVENT_RECORDS:
        return data?.categories?.length
          ? _uniqBy(data.categories, 'name')
              .filter((category) => !!category.upcomingEventRecordsCount)
              .map((category, index) => ({
                index: index + 1,
                id: category.id,
                value: category.name,
                selected: category.id === queryVariables.categoryId
              }))
          : [];
      case QUERY_TYPES.NEWS_ITEMS: {
        const filteredDataProviders = data?.dataProviders?.filter(
          (dataProvider) => !excludedDataProviders.includes(dataProvider.id)
        );

        return filteredDataProviders?.length
          ? _uniqBy(filteredDataProviders, 'name').map((dataProvider, index) => ({
              index: index + 1,
              value: dataProvider.name,
              selected: dataProvider.name === queryVariables.dataProvider
            }))
          : [];
      }
      default:
        return [];
    }
  }, [query, queryVariables, data, updateListData, excludedDataProviders]);

  // check if there is something set in the certain `queryVariables`
  // if not, - Alle - will be selected in the `dropdownData`
  const selectedInitial = {
    [QUERY_TYPES.EVENT_RECORDS]: !queryVariables.categoryId,
    [QUERY_TYPES.NEWS_ITEMS]: !queryVariables.dataProvider
  }[query];
  const selectedKey = {
    [QUERY_TYPES.EVENT_RECORDS]: 'id',
    [QUERY_TYPES.NEWS_ITEMS]: 'value'
  }[query];

  const [dropdownData, setDropdownData] = useState([
    {
      index: 0,
      value: '- Alle -',
      selected: selectedInitial
    }
  ]);

  // https://medium.com/swlh/prevent-useeffects-callback-firing-during-initial-render-the-armchair-critic-f71bc0e03536
  const initialRender = useRef(true);

  const selectedDropdownData = dropdownData?.find((entry) => entry.selected);

  useEffect(() => {
    setDropdownData((oldDropdownData) => [...oldDropdownData, ...dropdownInitialData()]);
  }, [query]);

  // influence list data when changing selected dropdown value
  // call update of the list with the selected data provider
  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
    } else {
      // do not pass the value, if the index is 0, because we do not want to use "- Alle -"
      // inside of updateListData
      updateListData(!!selectedDropdownData.index && selectedDropdownData[selectedKey]);
    }
  }, [selectedDropdownData?.value]);

  // do not show a filter, if there is just one entry (Alle + Item = 2)
  if (dropdownData.length <= 2) return null;

  return (
    <Wrapper>
      <DropdownSelect data={dropdownData} setData={setDropdownData} label={dropdownLabel} />
    </Wrapper>
  );
};

DropdownHeader.propTypes = {
  query: PropTypes.string.isRequired,
  queryVariables: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  updateListData: PropTypes.func.isRequired
};
