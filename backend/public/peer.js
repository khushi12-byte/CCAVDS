const peerServer = ExpressPeerServer(server, {
    debug: true
  });


  const io = require('socket.io')(server, {
    cors: {
      origin: '*',
    },
    perMessageDeflate: false,
  });
  
  