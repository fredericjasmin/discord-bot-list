const { Client } = require("discord.js");
const Discord = require('discord.js')
const channels = require('../channels.json')
const roles = require('../roles.json')
const client = new Client();
const fs = require('fs')
const path = require('path')


const {token} = require('../config/config')

client.on('ready', () => {
  console.log('Bot ready')
})

client.on('message', async(message, req) => {
    if(!message.content.startsWith("m!")) return;
    if(message.author.bot) return;
    let args = message.content.slice("m!".length).trim().split(/ +/g)
    let command = args.shift().toLowerCase()

    if(command === "accept") {
      if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')

      const bots = require('../models/bots')

        const id = args[0]
        if(!id) return message.channel.send(':x: ***Please provide a bot ID***');
        const bot = await bots.findOne({ state: 'unverified', BotId: id})
        
        let botUser = await client.users.fetch(id);
        await bots.updateOne({ BotId: id }, { $set: { Status: 'verified' } })
         

        client.users.fetch(id).then(a => {
          client.channels.cache.get(channels.botlog).send(`<@${bots.OwnerID}> su bot con nombre **${a.tag}** ha sido aprobado`)
          client.users.cache.get(bots.OwnerID).send(`Felicidades! su bot con nombre **${a.tag}** ha sido aprobado 🥳`)
        })
      }

      if(command === 'decline') {
        if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')
        const bots = require('../models/bots')
        let id = args[0]
        const razon = args.slice(1).join(' ')
        if(!id) return message.channel.send(':x: ***Please provide a bot ID***');
        const bot = await bots.findOne({ status: false, id: id})
        if(!bot) return message.channel.send(':x: ***The provided bot doesnt exists in the database***')

        client.users.fetch(id).then(a => {
          client.channels.cache.get(channels.botlog).send(`<@${bot.autor}> su bot con nombre **${a.tag}** ha sido rechazado por ${message.author}`)
          client.users.cache.get(bot.autor).send(`Suerte para la proxima! Su bot con nombre **${a.tag}** ha sido rechazado. Razon: \n\`\`${razon}\`\``)
        })
        await bots.deleteOne({
          id: id,
          OwnerID: bot.autor
        })
        message.channel.send('<:myteams1:868297332368756777> | Bot rechazado con exito')
        message.guild.member(id).kick();
      }

      if(command === 'add') {
        if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(' <a:no:776065602984083456> | **No puedes usar este comando**')
        let usuario = message.mentions.members.first();

        if(!usuario) return message.channel.send(':x: | Menciona a un usuario')
        await usuario.roles.add(roles.moderator)
        client.channels.cache.get(channels.botlog).send(`${usuario} ha sido añadido como staff por ${message.author}`)
        message.channel.send(':white_check_mark: | Usuario agregado como staff!')
      }

      if(command === 'remove') {
        if (!message.member.hasPermission('MANAGE_ROLES')) return message.channel.send(' <a:no:776065602984083456> | **No puedes usar este comando**')
        let usuario = message.mentions.members.first();
        if(!usuario) return message.channel.send(':x: | Menciona a un usuario')
        await usuario.roles.remove(roles.moderator)  
        client.channels.cache.get(channels.botlog).send(`${usuario} ha sido removido del staff por ${message.author}`)
        message.channel.send(':white_check_mark: | Usuario removido del staff!')      
      }

      if(command === 'votes-add') {
        if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')
        const botsdata = require('../models/bots')
        let botId = args[0];
        if(!botId) return message.channel.send(':x: Provide a bot ID');
      
        let votes = args[1];
        if(!votes) return message.channel.send(':x: Provide a number of votes');
      
        let validVotes = parseInt(votes);
        if(!validVotes) return message.channel.send(':x: The votes must be a Intiger number');
      
        let x = await botsdata.findOneAndUpdate({
          id: botId
        }, {
         $inc: {
           votes: votes,
         }
        })  
        client.users.fetch(botId).then(a => {
          client.channels.cache.get(channels.votes).send(`<@${x.autor}> se le han agregado **${votes} votos** a su bot **${a.tag}**`)
        })
        message.channel.send('<:myteams1:868297332368756777> | Votos añadidos con exito')
      }


      if(command === 'votes-remove') {
        if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')
        const botsdata = require('../models/bots')
        let botId = args[0];
        if(!botId) return message.channel.send(':x: Provide a bot ID');
      
        let votes = args[1];
        if(!votes) return message.channel.send(':x: Provide a number of votes');
      
        let validVotes = parseInt(votes);
        if(!validVotes) return message.channel.send(':x: The votes must be a Intiger number');
      
        let x = await botsdata.findOneAndUpdate({
          id: botId
        }, {
         $inc: {
           votes: -votes,
         }
        })  
        client.users.fetch(botId).then(a => {
          client.channels.cache.get(channels.votes).send(`<@${x.autor}> se le han eliminado **${votes} votos** a su bot **${a.tag}**`)
        })
        message.channel.send('<:myteams1:868297332368756777> | Votos eliminados con exito')
      }

      if(command === 'delete') {
        if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')
        const bots = require('../models/bots')
        let id = args[0]
        const razon = args[1];
        if(!id) return message.channel.send(':x: ***Please provide a bot ID***');
        const bot = await bots.findOne({ state: 'verified', id: id})
        if(!bot) return message.channel.send(':x: ***The provided bot doesnt exists in the database***')
        if(!razon) return message.channel.send(':x: ***Write a reason please***')

        client.users.fetch(id).then(a => {
          client.channels.cache.get(channels.botlog).send(`<@${bot.autor}> su bot con nombre **${a.tag}** ha sido removido de ${message.guild.name} por ${message.author}`)
          client.users.cache.get(bot.autor).send(`Su bot con nombre **${a.tag}** ha sido removido de la web. Razon: \n\`\`${razon}\`\``)
        })
        await bots.deleteOne({
          id: id,
          autor: bot.autor
        })
        message.channel.send('<:myteams1:868297332368756777> | Bot removido con exito')
        message.guild.member(id).kick();
      }

      if(command == 'bot-info') {
        if(!message.member.permissions.has('MANAGE_GUILD')) return message.channel.send('Para usar este comando debes tener el permiso de ``MANAGE_GUILD``')

        const bots = require('../models/bots')
  
          const id = args[0];	
          if(!id) return message.channel.send(':x: ***Please provide a bot ID***');
          let bot = await bots.findOne({ BotId: args[0]}) 
          console.log(bot)

          const embed = new Discord.MessageEmbed()
          .setThumbnail(bot.BotAvatar)
   .setAuthor(bot.BotUsername, bot.BotAvatar)
   .addField("ID Del cliente", bot.BotId, true)
   .addField("Nombre del bot", bot.BotUsername, true)
   .addField("Votos", bot.Votes, true)
   .addField("Descripcion breve", bot.shortDesc, true)
   .setColor("#7289da")
   .addField("Numero de servidores", `${bot.serverCount || "N/A"}`, true)
   .addField("Owner", `<@${bot.OwnerID}>`, true)
   .addField("Links de Ayuda", `[Invite](https://discord.com/oauth2/authorize?client_id=${bot.BotId}&scope=bot&permissions=8)`, true)
   message.channel.send(embed)
      }

      if(command === "bots") {
        const bots = require('../models/bots');
        let botsList = await bots.find({})
        console.log(botsList)
        const data = botsList.filter(bot => bot.Status !== "deleted");
        if(bots.length === 0) message.channel.send('No hay bots en la web.');
        else message.channel.send(`Hay ${bots.length} en la web.`)
      }
    })

    client.on("guildMemberAdd", async (member) => {
      const channel = client.channels.cache.get("989646622193487932");
      const frases = [`${member} Sup?`, `Parece que alguien anda perdido... ${member}`, `Un campeon llamado ${member} ha entrado!`, `Parece que a ${member} se le ha perdido un chicle..`, `Algo me huele a que alguien nuevo se ha unido, Ah ¡Si! Bienvenido ${member}`];
      const sentencesRandom = Math.floor(Math.random() * frases.length)
      channel.send(`${frases[sentencesRandom]}`)
    })
client.login(token);

module.exports = client;