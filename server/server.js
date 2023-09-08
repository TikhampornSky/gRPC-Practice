const PROTO_PATH="./restaurant.proto";

var grpc = require('@grpc/grpc-js');
var protoLoader = require("@grpc/proto-loader");

var packageDefinition = protoLoader.loadSync(PROTO_PATH,{
    keepCase: true,
    longs: String,
    enums: String,
    arrays: true
});

// connect to MongoDB
require('dotenv').config({path: './config.env'});
const mongoose = require('mongoose');
mongoose.set('strictQuery', true);
mongoose.connect(process.env.DATABASE_URL);
const db = mongoose.connection;
db.on('error', (error) => console.error(error));
db.once('open', function() {
  console.log('Successfully connected to MongoDB using Mongoose!');
});

const Menu = require('../models/menu_item');
// ====================


var restaurantProto =grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

server.addService(restaurantProto.RestaurantService.service,{
    getAllMenu: async (_, callback) => {
        try {
            let menu = await Menu.find();
            
            console.log("Menu items found in MongoDB!");
            callback(null, { menu });
        } catch (err) {
            console.error(err);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    get: async (call,callback)=>{
        try {
            let menuItem = await Menu.findById(call.request.id);
            
            console.log("Menu item found in MongoDB!");
            callback(null, menuItem);
        } catch (err) {
            console.error(err);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    insert: async (call, callback)=>{
        let menuItem=call.request; 
        try {
            let newMenuItem = new Menu(menuItem);
            await newMenuItem.save();
            console.log("New menu item added to MongoDB!");
            callback(null, newMenuItem);
        } catch (err) {
            console.error(err);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    update: async (call,callback)=>{
        try {
            let menuItem = await Menu.findByIdAndUpdate(call.request.id, call.request)
            console.log("Menu item updated in MongoDB!");
            callback(null,menuItem);
        } catch (err) {
            console.error(err);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    },
    remove: async (call, callback) => {
        try {
            let menuItem = await Menu.findByIdAndDelete(call.request.id);
            console.log("Menu item deleted from MongoDB!");
            callback(null, {});
        } catch (err) {
            console.error(err);
            callback({
                code: grpc.status.NOT_FOUND,
                details: "Not Found"
            });
        }
    }
});

server.bindAsync("127.0.0.1:30043",grpc.ServerCredentials.createInsecure(), () => {
    server.start();
});
console.log("Server running at http://127.0.0.1:30043");