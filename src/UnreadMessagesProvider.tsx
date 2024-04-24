// MessageContext.js

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery } from 'react-apollo';

import { QUERY_TYPES, getQuery } from './queries';

const defaultUnreadMessage = { count: 0, loading: false };
const defaultPollInterval = 15 * 60 * 1000; // 15 minutes

export const UnreadMessagesContext = createContext(defaultUnreadMessage);

export const UnreadMessagesProvider = ({ children }: { children?: React.ReactNode }) => {
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const query = QUERY_TYPES.PROFILE.GET_CONVERSATIONS;

  const { data: conversationData, loading } = useQuery(getQuery(query), {
    pollInterval: defaultPollInterval
  });

  const getUnreadMessagesCount = () => {
    // return 0 if data is missing or not loaded yet
    if (!conversationData || !conversationData[query]) {
      return 0;
    }

    return conversationData[query].reduce((total, conversation) => {
      return total + (conversation.unreadMessagesCount || 0);
    }, 0);
  };

  useEffect(() => {
    const unreadMessagesCount = getUnreadMessagesCount();

    setUnreadMessagesCount(unreadMessagesCount);
  }, [conversationData]);

  return (
    <UnreadMessagesContext.Provider
      value={{
        count: unreadMessagesCount,
        loading
      }}
    >
      {children}
    </UnreadMessagesContext.Provider>
  );
};

export const useMessagesContext = () => useContext(UnreadMessagesContext);
