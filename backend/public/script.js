// const socket = io("/");
// const videoGrid = document.getElementById("videoGrid");
// const myPeer = new Peer(undefined, {
//     host: "/",
//     port: "3001",
// });

// const myVideo = document.createElement("video");
// myVideo.muted = true;

// let audiotoggle = true;
// let videotoggle = true;

// const peers = {};

// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true
// }).then(stream => {
//     addVideoStream(myVideo, stream);

//     myPeer.on('call', call => {
//         call.answer(stream);
//         const video = document.createElement('video');
//         call.on('stream', userVideoStream => {
//             addVideoStream(video, userVideoStream);
//         });
//     });

//     const audioBtn = document.getElementById("audio");
//     audioBtn.addEventListener("click", () => {
//         audiotoggle = !audiotoggle;
//         toggleAudio(audiotoggle);
//         updateButtonColor(audioBtn, audiotoggle);
//     });

//     const cameraBtn = document.getElementById("camera");
//     cameraBtn.addEventListener("click", () => {
//         videotoggle = !videotoggle;
//         toggleVideo(videotoggle);
//         updateButtonColor(cameraBtn, videotoggle);
//     });

//     function toggleAudio(state) {
//         myVideo.srcObject.getAudioTracks()[0].enabled = state;
//     }

//     function toggleVideo(state) {
//         myVideo.srcObject.getVideoTracks()[0].enabled = state;
//     }

//     function updateButtonColor(button, state) {
//         if (state) {
//             button.style.backgroundColor = "lightblue";
//         } else {
//             button.style.backgroundColor = "lightblue";
//         }
//     }
//     socket.on('userConnected', userId => {
//         connectToNewUser(userId, stream);
//     });
// })

// myPeer.on('open', id => {
//     socket.emit('joinRoom', ROOM_ID, id);
// });

// socket.on('userDisconnected', userId => {
//     if (peers[userId]) {
//         peers[userId].close();
//     }
// });

// function addVideoStream(video, stream) {
//     video.srcObject = stream;
//     video.addEventListener('loadedmetadata', () => {
//         video.play();
//     });
//     videoGrid.append(video);
// }

// function connectToNewUser(userId, stream) {
//     const call = myPeer.call(userId, stream);
//     const video = document.createElement('video');
//     call.on('stream', userVideoStream => {
//         addVideoStream(video, userVideoStream);
//     });
//     call.on('close', () => {
//         video.remove();
//     })
//     peers[userId] = call;
// }
// Initialize PeerJS
const peer = new Peer();

// Get local video element
const localVideo = document.getElementById('local-video');

// Get remote video element
const remoteVideo = document.getElementById('remote-video');

// Media constraints for getUserMedia
const mediaConstraints = {
  video: true,
  audio: true
};

// Local stream variable
let localStream;

// Peer Connection variable
let peerConnection;

// Call button
const callButton = document.getElementById('call-button');

// Answer button
const answerButton = document.getElementById('answer-button');

// On PeerJS open event
peer.on('open', (peerId) => {
  console.log(`PeerJS ID: ${peerId}`);
});

// On PeerJS error event
peer.on('error', (error) => {
  console.log(`PeerJS Error: ${error}`);
});

// On call button click
callButton.addEventListener('click', () => {
  // Get remote PeerJS ID from input field
  const remotePeerId = document.getElementById('remote-peer-id').value;

  // Create PeerConnection
  createPeerConnection();

  // Get local media stream and attach to local video element
  navigator.mediaDevices.getUserMedia(mediaConstraints)
    .then(stream => {
      // Attach stream to local video element
      localVideo.srcObject = stream;
      localStream = stream;

      // Add local stream to PeerConnection
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });

      // Create and send offer to remote peer
      return peer.call(remotePeerId, localStream);
    })
    .then(() => {
      console.log('Call sent successfully!');
    })
    .catch(error => {
      console.log(`getUserMedia() error: ${error}`);
    });
});

// On answer button click
answerButton.addEventListener('click', () => {
  // Answer incoming call
  peer.on('call', incomingCall => {
    // Create PeerConnection
    createPeerConnection();

    // Answer incoming call with local media stream
    navigator.mediaDevices.getUserMedia(mediaConstraints)
      .then(stream => {
        // Attach stream to local video element
        localVideo.srcObject = stream;
        localStream = stream;

        // Add local stream to PeerConnection
        localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, localStream);
        });

        // Answer incoming call with local stream
        incomingCall.answer(localStream);

        // Set remote video element source to incoming stream
        incomingCall.on('stream', incomingStream => {
          remoteVideo.srcObject = incomingStream;
        });
      })
      .catch(error => {
        console.log(`getUserMedia() error: ${error}`);
      });
  });
});

// Create PeerConnection function
function createPeerConnection() {
  // Initialize PeerConnection
  peerConnection = new RTCPeerConnection();

  // On ICE candidate event
  peerConnection.onicecandidate = event => {
    if (event.candidate) {
      console.log(`Sending ICE candidate to remote peer: ${JSON.stringify(event.candidate)}`);
      peerConnection.send(JSON.stringify({ 'ice': event.candidate }));
    }
  };
};