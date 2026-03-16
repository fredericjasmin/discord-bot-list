const { Schema, model } = require('mongoose');

const bot = new Schema({
 BotId: {
     type: String,
 },
 InviteUrl: {
     type: String,
 },
 BotAvatar: {
     type: String,
 },
 BotTag: {
     type: String,
 },
 GuildSupport: {
     type: String,
 },
 Github: {
     type: String
 },
 Website: {
     type: String
 },
 Tags: {
     type: Array,
 },
 OwnerID: {
     type: String
 },
 shortDesc: {
     type: String,
 },
 longDesc: {
     type: String,
 },
 BotUsername: {
     type: String,
 },
 Status: {
     type: String,
 },
 BotPrefix: {
     type: String
 },
 OwnerName: {
     type: String,
 },
 OwnerAvatar: {
     type: String,
 },
 Votes: {
     type: Number,
     default: 0,
 },
});

module.exports = model('Bots', bot);