const socket = io.connect("http://localhost:3000");

socket.on('userCount', userCount => {
        document.getElementById('connectionCount').innerHTML = userCount;
  })