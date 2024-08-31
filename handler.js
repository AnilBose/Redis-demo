const { createClient } = require("redis");
const { RedisSchema } = require("./account.schema");
const dynamoose = require("./dynamodb.config");

module.exports.publisher = async (event) => {
  try {
    const { REDIS_PORT, REDIS_HOST, USER_SNS, REDIS_TABLE } = process.env;
    const requestBody = JSON.parse(event.body);
    const client = createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    });
    redisClient = await client
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();

    const publisher = client.duplicate();
    await publisher.connect();
    const subscriber = client.duplicate();
    await subscriber.connect();
    subscriber.subscribe("abc123", async (channel, message) => {
      console.log("message", message);
      console.log("channel", channel);
      const RedisModel = dynamoose.model(REDIS_TABLE, new RedisSchema());
      try {
        const res = await RedisModel.create({
          data: JSON.parse(channel),
        });
        console.log("res", res);
      } catch (e) {
        console.error(e);
      }
    });
    publisher.publish("abc123", JSON.stringify(requestBody));
    setTimeout(async () => {
      await publisher.quit();
      await subscriber.quit();
      console.log("Publisher disconnected");
    }, 5000);

    // await subscriber.subscribe("article", async (message) => {
    //   console.log("message", message);
    //   const RedisModel = dynamoose.model(REDIS_TABLE, new RedisSchema());
    //   try {
    //     const res = await RedisModel.create({
    //       data: JSON.parse(message),
    //     });
    //     console.log("res", res);
    //   } catch (e) {
    //     console.error(e);
    //   }
    // });
    // const publisher = createClient({
    //   url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    // });

    // publisher.on("error", (err) => console.log("Redis Client Error", err));
    // publisher.on("connect", () => console.log("Redis Client Connected"));

    // await publisher.connect();

    // const requestBody = JSON.parse(event.body);
    // await publisher.publish("article", JSON.stringify(requestBody));
    // await publisher.disconnect();

    // await publisher.disconnect();
    // await subscriber.disconnect();
    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Success",
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          response: error.message,
        },
        null,
        2
      ),
    };
  }
};
module.exports.subscriber = async (event) => {
  try {
    console.log("Subscriber lambda function executed.", event);
    const { REDIS_PORT, REDIS_HOST, REDIS_TABLE } = process.env;
    const client = createClient({
      url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
    });

    const subscriber = client.duplicate();
    await subscriber.connect();

    subscriber.subscribe("article", async (message) => {
      console.log(message);
      const RedisModel = dynamoose.model(REDIS_TABLE, new RedisSchema());

      await RedisModel.create({
        data: JSON.parse(message),
      });
    });

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Success",
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          response: error.message,
        },
        null,
        2
      ),
    };
  }
};

module.exports.writeCache = async (event) => {
  const { REDIS_PORT, REDIS_HOST } = process.env;
  const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  });

  try {
    client.on("error", (err) => console.log("Redis Client Error", err));
    client.on("connect", () => console.log("Redis Client Connected"));
    await client.connect();
    const requestBody = JSON.parse(event.body);
    await client.json.set("user", ".", requestBody);
    const redisTable = process.env.REDIS_TABLE;
    const RedisModel = dynamoose.model(redisTable, new RedisSchema());

    const res = await RedisModel.create({
      data: requestBody,
    });

    const value = await client.json.get("user", ".");
    console.log("value", value);
    // Disconnect from the Redis server
    await client.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Success",
          response: value,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          response: error.message,
        },
        null,
        2
      ),
    };
  }
};

module.exports.getCache = async () => {
  const { REDIS_PORT, REDIS_HOST } = process.env;

  const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  });

  try {
    client.on("error", (err) => console.log("Redis Client Error", err));
    client.on("connect", () => console.log("Redis Client Connected"));
    await client.connect();

    // const value = await client.get("key");
    const value = await client.json.get("user", ".");
    console.log("value", value);
    // Disconnect from the Redis server
    await client.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Success",
          response: value,
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          response: error.message,
        },
        null,
        2
      ),
    };
  }
};
module.exports.deleteCache = async () => {
  const { REDIS_PORT, REDIS_HOST } = process.env;

  const client = createClient({
    url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
  });

  try {
    client.on("error", (err) => console.log("Redis Client Error", err));
    client.on("connect", () => console.log("Redis Client Connected"));
    await client.connect();

    // Delete key from Redis
    // await client.del("key");
    await client.json.del("user", ".");

    // Disconnect from the Redis server
    await client.disconnect();

    return {
      statusCode: 200,
      body: JSON.stringify(
        {
          message: "Success",
          response: "Key deleted successfully",
        },
        null,
        2
      ),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(
        {
          message: "Error",
          response: error.message,
        },
        null,
        2
      ),
    };
  }
};
