const { Router } = require("express");
const passport = require("../server/passport");
const auth = require("../util/middleware/auth");
const server = require('../config/config')
const config = require('../config/config')
const Bot = require('../models/bots')
const roles = require('../roles.json')
const channels = require('../channels.json')
const client = require('../server/bot')
const md = require('markdown-it')({breaks: true});
const url = require('url')
const botsdata = require("../models/bots");
const Discord = require('discord.js');
const profile = require("../models/profile");
const botClient = require('../server/bot');
const router = Router();

router.get("/", async (req, res, next) => {
  const botdata = await botsdata.find({ Status: 'verified' })
  res.render("index", {
    user: req.isAuthenticated() ? req.user : null,
    bot: req.BotClient,
    roles,
    config,
    bots: botdata,
  })
});

router.get('/feedbacks', async function(req, res, next) {
  const { getDiscordMessages } = require('../public/js/getDiscordMessages');
  res.render('reviews', {
    review: await getDiscordMessages(),
    user: req.isAuthenticated() ? req.user : null,
    bot: req.BotClient,
    roles,
    config,
  })
  console.log(req.review)
})

router.get('/bots/add', auth, async(req, res) => {
  res.render('addbot', {
    user: req.isAuthenticated() ? req.user : null,
    roles,
    bot: req.BotClient,
    config,
    otherUser: client.users.cache.get(req.params.id),
    channels
  })
});

router.post("/bots/add", auth, async (req,res) => {
  let rBody = req.body;
  let server = req.BotClient.guilds.cache.get('989366611557355532');
  let miembro = server.members.cache.get(req.user.id)
  if(!miembro) {
    req.flash('server', 'No estas en el server');
    res.redirect('/');
}
  let botExists = await botsdata.findOne({BotId: rBody['BotId']});
  if(botExists) return res.json({
    message: 'El bot ya existe'
  })

  client.users.fetch(req.body.BotId).then(async a => {
  if(a.bot === false) console.log('id invalida')
  await new botsdata({
       BotId: rBody['BotId'], 
       OwnerID: req.user.id,
       OwnerName: req.user.username,
       OwnerAvatar: req.user.avatar,
       BotUsername: a.username,
       BotTag: a.discriminator,
       BotAvatar: a.avatarURL(),
       BotPrefix: rBody['BotPrefix'],
       longDesc: rBody['longDesc'],
       shortDesc: rBody['shortDesc'],
       Status: "unverified",
       Tags: rBody['Tags'],
  }).save()
  console.log(botsdata.BotAvatar)
  if(rBody['Github']) {
      await botsdata.findOneAndUpdate({BotId: rBody['BotId']},{$set: {Github: rBody['Github']}}, function (err,docs) {})
  }
  if(rBody['Website']) {
      await botsdata.findOneAndUpdate({BotId: rBody['BotId']},{$set: {Website: rBody['Website']}}, function (err,docs) {})
  }
  if(rBody['Support']) {
      await botsdata.findOneAndUpdate({BotId: rBody['BotId']},{$set: {Support: rBody['Support']}}, function (err,docs) {})
  }
  })
  client.users.fetch(rBody['BotId']).then(a => {
  client.channels.cache.get(channels.botlog).send(`<@${req.user.id}> added **${a.tag}**`)
  res.redirect('/')
  })
})

router.get('/bot/:BotId',auth, async(req, res) => {
  const botdata = await botsdata.findOne({
    BotId: req.params.BotId,
    Status: 'verified',
  }); 

  const status = {
    status: req.BotClient.presence.status
  }

  client.users.fetch(botdata.OwnerID).then(aowner => {
  client.users.fetch(req.params.BotId).then(bot => {
  res.render('viewBot', {
    user: req.isAuthenticated() ? req.user : null,
    roles,
    bot: req.BotClient,
    config,
    channels,
    bots: botdata,
    botsito: bot,
    aowner: aowner,
    status: status
  })
})
  })
})

router.get("/partners", auth, (req, res) => {
  res.render('partners', {
    user: req.isAuthenticated() ? req.user : null,
    bot: req.BotClient,
    roles,
    config,
    otherUser: client.users.cache.get(req.params.id),
  })
})


router.get("/login", (req, res, next) => {
  if (req.session.backURL) {
    req.session.backURL = req.session.backURL; 
  } else if (req.headers.referer) {
    const parsed = url.parse(req.headers.referer);
  } else {
    req.session.backURL = "/";
   }
  next();
},
passport.authenticate("discord", { prompt: 'none' }));
router.get("/callback", passport.authenticate("discord", { failureRedirect: "/error?code=999&message=We encountered an error while connecting." }), async (req, res) => {
        try {
          const request = require('request');
          const peticion = request({
              url: `https://discordapp.com/api/v9/guilds/989366611557355532/members/${req.user.id}`,
              method: "PUT",
              json: { access_token: req.user.accessToken },
              headers: { "Authorization": `Bot ${client.token}` }
          });
          console.log(peticion)
    } catch {};
    res.redirect(req.session.backURL || '/')
    client.users.fetch(req.user.id).then(async a => {
    client.channels.cache.get("989374636250779680").send(new Discord.MessageEmbed().setAuthor(a.username, a.avatarURL({dynamic: true})).setThumbnail(a.avatarURL({dynamic: true})).setColor("GREEN").setDescription(`[**${a.username}**#${a.discriminator}](https://example.com/user/${a.id}) ha iniciado sesion en el sitio web.`).addField("Username", a.username).addField("User ID", a.id).addField("User Discriminator", a.discriminator))
    console.log(req.session)
    })
    });
      
router.get('/logout', async (req, res) => {
  req.logout();
  res.redirect('/');
})

router.get('/search', async (req, res) => {
  let page = req.query.page || 1;
          let x = await botsdata.find()
          let data = x.filter(a => a.status == "verified" && a.username.includes(req.query.q) || a.shortDesc.includes(req.query.q))
         if(page < 1) return res.redirect(`/`);
         if(data.length <= 0) return res.redirect("/");
         if((page > Math.ceil(data.length / 8)))return res.redirect(`/`);
          if (Math.ceil(data.length / 8) < 1) {
              page = 1;
          };
          console.log(page)
          res.render('index', {
            user: req.user,
            bot: req.BotClient,
            roles,
            config,
            bots: botdata,
            page: page
          })
})

router.get('/bot/:id/votar', async (req, res) => {
  const botdata = await botsdata.findOne({
    id: req.params.id,
    state: 'verified',
  }); 
  client.users.fetch(req.params.id).then(bot => {
    res.render('votar', {
      user: req.user,
      roles,
      bot: req.BotClient,
      config,
      otherUser: client.users.cache.get(req.params.id),
      channels,
      bots: botdata,
      bot: bot,
    })
  })
})

router.post('/bot/:id/votar', async (req, res) => {
  const votes = require("../models/votos");
  let botdata = await botsdata.findOne({
      id: req.params.id
  });
  let x = await votes.findOne({
      user: req.user.id,
      bot: req.params.id
  })
  if (x) return res.json({
    message: 'No puedes votar este bot dentro de 12 horas'
  });
  await votes.findOneAndUpdate({
      bot: req.params.id,
      user: req.user.id
  }, {
      $set: {
          Date: Date.now(),
          ms: 43200000
      }
  }, {
      upsert: true
  })
  await botsdata.findOneAndUpdate({
      id: req.params.id
  }, {
      $inc: {
          votes: 1
      }
  })

client.channels.cache.get(channels.votes).send(`<@${req.user.id}> ha votado por el bot **${botdata.username}** **\`(${botdata.votes + 1} votos)\`**`).then(b => {
  b.react('❤')
})
if(botdata.votes+1 >= 100) {
client.channels.cache.get(channels.votes).send(`:tada: El bot llamado **${botdata.username}** ha recibido 100 votos!`)
}
res.redirect('/')
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/')
})


const profiledata = require("../models/profile.js");
router.get("/user/:userId", async (req, res) => {
  const botdata = await botsdata.find({ Status: 'verified' })
  console.log(botdata)
  client.users.fetch(req.params.userId).then(async a => {
    const pdata = await profiledata.findOne({
      userId: a.id
    }).catch(err => {
      console.log(err)
  })
    res.render('profile',{
      user: req.isAuthenticated() ? req.user : null,
      roles,
      config,
      bot: req.BotClient,
      member: a,
      //otherUser: client.users.cache.get(req.params.id),
      bots: botdata,
      pdata: pdata,
  })
  })
  })
  
  router.post("/user/:userId", async (req, res) => {
    let rBody = req.body;
    console.log(req.params.userId)
    const data = await profiledata.findOneAndUpdate({
      userId: req.params.userId
    }, {
      $set: {
        biography: rBody['biography']
      }
    }, {
      upsert: true
    })
    console.log(data)
    return res.redirect('/user/' + req.params.userId)
  })


module.exports = router;