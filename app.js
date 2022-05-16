const enterMessengerForm = document.querySelector('#enter-messenger-form');
const enterMessengerInput = document.querySelector('#enter-messenger-input');
const messengerWrapper = document.querySelector('.messenger-wrapper');
const activeUsersContainer = document.querySelector('.active-users');
const messagesContainer = document.querySelector('.messages');
const messageForm = document.querySelector('#message-form');
const messageInput = document.querySelector('#message-input');


// saxeli sheyavs
enterMessengerForm.addEventListener('submit' , e => {
    e.preventDefault();
    initMessenger(enterMessengerInput.value);
    enterMessengerForm.classList.add('hide');
    messengerWrapper.classList.add('visible');
})

function initMessenger(newUserName){
  const ws = new WebSocket('ws://139.59.145.232:8080');
  ws.addEventListener('open', e => {
    console.log('Connected');
    ws.send(JSON.stringify({type: 'newUser', data: newUserName}));
  });
  ws.addEventListener('error', e => {
    console.log('Error - ', e);
  });

  ws.addEventListener('message', e => {
    const messageData = JSON.parse(e.data);
    if(messageData.type === 'activeUsers'){
      handleActiveUsers(messageData);
    }
    if(messageData.type === 'newUser'){
      handleNewUser(messageData);
    }
    if(messageData.type === 'chatMessage'){
      handleNewMessage(messageData, ws);
    }
    if(messageData.type === 'userTyping'){
      handleTyping(messageData.data)
    }
    if(messageData.type === 'messageLike'){
      updateLikesHandler(messageData)
    }
  });


  // mesijs agzavnis
  messageForm.addEventListener('submit', e => {
    e.preventDefault();
    sendMessage(messageInput.value, ws);
    messageInput.value = '';
  });

  // mesijs wers
    messageForm.addEventListener('input', e => {
      e.preventDefault();
      someoneIsTypingHandler(newUserName, ws);
    });
}

function handleNewUser(userData){
  const newUserDiv = document.createElement('div');
  newUserDiv.classList.add('user-item');
  newUserDiv.innerText = userData.data;

  activeUsersContainer.appendChild(newUserDiv);
}

function handleActiveUsers(usersData){
  activeUsersContainer.innerHTML = '';
  usersData.data.forEach(user => {
    handleNewUser(user)
  });
}

function sendMessage(message, ws) {
  ws.send(JSON.stringify({ type: 'chatMessage', data: message }));
}


function handleNewMessage(messageData, ws) {
  const messageLikes = document.createElement('span');
  const newMessageDiv = document.createElement('div');
  newMessageDiv.className = 'message'
  newMessageDiv.innerHTML = messageData.data;
  newMessageDiv.setAttribute('data-id', messageData.id);
  newMessageDiv.appendChild(messageLikes);

  newMessageDiv.addEventListener('click', ()=>{
    likeMessageHandler(messageData.id, ws)
  })

  messagesContainer.appendChild(newMessageDiv);
}


function someoneIsTypingHandler(message, ws) {
  ws.send(JSON.stringify({ type: 'userTyping', data: message }));
}

function handleTyping(userName){
  document.querySelector('#typing-indicator').textContent = `${userName} is typing`

  setTimeout(()=>{
    document.querySelector('#typing-indicator').textContent = ''
  }, 1000)
}


function likeMessageHandler(messageId, ws) {
  ws.send(JSON.stringify({ type: 'messageLike', id: messageId }));
}

function updateLikesHandler(messageData){
  const message = document.querySelector(`[data-id="${messageData.id}"]`)
  const likesSpan = message.querySelector('span')
  likesSpan.textContent = ` (Likes: ${messageData.likeCount})`
}