const { CommunicationIdentityClient } = require('@azure/communication-identity');
const { AzureCommunicationTokenCredential } = require('@azure/communication-common');
const { ChatClient } = require('@azure/communication-chat');

module.exports = async function (context, req) {
  // Get ACS connection string from local.settings.json (or App Settings when in Azure)
  const endpointUrl = process.env.ENDPOINT_URL;
  const connectionString = process.env.ACS_CONNECTION_STRING;
  let tokenClient = new CommunicationIdentityClient(connectionString);
  const user = await tokenClient.createUser();
  const userToken = await tokenClient.getToken(user, ["voip", "chat"]);

  const chatClient = new ChatClient(endpointUrl, new AzureCommunicationTokenCredential(userToken.token));

  async function createChatThread() {
    const createChatThreadRequest = {
      topic: "Customer Service Meeting"
    };
    const createChatThreadOptions = {
      participants: [
        {
          id: { communicationUserId: user.communicationUserId },
          displayName: 'Guest'
        }
      ]
    };
    const createChatThreadResult = await chatClient.createChatThread(
      createChatThreadRequest,
      createChatThreadOptions
    );
    const threadId = createChatThreadResult.chatThread.id;
    return threadId;
  }

  const threadId = await createChatThread();
  console.log(`Thread created: ${threadId}`);

  context.res = {
    body: { userId: user.communicationUserId, ...userToken, threadId: threadId, endpointUrl: process.env.ENDPOINT_URL }
  };
};
