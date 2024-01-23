import Redis from "ioredis";

const redis = new Redis();

export async function createGameInRedis(hostUid, hostEmail) {
  // TODO: set expiry time for created game
  if ((await redis.hget(`GlobalHashMap:${hostUid}`, `player1Email`)) === null) {
    await redis.hset(
      `GlobalHashMap:${hostUid}`,
      "player1FbId",
      `${hostEmail}`,
      "player2FbId",
      ``,
      "boardState",
      ``,
      `isActive`,
      ``,
      `hostColor`,
      ``,
      `currentPlayerColor`,
      `w`
    );
  } else {
    console.log("game already exists");
  }
}

export async function setHostColor(innerHashID, color) {
  await redis.hset(`GlobalHashMap:${innerHashID}`, `hostColor`, `${color}`);
}

export async function getHostColor(innerHashID) {
  return await redis.hget(`GlobalHashMap:${innerHashID}`, `hostColor`);
}

export async function setSecondPlayer(innerHashID, firebaseID) {
  await redis.hset(
    `GlobalHashMap:${innerHashID}`,
    `player2FbId`,
    `${firebaseID}`
  );
}

export async function setCurrentPlayerColor(currentPlayerColor) {
  await redis.hset(
    `GlobalHashMap:${innerHashID}`,
    `currentPlayerColor`,
    `${currentPlayerColor}`
  );
}

export async function updateBoardState(innerHashID, boardState) {
  try {

    let currentPlayerColor = await redis.hget(`GlobalHashMap:${innerHashID}`,"currentPlayerColor")
    // console.log(`current player color:`,currentPlayerColor)
    currentPlayerColor = currentPlayerColor==='w'?'b':'w';
    await redis.hset(
      `GlobalHashMap:${innerHashID}`,
      "boardState",
      JSON.stringify(boardState),
      `currentPlayerColor`,currentPlayerColor
      
    );
    console.log(`Board state stored in redis for ${innerHashID}`);
  } catch (error) {
    console.error(`Error updating board state for ${innerHashID}:`, error);
  }
}

export async function addToFirebaseToRoomMap(firebaseID, roomID) {
  await redis.hset(`FirebaseToRoomMap:${firebaseID}`,firebaseID, roomID);
}

export async function redisRejoinHandler(firebaseID,prevRoomID)
{
  let playersPrevRoom = await redis.hget(`FirebaseToRoomMap:${firebaseID}`,firebaseID);
  console.log("players prev room as per redis was:",playersPrevRoom)
  console.log("players prev room as per his request was :",prevRoomID);
  if(playersPrevRoom===prevRoomID)return true;
  return false;
}
export async function getCurrentPlayerColor(roomID,rejoinersFirebaseID)
{
  console.log("roomid:",roomID)
  let player1FirebaseID = await redis.hget(`GlobalHashMap:${roomID}`,`player1FbId`)
  let player2FirebaseID = await redis.hget(`GlobalHashMap:${roomID}`,`player2FbId`)
  console.log(player1FirebaseID,player2FirebaseID)
  let hostColor =  await redis.hget(`GlobalHashMap:${roomID}`,`hostColor`)
  if(rejoinersFirebaseID===player1FirebaseID)
  {
    console.log('rejoiner is the host')
    return hostColor
  }
  else{
    console.log("rejoiner is not the host")
    let secondPlayerColor = hostColor==='w'?'b':'w'
    return secondPlayerColor
  }
}
export async function getBoardState(roomID)
{
  let boardState = await redis.hget(`GlobalHashMap:${roomID}`,`boardState`)
  return boardState
}


// Testing the functions
// async function testFunctions() {
//   await createGameInRedis("apoorvavpendse@gmail.com");

//   console.log("setting host color");
//   await setHostColor("apoorvavpendse@gmail.com", "black");

//   console.log("setting player2 email");
//   await setSecondPlayer("apoorvavpendse@gmail.com", "ganesh@gmail.com");

//   console.log("updating board state", { a: 12, b: "apple", c: true });
//   await updateBoardState("apoorvavpendse@gmail.com", {
//     a: 12,
//     b: "apple",
//     c: true,
//   });

//   let boardState = await redis.hget(
//     "GlobalHashMap:apoorvavpendse@gmail.com",
//     "boardState"
//   );
//   console.log(JSON.parse(boardState));
// }
