import { AzureCommunicationTokenCredential, CommunicationUserIdentifier } from '@azure/communication-common';
import {  
  CallWithChatComposite,
  useAzureCommunicationCallWithChatAdapter,
  COMPOSITE_LOCALE_EN_US,
  fromFlatCommunicationIdentifier,
  darkTheme, 
  CallWithChatAdapter
} from '@azure/communication-react';
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import MobileDetect from 'mobile-detect';
import './App.css';
import logoUrl from './xds.png';

const App = () => { 
  const displayName = 'Guest';
  const locale = COMPOSITE_LOCALE_EN_US;
  const waitingTitle = 'Thankyou for contacting 10xDS Customer Service';
  const waitingSubtitle ='Agent will be assigned soon';
  const [endpointUrl, setEndpointUrl] = useState<string>('');
  const [threadId, setThreadId] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [teamsMeetingLink, setTeamsMeetingLink] = useState<string>('');
  const credential = useMemo(() => {
    if (token) {
      return new AzureCommunicationTokenCredential(token)
    }
    return;
    }, [token]);
  
    const afterAdapterCreate = useCallback(async (adapter: CallWithChatAdapter): Promise<CallWithChatAdapter> => {
      adapter.joinCall(true); 
      return new Promise((resolve, reject) => resolve(adapter));
    }, []);

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

  const callWithChatAdapter = useAzureCommunicationCallWithChatAdapter(callWithChatAdapterArgs, afterAdapterCreate);

  useEffect(() => {
    const init = async () => {
        
        //Call Azure Function to get the ACS user identity and token
        let res = await fetch(process.env.REACT_APP_ACS_USER_FUNCTION as string);
        let user = await res.json();
        setUserId(user.userId);
        setToken(user.token);
        setThreadId(user.threadId);
        setEndpointUrl(user.endpointUrl);
        
        //Call Azure Function to get the meeting link
        res = await fetch(process.env.REACT_APP_TEAMS_MEETING_FUNCTION as string);
        let link = await res.text();
        setTeamsMeetingLink(link);
        console.log('Teams meeting link', link);
    }
    init();

}, []);
  if (callWithChatAdapter) {
    const logo = logoUrl ? <img src={logoUrl} alt="" /> : <></>;
    const formFactorValue = new MobileDetect(window.navigator.userAgent).mobile() ? 'mobile' : 'desktop';
    return (
      <div>
        <div className="wrapper">
          <CallWithChatComposite
            adapter={callWithChatAdapter}
            formFactor={formFactorValue}
            fluentTheme={darkTheme}
            locale={{
              component: locale.component,
              strings: {
                chat: locale.strings.chat,
                call: {
                  ...locale.strings.call,
                  lobbyScreenConnectingToCallTitle: waitingTitle,
                  lobbyScreenConnectingToCallMoreDetails: waitingSubtitle,
                  lobbyScreenWaitingToBeAdmittedTitle: waitingTitle,
                  lobbyScreenWaitingToBeAdmittedMoreDetails: waitingSubtitle
                },
                callWithChat: locale.strings.callWithChat
              }
            }}
            icons={{
              LobbyScreenWaitingToBeAdmitted: logo,
              LobbyScreenConnectingToCall: logo
            }}
          />
          
        </div>
      </div>
    );
  } else {
    return (
      <div className='website'>
        <h1 className='heading'>10xds Customer Service</h1>
          <h2 className='status'>Everything is getting ready <div className='spinner-grow spinner-grow-sm text-muted'></div>
          <div className='spinner-grow spinner-grow-sm text-primary'></div>
          <div className='spinner-grow spinner-grow-sm text-warning'></div>
          </h2>
          <div className="alert alert-warning warning">
            <strong>Warning!</strong> Your call may be subjected for recording.
          </div>
        </div>
    ); 
  }  
};

export default App;