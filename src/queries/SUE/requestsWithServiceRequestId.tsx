import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { sueFetchObj, sueRequestsUrlWithServiceId } from '../../helpers';

export const requestsWithServiceRequestId = async (serviceRequestId: number) => {
  const response = await (
    await fetch(`${sueRequestsUrlWithServiceId(serviceRequestId)}`, sueFetchObj)
  ).json();

  // convert media_url to JSON, as it is returned as a string by the API
  if (response?.media_url) {
    response.media_url = JSON.parse(response.media_url);
  }

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(_mapKeys(response, (value, key) => _camelCase(key)));
  });
};
