import _camelCase from 'lodash/camelCase';

export const QUERY_TYPES = {
  APP_USER_CONTENT: 'appUserContent',
  AR_DOWNLOAD_LIST: 'arDownloadList',
  CATEGORIES: 'categories',
  CONSTRUCTION_SITES: 'constructionSites',
  CONSUL: {
    COMMENTS: 'comments',
    DEBATE: 'debate',
    DEBATES: 'debates',
    FILTER: {
      CURRENT: 'current',
      EXPIRED: 'expired'
    },
    LOGOUT: 'logout',
    POLL: 'poll',
    POLLS: 'polls',
    PROPOSAL: 'proposal',
    PROPOSALS: 'proposals',
    PUBLIC_COMMENT: 'publicComment',
    PUBLIC_COMMENTS: 'publicComments',
    PUBLIC_DEBATES: 'publicDebates',
    PUBLIC_PROPOSALS: 'publicProposals',
    SORTING: {
      NEWESTDATE: 'newestDate',
      MOSTACTIVE: 'mostActive',
      HIGHESTRATED: 'highestRated'
    },
    START_DEBATE: 'startDebate',
    START_PROPOSAL: 'startProposal',
    UPDATE_DEBATE: 'updateDebate',
    UPDATE_PROPOSAL: 'updateProposal',
    USER_SETTINGS: 'userSettings',
    USER: 'consulUser'
  },
  EVENT_RECORD: 'eventRecord',
  EVENT_RECORDS_ADDRESSES: 'eventRecordsAddresses',
  EVENT_RECORDS_AND_CATEGORIES: 'eventRecordsAndCategories',
  EVENT_RECORDS: 'eventRecords',
  GENERIC_ITEM: 'genericItem',
  GENERIC_ITEMS: 'genericItems',
  HOME_CONTENT_LIST: 'homeContentList',
  LUNCHES: 'lunches',
  NEWS_ITEM: 'newsItem',
  NEWS_ITEMS: 'newsItems',
  NEWS_ITEMS_DATA_PROVIDER: 'newsItemsDataProvider',
  POINT_OF_INTEREST: 'pointOfInterest',
  POINTS_OF_INTEREST: 'pointsOfInterest',
  POINTS_OF_INTEREST_AND_TOURS: 'pointsOfInterestAndTours',
  PUBLIC_HTML_FILE: 'publicHtmlFile',
  PUBLIC_JSON_FILE: 'publicJsonFile',
  TOUR: 'tour',
  TOUR_STOPS: 'tourStops',
  TOURS: 'tours',
  VOLUNTEER: {
    APPLICANTS: 'applicants',
    ADDITIONAL: 'additional',
    CALENDAR_ALL_MY: 'calendarAllMy',
    CALENDAR_ALL: 'calendarAll',
    CALENDAR: 'calendar',
    CONVERSATION: 'conversation',
    CONVERSATIONS: 'conversations',
    GROUP: 'group',
    GROUPS_MY: 'groupsMy',
    GROUPS: 'groups',
    HOME: 'home',
    ME: 'me',
    MEMBERS: 'members',
    PERSONAL: 'personal',
    POSTS: 'posts',
    PROFILE: 'profile',
    TASKS: 'tasks',
    USER: 'volunteerUser',
    USERS: 'volunteerUsers'
  } as const,
  WASTE_ADDRESSES: 'wasteAddresses',
  WASTE_STREET: 'wasteStreet',
  WATER_TEMPERATURE: 'waterTemperature',
  WEATHER_MAP: 'weatherMap',
  WEATHER_MAP_CURRENT: 'weatherMapCurrent'
};

/**
 * Parse a query type from json string if one matches.
 */
export const getQueryType = (input: string) => {
  const camelCaseInput = _camelCase(input);
  const availableTypes = [
    QUERY_TYPES.TOUR,
    QUERY_TYPES.POINTS_OF_INTEREST,
    QUERY_TYPES.NEWS_ITEM,
    QUERY_TYPES.EVENT_RECORD
  ];
  return availableTypes.find((type) => type === camelCaseInput);
};
