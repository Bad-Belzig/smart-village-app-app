import _remove from 'lodash/remove';
import moment from 'moment';
import { extendMoment } from 'moment-range';

const extendedMoment = extendMoment(moment);

type TTextures = Array<{ size: number; stable: boolean; title: string; type: string; uri: string }>;
type TModels = Array<{
  position?: number[];
  rotation?: number[];
  scale?: number[];
  size?: number;
  title?: string;
  type: string;
  uri: string;
}>;
type TScenes = {
  localUris: Array<{
    models?: TModels;
    stable?: boolean;
    textures?: TTextures;
    type?: string;
    uri?: string;
  }>;
};
type TGenerator = { startDate?: Date; timePeriodInDays?: number; scenes: Array<TScenes> };

/**
 * index creation function for model and texture
 *
 * @param {string} startDate           start date of the model
 * @param {number} timePeriodInDays    time period in days of the model
 * @param {array}  scenes              array of models
 *
 * @return {object} both parsed values as an object, like { modelIndex: 1, textureIndex: 1 }
 */
export const multipleSceneIndexGenerator = ({
  scenes,
  startDate,
  timePeriodInDays
}: TGenerator) => {
  let modelIndex = 0;
  const scenesCount = scenes?.length;
  let localUris = scenes?.[modelIndex]?.localUris;
  const models: TModels = [];
  const textures: TTextures = [];

  // if we have multiple scenes, we want to calculate the model and texture based on the current day
  // compared to the `startDate`
  if (scenesCount > 1 && startDate && timePeriodInDays) {
    // all models must have the same number of variable textures. therefore, in order to obtain the
    // number of textures, the textures of the first model were calculated.
    let variableTextures = scenes[0]?.localUris?.filter(
      ({ type, stable }) => type === 'texture' && !stable
    );
    const variableTexturesCount = variableTextures?.length;

    const today = new Date();
    // the current day number is the number of running days since the given start date
    const currentDayNumber = extendedMoment.range(startDate, today).diff('days');
    const texture = Math.floor(currentDayNumber / timePeriodInDays);
    const model = Math.floor(texture / variableTexturesCount);
    modelIndex = model % scenesCount;

    // When VariableTextures are created, they are created according to index 0 of the scene array.
    // Once the modelIndex is found, it must be updated to select the correct texture file.
    variableTextures = scenes[modelIndex]?.localUris?.filter(
      ({ type, stable }) => type === 'texture' && !stable
    );
    localUris = scenes?.[modelIndex]?.localUris;
    const textureIndex = texture % variableTexturesCount;
    const variableTexture = variableTextures[textureIndex];

    localUris.forEach((item) => {
      switch (item.type) {
        case 'vrx':
          models.push(item as TModels[0]);
          break;
        case 'texture':
          if (item.stable) {
            textures.push(item as TTextures[0]);
            !!variableTexture && textures.push(variableTexture as TTextures[0]);
          }
          break;
        default:
          break;
      }
    });

    _remove(localUris, ({ type }) => type === 'texture' || type === 'vrx');

    localUris.push({ models, textures });
  } else {
    scenes.forEach(({ localUris: multiModelLocalUris }) => {
      multiModelLocalUris.forEach((item) => {
        switch (item.type) {
          case 'vrx':
            models.push(item as TModels[0]);
            break;
          case 'texture':
            textures.push(item as TTextures[0]);
            break;
          default:
            break;
        }
      });
    });

    _remove(localUris, ({ type }) => type === 'texture' || type === 'vrx');

    localUris.push({ models, textures });
  }

  return { localUris };
};
