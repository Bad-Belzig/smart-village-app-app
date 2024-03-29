import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

import { SubQuery } from '../types';

import { Button } from './Button';

// action to open source urls or navigate to sub screens
export const navigateWithSubQuery = ({
  navigation,
  title,
  params,
  rootRouteName,
  subQuery
}: {
  navigation: StackNavigationProp<any, string>;
  title?: string;
  params?: { routeName: string; webUrl: string } | string;
  rootRouteName?: string;
  subQuery: SubQuery;
}) => {
  // if the `params` is a string, it is directly the web url to call
  if (!!params && typeof params === 'string') {
    return navigation.navigate({
      name: 'Web',
      params: {
        rootRouteName,
        title,
        webUrl: params
      }
    });
  }

  // if the `params` is an object, it contains a `routeName` and a `webUrl`
  if (!!params && typeof params === 'object') {
    return navigation.navigate({
      name: params.routeName,
      params: {
        rootRouteName,
        title,
        webUrl: params.webUrl
      }
    });
  }

  const subParams = { ...(subQuery.params ?? {}) };

  // if there is no `params`, use the main `subQuery` values for `routeName` and a `webUrl` or
  // `params` if the params contain a webUrl as well, the webUrl property of the subQuery
  // will be ignored
  return navigation.navigate({
    name: subQuery.routeName,
    params: {
      ...subParams,
      rootRouteName,
      title,
      webUrl: subQuery.webUrl
    }
  });
};

export const MultiButtonWithSubQuery = ({
  navigation,
  rootRouteName,
  subQuery,
  title
}: {
  navigation: StackNavigationProp<any>;
  rootRouteName?: string;
  subQuery: SubQuery;
  title: string;
}) => {
  return (
    <>
      {!!subQuery && !!subQuery.routeName && (!!subQuery.webUrl || subQuery.params) && (
        <Button
          title={subQuery.buttonTitle || `${title} öffnen`}
          onPress={() => navigateWithSubQuery({ navigation, subQuery, rootRouteName, title })}
        />
      )}

      {subQuery?.buttons?.map((button, index) => (
        <Button
          key={`${index}-${button.webUrl}`}
          title={button.buttonTitle || `${title} öffnen`}
          onPress={() =>
            navigateWithSubQuery({
              navigation,
              params: button,
              rootRouteName,
              subQuery,
              title
            })
          }
        />
      ))}
    </>
  );
};
