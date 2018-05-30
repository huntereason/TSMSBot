const http = require('http');
const express = require('express');
const app = express();
app.get("/", (request, response) => {
  console.log(Date.now() + " Ping Received");
  response.sendStatus(200);
});
app.listen(process.env.PORT);
setInterval(() => {
  http.get(`http://${process.env.PROJECT_DOMAIN}.glitch.me/`);
}, 280000);

//================================================================

const config = require("./config.json");
const Discord = require("discord.js");
const Enmap = require("enmap");
const Provider = require("enmap-sqlite");

const bot = new Discord.Client({disableEveryone: true});

bot.points = new Enmap({provider: new Provider({name: "points"})});

bot.on("ready", async() => {
    console.log(`${bot.user.username} is online!`);
    bot.user.setActivity("Get Good 12", {type: "WATCHING"});
});

bot.on("message", async message => {
    if(message.author.bot)
        return;
    if(message.channel.type === "dm")
        return;
    if(message.content.indexOf(config.prefix) !== 0) 
        return;

    let prefix = config.prefix;
    let messageArray = message.content.split(" ");
    let args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    let command = args.shift().toLowerCase();
    let sender = message.member;
    let key = `${message.guild.id}-${message.author.id}`;


   if(!bot.points.has(key)) { //Check is user has points
       bot.points.set(key, {
            user: message.author.id,
            guild: message.guild.id,
            points: 0
       });
       
   }
   let currentPoints = bot.points.getProp(key, "points");
    bot.points.setProp(key, "points", currentPoints++)

    /*
    =================================================
    ============Check Points Command=================
    =================================================
    */
   if(command === "points") {
       message.channel.send(`${message.author} currently has ${currentPoints} TSMSBucks.`);
       return;
   }

   /*
    =================================================
    =============Give Points Command=================
    =================================================
    */
   if(command === "give") {
        num = parseInt(args[1]);
        if(num <= 0 || !Number.isInteger(num)) return;
        if(sender.id === "151790361746997248") {
            pid = args[0].slice(2,-1);
            console.log(pid);
            if(pid === "!151790361746997248") {
                bot.points.setProp(key, "points", (currentPoints + num));
                return;
            }
            bot.points.setProp(`${message.guild.id}-${pid}`, "points", (currentPoints + num));
            return;
        }
        console.log("No correct author found.");
        console.log(sender.id);
    }

   /*
    =================================================
    =============Give Points Command=================
    =================================================
    */


    /*
    =================================================
    ==================Lobby Command==================
    =================================================
    */
    if(command === "lobby") {
        let role = message.guild.roles.find("name", "lobby");
        if(sender.roles.exists("name","lobby")) {
            console.log("Removing.");
            sender.removeRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        console.log("Adding!");
        sender.addRole(role);
        message.delete().catch(O_o=>{});
        return;
    }

    /*
    =================================================
    ===================East Command==================
    =================================================
    */
   if(command === "east") {
        let role = message.guild.roles.find("name", "east");
        if(sender.roles.exists("name","east")) {
            console.log("Removing.");
            sender.removeRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        console.log("Adding!");
        sender.addRole(role);
        message.delete().catch(O_o=>{});
        return;
    }

    /*
    =================================================
    ===================West Command==================
    =================================================
    */
   if(command === "west") {
        let role = message.guild.roles.find("name", "west");
        if(sender.roles.exists("name","west")) {
            console.log("Removing.");
            sender.removeRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        console.log("Adding!");
        sender.addRole(role);
        message.delete().catch(O_o=>{});
        return;
    }

    if(command === "jail") {
        let jailee = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
        if(!jailee) return message.channel.send("Couldn't find the victim.");
        let reason = args.join(" ").slice(22);
        if(!reason) {
            reason = "No reason given.";
        }

        let jailEmbed = new Discord.RichEmbed()
        .setDescription("Jail Time")
        .setColor("#533696")
        .addField("Jailed User", `${jailee}`)
        .addField("Jailed By", `${message.author}`)
        .addField("Reason", `${reason}`);

        let jailchannel = message.guild.channels.find(`name`, "jail");
        if(!jailchannel) return message.channel.send("Couldn't find Jail channel.");

        message.delete().catch(O_o=>{})
        jailchannel.send(jailEmbed)
        return;
    }

    if(command === "botinfo") {
        let icon = bot.user.displayAvatarURL;
        let botembed = new Discord.RichEmbed()
        .setDescription("Bot Information")
        .setColor("#533696")
        .setThumbnail(icon)
        .addField("Bot Name", bot.user.username)
        .addField("Created On: ", bot.user.createdAt);

        return message.channel.send(botembed);
    }
})



bot.login(config.token);