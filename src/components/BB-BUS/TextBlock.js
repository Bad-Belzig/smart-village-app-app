import PropTypes from 'prop-types';
import React from 'react';

import { trimNewLines } from '../../helpers';
import { HtmlView } from '../HtmlView';
import { Link } from '../Link';
import { Wrapper, WrapperWithOrientation } from '../Wrapper';

import { Block } from './Block';

export const TextBlock = ({ bottomDivider, textBlock, openWebScreen }) => {
  const {
    type: { name },
    externalLinks,
    text
  } = textBlock;

  if (!name || (!text && !externalLinks?.length)) {
    return null;
  }

  return (
    <Block
      bottomDivider={bottomDivider}
      initiallyOpen={name.toUpperCase() === 'KURZTEXT'}
      title={name}
    >
      <WrapperWithOrientation>
        <Wrapper>
          {!!text && <HtmlView html={trimNewLines(text)} openWebScreen={openWebScreen} />}
          {!!externalLinks?.length &&
            externalLinks.map((externalLink) => {
              return (
                <Link
                  url={externalLink.url}
                  openWebScreen={openWebScreen}
                  description={`Link: ${externalLink.name}`}
                  key={externalLink.url}
                />
              );
            })}
        </Wrapper>
      </WrapperWithOrientation>
    </Block>
  );
};

TextBlock.propTypes = {
  bottomDivider: PropTypes.bool,
  textBlock: PropTypes.object.isRequired,
  openWebScreen: PropTypes.func
};
