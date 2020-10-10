const socket = io();

const messageInput = document.getElementById('input'),
  msgForm = document.getElementById('msgForm'),
  ul = document.getElementById('ul'),
  msgButton = document.getElementById('submit'),
  locationButton = document.getElementById('loc'),
  messages = document.getElementById('messages'),
  sidebar = document.getElementById('sidebar')

//Templates
const msgTemplate = document.getElementById('msg-template').innerHTML;
const locationMsgTemplate = document.getElementById('location-msg-template')
  .innerHTML;
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

const autoscroll = () => {
  const newMessage = messages.lastElementChild

  //height of the new msg
  const newMessageMargin = parseInt(getComputedStyle(newMessage).marginBottom)
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin

  // visible height
  const visibleHeight = messages.offsetHeight

  // messages container height
  const containerHeight = messages.scrollHeight

  // scrolled height
  const scrollOffset = messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messages.scrollTop = messages.scrollHeight
  }
}

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

//focus on input
window.onload = () => messageInput.focus();

// message event
socket.on('message', (msg) => {


  const html = Mustache.render(msgTemplate, {
    username: msg.username,
    message: msg.text,
    createdAt: moment(msg.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);

  autoscroll()
});


// location message socket event
socket.on('locationMessage', (message) => {

  const html = Mustache.render(locationMsgTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a'),
  });
  messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
});

// room join socket event
socket.emit('join', { username, room }, error => {
  if (error) {
    location.href = '/'
    alert(error)
  }
});

// show users event 
socket.on('roomData', ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users
  })
  sidebar.innerHTML = html
})

//Form Submission Event
msgForm.addEventListener('submit', (e) => {
  e.preventDefault();
  msgButton.setAttribute('disabled', 'disabled');
  socket.emit('send-message', messageInput.value, (err) => {
    msgButton.removeAttribute('disabled');
    if (err) {
      return console.log(err);
    }
  });
  messageInput.value = '';
  messageInput.focus();
});



// Send Location Event
locationButton.addEventListener('click', (e) => {
  locationButton.setAttribute('disabled', 'disabled');
  if (!navigator.geolocation) {
    alert('Geolocation is not supported in your browser');
    locationButton.removeAttribute('disabled');
  }

  navigator.geolocation.getCurrentPosition((position) => {
    socket.emit(
      'send-location',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        locationButton.removeAttribute('disabled');

      }
    );
  });
  messageInput.focus();
});


