const fetch = require('node-fetch');
const dayjs = require('dayjs');

async function getDiscordMessages(){
    const data = await fetch(`https://discord.com/api/v9/channels/989682479436820573/messages`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bot OTg5MzY4MDQwNDY4NjQ3OTk3.GWYlaV.uYKThFZtCjrEmSGj3A_5q1lJiXHBU8MqBvyl6E`
        }
    })
    const json = await data.json()
    
    const dataa = json.map(x => {
      return {
        content: x.content,
        name: `${x.author.username}#${x.author.discriminator}`,
        createdAt: dayjs(x.timestamp).format('DD/MM/YYYY'),
        image: x.author.avatar && x.author.avatar.startsWith('a_') ? `https://cdn.discordapp.com/avatars/${x.author.id}/${x.author.avatar}.gif` : `https://cdn.discordapp.com/avatars/${x.author.id}/${x.author.avatar}.png`
      }
    }
    )
    console.log(dataa)
    return dataa;
}

module.exports = {
  getDiscordMessages
}