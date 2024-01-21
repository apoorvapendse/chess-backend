import Redis from "ioredis";

const redis = new Redis();

redis.set("name:1", "apoorva");
redis.set("name:2", "rajeev");

redis.mget(["name:1", "name:2"], function (err, result) {
  console.log(result);
});
