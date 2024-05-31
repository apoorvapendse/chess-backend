# backend
 
##### To start redis server
```docker run -d --name redis-stack-server -p 6379:6379 redis/redis-stack-server:latest```

##### To start redis server with redis stack
```docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest```


## System Design
![Dashboard Page](./System%20Design/Socket.io%20dash%20design.svg)
![Board Page](./System%20Design/Socket.io%20board%20design.svg)