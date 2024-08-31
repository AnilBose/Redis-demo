const { Schema, model } = require("dynamoose");
const { v4: uuidv4 } = require("uuid");

class RedisSchema extends Schema {
  constructor(options) {
    super(
      {
        id: {
          hashKey: true,
          required: true,
          type: String,
          default: () => uuidv4(),
        },
        data: {
          type: Object,
        },
        createdAt: {
          type: Date,
          default: () => new Date(),
        },
        updatedAt: {
          type: Date,
          default: () => new Date(),
        },
      },
      { saveUnknown: ["data.**"] }
    );
  }
}

const redisTable = process.env.REDIS_TABLE;

const RedisModel = model(redisTable, new RedisSchema());

module.exports = { RedisSchema, RedisModel };
