import {
  launchCameraAsync,
  launchImageLibraryAsync,
  MediaTypeOptions,
  PermissionStatus,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync
} from 'expo-image-picker';
import {
  addAssetsToAlbumAsync,
  createAlbumAsync,
  createAssetAsync,
  getAlbumAsync,
  requestPermissionsAsync
} from 'expo-media-library';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import appJson from '../../app.json';
import { texts } from '../config';

const saveImageToGallery = async (uri: string) => {
  const { status } = await requestPermissionsAsync();
  const appName = appJson.expo.name;

  if (status !== PermissionStatus.GRANTED) {
    return;
  }

  try {
    const asset = await createAssetAsync(uri);
    const album = await getAlbumAsync(appName);

    if (!album) {
      await createAlbumAsync(appName, asset, true);
    } else {
      await addAssetsToAlbumAsync([asset], album, true);
    }
  } catch (error) {
    console.error(error);
  }
};

export const useSelectImage = ({
  allowsEditing = false,
  aspect,
  mediaTypes = MediaTypeOptions.Images,
  onChange,
  quality = 1
}: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: MediaTypeOptions;
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>;
  quality?: number;
}) => {
  const [imageUri, setImageUri] = useState<string>();

  const selectImage = useCallback(async () => {
    const { status } = await requestMediaLibraryPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.body);
      return;
    }

    // this allows for proper selecting and cropping to 1:1 images (and not videos)
    // for more details about options see: https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
    const result = await launchImageLibraryAsync({
      allowsEditing,
      aspect,
      mediaTypes,
      quality
    });

    if (!result.canceled) {
      onChange ? onChange(setImageUri)(result.assets[0].uri) : setImageUri(result.assets[0].uri);
      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, selectImage };
};

export const useCaptureImage = ({
  allowsEditing = false,
  aspect,
  mediaTypes = MediaTypeOptions.Images,
  onChange,
  quality = 1,
  saveImage = false
}: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  mediaTypes?: MediaTypeOptions;
  onChange?: <T>(
    setter: React.Dispatch<React.SetStateAction<T>>
  ) => React.Dispatch<React.SetStateAction<T>>;
  quality?: number;
  saveImage?: boolean;
}) => {
  const [imageUri, setImageUri] = useState<string>();

  const captureImage = useCallback(async () => {
    const { status } = await requestCameraPermissionsAsync();

    if (status !== PermissionStatus.GRANTED) {
      Alert.alert(texts.errors.image.title, texts.errors.image.body);
      return;
    }

    // this allows for proper selecting and cropping to 1:1 images (and not videos)
    // for more details about options see: https://docs.expo.dev/versions/latest/sdk/imagepicker/#imagepickermediatypeoptions
    const result = await launchCameraAsync({
      allowsEditing,
      aspect,
      mediaTypes,
      quality
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      onChange ? onChange(setImageUri)(uri) : setImageUri(uri);

      if (saveImage) {
        await saveImageToGallery(uri);
      }

      return result.assets[0];
    }
  }, [onChange]);

  return { imageUri, captureImage };
};
