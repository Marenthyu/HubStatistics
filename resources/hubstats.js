function roomNames(item, index, arr){
  let node = document.createElement("li")
  let kbd = document.createElement("kbd")
  let name = document.createTextNode(item.RoomName)
  let link = document.createElement("a")

  node.setAttribute('data-path', item.Path)
  node.setAttribute('class', 'room')
  node.setAttribute('data-name', item.RoomName)
  link.setAttribute('href', '#' + item.Path)

  kbd.appendChild(name)
  link.appendChild(kbd)
  node.appendChild(link)
  roomsObject.appendChild(node)
}

function setRoomListeners(roomSocket, roomName){
  // Connection opened
  roomSocket.onopen = function(event) {
    //console.log("Room WebSocket is open now. (" + roomName + ")")
  }
  
  // Log errors
  roomSocket.onerror = function(event) {
    console.error("Room WebSocket error observed:", event)
  }

  // Connection closed
  roomSocket.onclose = function(event) {
    //console.log("Room WebSocket is now closed. (" + roomName + ")")
    tableObject.innerHTML = ''
    statusObject.innerHTML = ''
  }

  // Listen for messages 
  roomSocket.onmessage = function(event) {
    let message = JSON.parse(event.data)
    if (message.commandType == "GetRoomInfo"){
      //let maxPlayers = message.data.maxPlayers
      //let name = message.data.name
      //let noFail = message.data.noFail
      //let roomHost = message.data.roomHost
      //let roomId = message.data.roomId
      roomState = message.data.roomState
      playersNum = message.data.players;
      //let selectedDifficulty = message.data.selectedDifficulty
      if(message.data.selectedSong){
        songName = message.data.selectedSong.songName
        //let levelId = message.data.selectedSong.levelId
        //let songDuration = message.data.selectedSong.songDuration
      } else {
        songName = "Selecting Song..."
      }
      //let songSelectionType = message.data.songSelectionType
      //let usePassword = message.data.usePassword
      if (message.data.usePassword) {
        passwordState = '<i class="fas fa-lock"></i>'
      } else {
        passwordState = ''
      }
    }
    if (message.commandType == "PlayerReady"){
      readyPlayers = message.data.readyPlayers
      totalPlayers = message.data.roomClients
      roomState = 1
    }
    if (message.commandType == "SetSelectedSong"){
      //let levelID = message.data.levelId
      //let songDuration = message.data.songDuration
      if (message.data){
        songName = message.data.songName
      } else {
        songName = "Selecting Song..."
      }
    }
    if (message.commandType == "StartLevel"){
      //let difficulty = message.data.difficulty
      //let levelID = message.data.song.levelId
      //let songDuration = message.data.song.songDuration
      songName = message.data.song.songName
      roomState = 2
    }
    if (message.commandType == "UpdatePlayerInfo"){
      let players = message.data
      tableObject.innerHTML=''
      playersNum = players.length

      let tr = document.createElement('tr')
      tr.innerHTML='<th>Name</th><th>Score</th><th>Combo</th><th>Energy</th>'
      tableObject.appendChild(tr)
      players.forEach(
        function (element){
          //let playerAvatar = element.playerAvatar
          let playerComboBlocks = element.playerComboBlocks
          //let playerCutBlocks = element.playerCutBlocks
          let playerEnergy = element.playerEnergy
          //let playerId = element.playerId
          let playerName = element.playerName
          //let playerProgress = element.playerProgress
          let playerScore = element.playerScore
          //let playerState = element.playerState

          let tr = document.createElement('tr')
          let Name = document.createElement('td')
          let Score = document.createElement('td')
          let Combo = document.createElement('td')
          let Energy = document.createElement('td')

          Name.innerHTML=playerName
          tr.appendChild(Name)
          Score.innerHTML=playerScore
          tr.appendChild(Score)
          Combo.innerHTML=playerComboBlocks
          tr.appendChild(Combo)
          Energy.innerHTML=playerEnergy
          tr.appendChild(Energy)
          tableObject.appendChild(tr)
        }
      )
    } 
    if (roomState == 1){
      playerNumber = "(" + readyPlayers + " / " + totalPlayers + ") players " + passwordState
    } else {
      playerNumber = playersNum + " players " + passwordState
    }
    if (!songName) {
      songName = "Selecting Song..."
    }
    statusObject.innerHTML = '<p class="has-text-right player-count subtitle">' + playerNumber + '</p><p><span class="title">' + songName + '</span></p>'
  } 
}

function openRoom(element){
  let roomName = element.getAttribute('data-name')
  let roomPath = element.getAttribute('data-path')
  // Create WebSocket connection.
  if (typeof roomSocket !== 'undefined') {
    roomSocket.close()
  }
  if (window.location.protocol == "https:"){
    roomSocket = new WebSocket('wss://hub.assistant.moe:3900' + roomPath)
    setRoomListeners(roomSocket, roomName)
  } else {
    roomSocket = new WebSocket('ws://hub.assistant.moe:3800' + roomPath)
    setRoomListeners(roomSocket, roomName)
  }
}

function setListeners(socket){
  // Connection opened
  socket.onopen = function(event) {
    //console.log("WebSocket is open now.")
  }
  
  // Log errors
  socket.onerror = function(event) {
    console.error("WebSocket error observed:", event)
  }

  // Listen for messages 
  socket.onmessage = function(event) {
    let hub = JSON.parse(event.data)
    if (hub.Version) {
      version = hub.Version
      TotalClients = hub.TotalClients
      rooms = hub.Rooms
    } else {
      rooms = hub
    }
    let roomNumber = rooms.length
    document.getElementById("roomNumber").innerHTML=roomNumber
    document.getElementById("version").innerHTML="v " + version
    document.getElementById("totalPlayers").innerHTML=TotalClients
    roomsObject.innerHTML=''
    rooms.forEach(roomNames)
    Array.from(roomsObject.children).forEach(
      function (element){
        element.addEventListener("click", function () {
          openRoom(element)
        })
      }
    )
  }
}

let roomSocket
let rooms = []
let roomStatus
let readyPlayers
let totalPlayers
let playersNum
let playerNumber = ''
let songName
let version
let TotalClients
const tableObject = document.getElementById("players")
const statusObject = document.getElementById("roomStatus")
const roomsObject = document.getElementById("rooms")

// Create WebSocket connection.
if (window.location.protocol == "https:"){
  let socket = new WebSocket('wss://hub.assistant.moe:3900/')
  setListeners(socket)
} else {
  let socket = new WebSocket('ws://hub.assistant.moe:3800/')
  setListeners(socket)
}