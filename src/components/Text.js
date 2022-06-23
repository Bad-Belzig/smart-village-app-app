import PropTypes from 'prop-types';
import React from 'react';
import { Text as RNText } from 'react-native';
import styled, { css } from 'styled-components/native';

import { colors, normalize } from '../config';

// example: S&#322;ubice -> Słubice
function parseNumericCharacterReferences(text) {
  if (!text) return;

  const pattern = /&#\d+;/gm;

  return text.replace(pattern, (match) =>
    String.fromCharCode(parseInt(match.substr(2, match.length - 3)))
  );
}

function insertWhiteSpaceAfterDashes(text) {
  if (!text) return;

  return text.replace('-', '-' + String.fromCharCode(8203));
}

function parseText(text) {
  if (!text) return;

  let result = parseNumericCharacterReferences(text);

  result = insertWhiteSpaceAfterDashes(result);

  return result;
}

export const Text = ({ children, ...props }) => {
  return (
    <RNText {...props}>{typeof children === 'string' ? parseText(children) : children}</RNText>
  );
};

export const RegularText = styled(Text)`
  color: ${colors.darkText};
  font-family: regular;
  font-size: ${normalize(16)};
  line-height: ${normalize(22)};

  ${(props) =>
    props.italic &&
    css`
      font-family: italic;
    `};

  ${(props) =>
    props.small &&
    css`
      font-size: ${normalize(14)};
      line-height: ${normalize(18)};
    `};

  ${(props) =>
    props.smallest &&
    css`
      font-size: ${normalize(12)};
    `};

  ${(props) =>
    props.big &&
    css`
      font-size: ${normalize(20)};
      line-height: ${normalize(26)};
    `};

  ${(props) =>
    props.lineThrough &&
    css`
      text-decoration: line-through;
    `};

  ${(props) =>
    props.underline &&
    css`
      text-decoration: underline;
    `};

  ${(props) =>
    props.primary &&
    css`
      color: ${colors.primary};
      text-decoration-color: ${colors.primary};
    `};

  ${(props) =>
    props.lighter &&
    css`
      color: ${colors.gray60};
      text-decoration-color: ${colors.gray60};
    `};

  ${(props) =>
    props.lightest &&
    css`
      color: ${colors.lightestText};
      text-decoration-color: ${colors.lightestText};
    `};

  ${(props) =>
    props.placeholder &&
    css`
      color: ${colors.placeholder};
      text-decoration-color: ${colors.placeholder};
    `};

  ${(props) =>
    props.darker &&
    css`
      color: ${colors.darkerPrimary};
      text-decoration-color: ${colors.darkerPrimary};
    `};

  ${(props) =>
    props.error &&
    css`
      color: ${colors.error};
      text-decoration-color: ${colors.error};
    `};

  ${(props) =>
    props.center &&
    css`
      text-align: center;
    `};

  ${(props) =>
    props.right &&
    css`
      text-align: right;
    `};
`;

export const BoldText = styled(RegularText)`
  font-family: bold;

  ${(props) =>
    props.italic &&
    css`
      font-family: bold-italic;
    `};
`;

Text.propTypes = {
  children: PropTypes.node
};
