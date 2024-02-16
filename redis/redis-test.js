import Redis from "ioredis";

const redis = new Redis();

export async function addToFirebaseToRoomMap(firebaseID, roomID) {
  await redis.hset(`FirebaseToRoomMap`,firebaseID, roomID);
  console.log('added to redis');
}


await addToFirebaseToRoomMap('firebaseiddd', 'blyaad')

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
