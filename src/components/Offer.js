import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { View } from 'react-native';

import { consts, device, texts } from '../config';
import { matomoTrackingString, momentFormat, trimNewLines } from '../helpers';
import { useMatomoTrackScreenView } from '../hooks';
import { GenericType } from '../types';
import { DataProviderButton } from './DataProviderButton';
import { ImageSection } from './ImageSection';
import { InfoCard } from './infoCard';
import { OperatingCompany } from './screens';
import { StorySection } from './StorySection';
import { BoldText, RegularText } from './Text';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';
import { Wrapper, WrapperRow, WrapperWithOrientation, WrapperWrap } from './Wrapper';

const { MATOMO_TRACKING } = consts;

const isImage = (mediaContent) => mediaContent.contentType === 'image';

// eslint-disable-next-line complexity
export const Offer = ({ data, navigation }) => {
  const {
    companies,
    contacts,
    contentBlocks,
    dataProvider,
    genericType,
    mediaContents,
    payload,
    publicationDate,
    sourceUrl,
    title
  } = data;

  useMatomoTrackScreenView(
    matomoTrackingString([
      genericType === GenericType.Job
        ? MATOMO_TRACKING.SCREEN_VIEW.JOB_OFFER
        : MATOMO_TRACKING.SCREEN_VIEW.COMMERCIAL_OFFER,
      dataProvider && dataProvider.name,
      title
    ])
  );

  const link = sourceUrl?.url;
  const rootRouteName = navigation.getParam('rootRouteName', '');
  const headerTitle = navigation.getParam('title', '');

  // action to open source urls
  const openWebScreen = useCallback(
    (webUrl) =>
      navigation.navigate({
        routeName: 'Web',
        params: {
          title: headerTitle,
          webUrl: !!webUrl && typeof webUrl === 'string' ? webUrl : link,
          rootRouteName
        }
      }),
    [headerTitle, link, navigation, rootRouteName]
  );

  const logo = mediaContents?.find((mediaContent) => mediaContent.contentType === 'logo')?.sourceUrl
    ?.url;

  const operatingCompany = companies?.[0];
  const contact = contacts?.[0];

  const businessAccount = dataProvider?.dataType === 'business_account';

  return (
    <View>
      {/* the images from the first content block will be present in the main image carousel */}
      <ImageSection mediaContents={mediaContents?.filter(isImage)} />

      <WrapperWithOrientation>
        {!!title && !!link ? (
          <TitleContainer>
            <Touchable onPress={openWebScreen}>
              <Title accessibilityLabel={`${trimNewLines(title)} (Überschrift)`}>
                {trimNewLines(title)}
              </Title>
            </Touchable>
          </TitleContainer>
        ) : (
          !!title && (
            <TitleContainer>
              <Title accessibilityLabel={`${trimNewLines(title)} (Überschrift)`}>
                {trimNewLines(title)}
              </Title>
            </TitleContainer>
          )
        )}
        {device.platform === 'ios' && <TitleShadow />}
        {!!dataProvider?.name && (
          <Wrapper>
            <RegularText small>{dataProvider.name}</RegularText>
          </Wrapper>
        )}

        {typeof payload?.employmentType === 'string' && payload?.employmentType?.length && (
          <Wrapper>
            <WrapperWrap>
              <BoldText>{texts.job.employmentType}</BoldText>
              <RegularText>{payload.employmentType}</RegularText>
            </WrapperWrap>
          </Wrapper>
        )}

        {!!publicationDate && (
          <Wrapper>
            <WrapperRow>
              <BoldText>{texts.job.publishedAt}</BoldText>
              <RegularText>{momentFormat(publicationDate)}</RegularText>
            </WrapperRow>
          </Wrapper>
        )}

        {contentBlocks?.map((contentBlock, index) => {
          return (
            <StorySection
              contentBlock={contentBlock}
              index={index}
              key={`${contentBlock.id}-${index}`}
              openWebScreen={openWebScreen}
            />
          );
        })}

        {!!contact && (
          <Wrapper>
            <InfoCard contact={contact} openWebScreen={openWebScreen} />
          </Wrapper>
        )}

        <OperatingCompany
          title={texts.pointOfInterest.operatingCompany}
          logo={logo}
          operatingCompany={operatingCompany}
          openWebScreen={openWebScreen}
        />
        {!!businessAccount && (
          <DataProviderButton dataProvider={dataProvider} navigation={navigation} />
        )}
      </WrapperWithOrientation>
    </View>
  );
};

Offer.propTypes = {
  data: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired
};
