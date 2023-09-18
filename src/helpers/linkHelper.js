import * as Linking from 'expo-linking';

import { device } from '../config';

/**
 *
 * Linking only works with a protocol, otherwise the phone do not know how to handle a link.
 * In this app we have five types of Linkings:
 *   1. http
 *   2. https
 *   3. tel
 *   4. mailto
 *   5. maps (ios) / geo (android)
 *
 * This method ensures, that a protocol is given or adds http:// at front
 */
function ensureProtocol(link) {
  const protocolRegExpMatch = link.match(/^https?:|tel:|mailto:|maps:|geo:/);
  let linkWithProtocol = link.replaceAll(' ', '');

  if (!protocolRegExpMatch) {
    linkWithProtocol = `http://${link}`;
  }

  return linkWithProtocol;
}

/**
 * Check if a given link is a web page.
 *
 * @param {string} linkWithProtocol
 *
 * @return true if linkWithProtocol is a web page
 */
function isWeb(linkWithProtocol) {
  return linkWithProtocol.match(/^https?:/);
}

// https://facebook.github.io/react-native/docs/linking.html#opening-external-links
export function openLink(link, openWebScreen) {
  const linkWithProtocol = ensureProtocol(link);

  if (isWeb(linkWithProtocol) && openWebScreen) {
    return openWebScreen(linkWithProtocol);
  }

  return Linking.openURL(linkWithProtocol);
}

/**
 * The mergeWebUrls function merges web URLs from various sources into a single array.
 * It can accept web URLs from a single contact, an array of contacts, or an existing array of web URLs.
 *
 * @param {Object} { webUrls, contact, contacts } - The properties that can be passed to the function.
 *
 * @returns {Array} - An array containing the merged web URLs.
 */
export const mergeWebUrls = ({ webUrls, contact, contacts }) => {
  const mergedWebUrls = webUrls ? [...webUrls] : [];

  if (contact?.www) {
    mergedWebUrls.unshift({ url: contact.www });
  }

  // merge a `contact`s `webUrls` to `webUrls`
  if (contact?.webUrls?.length) {
    mergedWebUrls.push(...contact.webUrls);
  }

  // iterate all `contacts` and merge every `contact`s `webUrls` to `webUrls`
  contacts?.forEach((contact) => {
    if (contact?.www) {
      mergedWebUrls.push({ url: contact.www });
    }
    if (contact?.webUrls?.length) {
      mergedWebUrls.push(...contact.webUrls);
    }
  });

  // filter out system unrelated web urls
  return mergedWebUrls.filter((webUrl) => {
    const { description, url } = webUrl;

    if (device.platform === 'ios') {
      return !(
        description.toLowerCase().includes('android') ||
        url.toLowerCase().includes('play.google.com')
      );
    } else {
      return !(
        description.toLowerCase().includes('ios') || url.toLowerCase().includes('apps.apple.com')
      );
    }
  });
};
