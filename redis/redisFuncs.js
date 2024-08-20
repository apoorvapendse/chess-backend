import Redis from "ioredis";
import dotnev from 'dotenv'
dotnev.config();
const redis = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  password: process.env.REDIS_PASS
});

// creats a game in GlobalHashMap with host's mail
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

export async function getCurrentPlayerColor(roomID) {
 let color =  await redis.hget(
    `GlobalHashMap:${roomID}`,
    `currentPlayerColor`,
  );

  return color;
}


export async function updateBoardState(innerHashID, boardState) {
  try {
    // flipping the currentPlayerColor
    let currentPlayerColor = await redis.hget(
      `GlobalHashMap:${innerHashID}`,
      "currentPlayerColor"
    );
    currentPlayerColor = currentPlayerColor === "w" ? "b" : "w";

    // saving boardState and color to GlobalHashMap
    await redis.hset(
      `GlobalHashMap:${innerHashID}`,
      "boardState",
      JSON.stringify(boardState),
      `currentPlayerColor`,
      currentPlayerColor
    );
    console.log(`Board state stored in redis for ${innerHashID}`);
  } catch (error) {
    console.error(`Error updating board state for ${innerHashID}:`, error);
  }
}

export async function addToFirebaseToRoomMap(firebaseID, roomID) {
  await redis.hset(`FirebaseToRoomMap:${firebaseID}`, firebaseID, roomID);
}

export async function redisRejoinHandler(firebaseID, prevRoomID) {
  // retriving previous roomID from FirebaseToRoomMap
  // using firebaseID as key
  let playersPrevRoom = await redis.hget(
    `FirebaseToRoomMap:${firebaseID}`,
    firebaseID
  );
  console.log("roomID from FirebaseToRoomMap", playersPrevRoom);
  console.log("roomID from request :", prevRoomID);

  // if entered roomID and roomID from FirebaseToRoomMap matches
  // then let player in the game
  if (playersPrevRoom === prevRoomID) {
    return true;
  }
  return false;
}

// queries GlobalHashMap for both player's firebaseIDs
// if rejoiner is host return hostColor
// else return opposite color of hostColor
export async function getRejoinersColor(roomID, rejoinersFirebaseID) {
  console.log("roomid:", roomID);
  let player1FirebaseID = await redis.hget(
    `GlobalHashMap:${roomID}`,
    `player1FbId`
  );
  let player2FirebaseID = await redis.hget(
    `GlobalHashMap:${roomID}`,
    `player2FbId`
  );

  console.log(player1FirebaseID, player2FirebaseID);

  let hostColor = await redis.hget(`GlobalHashMap:${roomID}`, `hostColor`);
  if (rejoinersFirebaseID === player1FirebaseID) {
    console.log("rejoiner is the host");
    return hostColor;
  } else {
    console.log("rejoiner is not the host");
    let secondPlayerColor = hostColor === "w" ? "b" : "w";
    return secondPlayerColor;
  }
}

export async function getBoardState(roomID) {
  let boardState = await redis.hget(`GlobalHashMap:${roomID}`, `boardState`);
  return boardState;
}
