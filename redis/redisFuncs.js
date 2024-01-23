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
      ``
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
    await redis.hset(
      `GlobalHashMap:${innerHashID}`,
      "boardState",
      JSON.stringify(boardState)
    );
    console.log(`Board state stored in redis for ${innerHashID}`);
  } catch (error) {
    console.error(`Error updating board state for ${innerHashID}:`, error);
  }
}

export async function addToFirebaseToRoomMap(firebaseID, roomID) {
  await redis.hset(`FirebaseToRoomMap:${firebaseID}`, roomID);
}

// Testing the functions
async function testFunctions() {
  await createGameInRedis("apoorvavpendse@gmail.com");

  console.log("setting host color");
  await setHostColor("apoorvavpendse@gmail.com", "black");

  console.log("setting player2 email");
  await setSecondPlayer("apoorvavpendse@gmail.com", "ganesh@gmail.com");

  console.log("updating board state", { a: 12, b: "apple", c: true });
  await updateBoardState("apoorvavpendse@gmail.com", {
    a: 12,
    b: "apple",
    c: true,
  });

  let boardState = await redis.hget(
    "GlobalHashMap:apoorvavpendse@gmail.com",
    "boardState"
  );
  console.log(JSON.parse(boardState));
}
