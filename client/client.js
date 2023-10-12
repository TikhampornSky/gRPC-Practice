const PROTO_PATH="../restaurant.proto";

var grpc = require('@grpc/grpc-js');
const protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

var restaurantService =grpc.loadPackageDefinition(packageDefinition).RestaurantService;

const client = new restaurantService("localhost:9080", grpc.credentials.createInsecure());

module.exports = client;