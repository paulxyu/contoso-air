const mongoose = require("mongoose");
const UserInfoModelSchema = require("./book.repository.model");
const { DefaultAzureCredential } = require("@azure/identity");
const axios = require("axios");

class BookFlightsRepository {
  constructor(options) {
    const { listConnectionStringUrl, scope, clientId } = options;
    let accessToken;
    let connectionString;

    const initialize = async () => {
      // Get the access token for the managed identity
      const credential = new DefaultAzureCredential({
        managedIdentityClientId: clientId,
      });
      accessToken = await credential.getToken(scope);

      // Get the connection string using the access token
      const config = {
        method: "post",
        url: listConnectionStringUrl,
        headers: {
          Authorization: `Bearer ${accessToken.token}`,
        },
      };
      const response = await axios(config);
      const keysDict = response.data;
      connectionString = keysDict["connectionStrings"][0]["connectionString"];

      // Connect to the MongoDB server using the connection string
      mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      mongoose.Promise = global.Promise;

      console.log("Connected to the database");
    };

    initialize().catch((error) => {
      console.error("Failed to connect to the database: ", error);
    });
  }

  async getUserInfo(username) {
    const UserInfoModel = await mongoose.model(
      "UserInfoModel",
      UserInfoModelSchema
    );
    const result = await UserInfoModel.findOne({ user: username })
      .lean()
      .exec();
    return result || { user: username, booked: null, purchased: [] };
  }

  async createOrUpdateUserInfo(userInfo) {
    const UserInfoModel = await mongoose.model(
      "UserInfoModel",
      UserInfoModelSchema
    );
    await UserInfoModel.findOneAndUpdate({ user: userInfo.user }, userInfo, {
      upsert: true,
    });
  }
}

module.exports = BookFlightsRepository;
