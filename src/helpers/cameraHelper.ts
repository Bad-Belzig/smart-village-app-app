import { Camera } from 'expo-camera';

import { AcceptedRatio } from '../types';

import { sleep } from './promiseHelper';
import { readFromStore } from './storageHelper';

import { addToStore } from '.';

const SCANNER_ASPECT_RATIO = 'SCANNER_ASPECT_RATIO';

// a retry is needed because sometimes the device needs a short moment before the camera is fully launched.
// if after there is still no result after the retries there might be another error, and we fall back to 1:1 instead of possibly retrying infinitely
export const getBestSupportedRatioWithRetry = async (cameraRef: Camera): Promise<AcceptedRatio> => {
  const storedAspectRatio = await readFromStore(SCANNER_ASPECT_RATIO);

  if (storedAspectRatio) {
    return storedAspectRatio;
  }

  let ratioArray: string[] | undefined = undefined;
  let retryCount = 0;

  while (retryCount < 3 && !ratioArray) {
    try {
      ratioArray = await cameraRef.getSupportedRatiosAsync();
    } catch (e) {
      console.warn(e);
      sleep(50);
      retryCount++;
    }
  }

  let result: AcceptedRatio = '1:1';

  getBestValue: {
    if (ratioArray?.includes('1:1')) {
      result = '1:1';
      break getBestValue;
    }
    if (ratioArray?.includes('4:3')) {
      result = '4:3';
      break getBestValue;
    }
    if (ratioArray?.includes('3:2')) {
      result = '3:2';
      break getBestValue;
    }
    if (ratioArray?.includes('16:9')) {
      result = '16:9';
      break getBestValue;
    }
  }

  if (ratioArray?.length) {
    // only store the result if we got a response from 'getSupportedRatiosAsync'
    await addToStore(SCANNER_ASPECT_RATIO, result);
  }
  return result;
};

export const getNumericalRatioFromAspectRatio = (ratioAsString: AcceptedRatio) => {
  switch (ratioAsString) {
    case '16:9':
      return 9 / 16;
    case '3:2':
      return 2 / 3;
    case '4:3':
      return 3 / 4;
    default:
      return 1;
  }
};
