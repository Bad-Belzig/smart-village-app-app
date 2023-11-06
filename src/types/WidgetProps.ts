import { ComponentProps } from 'react';

import { IconSet } from '../config';

export type WidgetProps = {
  additionalProps?: {
    dataProviderId?: string;
    htmlName?: string;
    iconName?: ComponentProps<typeof IconSet>['name'];
    image?: {
      height?: number;
      uri: string;
      width?: number;
    };
    limit?: number;
    noCount?: boolean;
    noFilterByDailyEvents?: boolean;
    staticContentName?: string;
    staticContentTitle?: string;
    webUrl?: string;
  };
  text?: string;
};
