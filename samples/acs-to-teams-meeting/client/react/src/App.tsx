import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {  
  CallWithChatComposite,
  useAzureCommunicationCallWithChatAdapter, 
  fromFlatCommunicationIdentifier, 
} from '@azure/communication-react';
import React, { useState, useMemo, useEffect } from 'react';
import './App.css';

const App = () => { 
  const displayName = 'Guest';
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [teamsMeetingLink, setTeamsMeetingLink] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const credential = useMemo(() => {
    if (token) {
      return new AzureCommunicationTokenCredential(token)
    }
    return;
    }, [token]);

  const callWithChatAdapterArgs = useMemo(() => {
    if (userId && endpointUrl && credential && displayName && threadId && teamsMeetingLink) {
      return {
        userId: fromFlatCommunicationIdentifier(userId) as CommunicationUserIdentifier,
        endpoint: endpointUrl,
        displayName,
        credential,
        threadId,
        locator: { meetingLink: teamsMeetingLink },
      }
    }
    return {};
  }, [userId, endpointUrl, credential, displayName, threadId, teamsMeetingLink]);

  const callWithChatAdapter = useAzureCommunicationCallWithChatAdapter(callWithChatAdapterArgs);

  

  useEffect(() => {
    const init = async () => {
        setMessage('Getting ACS user');
        //Call Azure Function to get the ACS user identity and token
        let res = await fetch(process.env.REACT_APP_ACS_USER_FUNCTION as string);
        let user = await res.json();
        setUserId(user.userId);
        setToken(user.token);
        setThreadId(user.threadId);
        setEndpointUrl(user.endpointUrl);
        
        setMessage('Getting Teams meeting link...');
        //Call Azure Function to get the meeting link
        res = await fetch(process.env.REACT_APP_TEAMS_MEETING_FUNCTION as string);
        let link = await res.text();
        setTeamsMeetingLink(link);
        setMessage('');
        console.log('Teams meeting link', link);
    }
    init();

}, []);
  if (callWithChatAdapter) {
    return (
      <div>
        <h1>Contact Customer Service</h1>
        <div className="wrapper">
          <CallWithChatComposite
            adapter={callWithChatAdapter}
            formFactor="mobile"
          />
          
        </div>
      </div>
    );
  }
  if (!credential) {
    return <>Failed to construct credential. Provided token is malformed.</>;
  }
  if (message) {
    return <div>{message}</div>;
  }
  return <div>Initializing...</div>;
};

export default App;