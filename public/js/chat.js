const socket = io();



const $messageform = document.querySelector('#message-form');
const $msgforminput = $messageform.querySelector('input');

const $msgformbutton = $messageform.querySelector('button');
const $messages = document.querySelector('#messages');
const messagetemplate = document.querySelector('#message-template').innerHTML;

const $locationbutton = document.querySelector('#send-location');
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML;
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML;

const {
    username,
    room
} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
}) //gives query string from url as an object////////////////////////////////

const autoscroll = () => {
    /////new msg element/////
    const $newmessage = $messages.lastElementChild;
    //height of the last msg///
    const newmessagestyles = getComputedStyle($newmessage);
    const newmessagemargin = parseInt(newmessagestyles.marginBottom);

    const newmessageheight = $newmessage.offsetHeight + newmessagemargin;
    ///visible height///
    const visibleheight = $messages.offsetHeight;

    //height of messages container...////////

    const containerheight = $messages.scrollHeight;

    //how far have i scrolled////

    const scrolloffset = $messages.scrollTop + visibleheight;

    if (containerheight + newmessageheight >= scrolloffset) {
        $messages.scrollTop = containerheight;
    }

}

socket.on('message', (msg) => {
    // console.log(msg);
    const html = Mustache.render(messagetemplate, {
        message: msg.text,
        username: msg.username,
        createdAt: moment(msg.createdAt).format('h:mm a')

    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();

})

socket.on('locationmessage', (url) => {
    // console.log(url);
    const html = Mustache.render(locationmessagetemplate, {
        url: url.url,
        username: url.username,
        createdAt: moment(url.createdAt).format('h:mm a')

    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();

})


socket.on('roomData', ({
    room,
    users
}) => {
    const html = Mustache.render(sidebartemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html;
    // console.log(room , users);
})




$messageform.addEventListener('submit', (e) => {
    e.preventDefault();
    $msgformbutton.setAttribute('disabled', 'disabled');
    const message = e.target.elements.message.value;
    socket.emit('sendMessage', message, (msg) => {
        $msgformbutton.removeAttribute('disabled');

        $msgforminput.focus();
        if (msg) {
            return console.log(msg);
        } else {
            console.log('delivered');
        }

    });
    // document.querySelector('input').value = '';
    e.target.elements.message.value = '';

})







document.querySelector('#send-location').addEventListener('click', (e) => {

    e.preventDefault();
    $locationbutton.setAttribute('disabled', 'disabled');
    if (!navigator.geolocation) {
        return alert('Cannot access location because geolocation is not supported by your browser');
    }

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position);
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            $locationbutton.removeAttribute('disabled');
            // console.log('shared location');
        })
    })


})


socket.emit('join', {
    username,
    room
}, (error) => {
    if (error) {
        alert(error);
        location.href = '/'
    }
});