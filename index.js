/*
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
*/
//================================================================

const config = require("./config.json");
const Discord = require("discord.js");
const Enmap = require("enmap");
const Provider = require("enmap-sqlite");

const bot = new Discord.Client({disableEveryone: true});
const servers = ['151790937515753472','227511363663167488']
bot.points = new Enmap({provider: new Provider({name: "points"})});

bot.on("ready", async() => {
    console.log(`${bot.user.username} is online!`);
    bot.user.setActivity("Get Good 12", {type: "WATCHING"});
});

bot.on("presenceUpdate", (oldMember, newMember) => {
    let role = oldMember.guild.roles.find("name", "lobby");
    console.log(`ROLE: ${role}`);
    if(newMember.presence.game === null) {
        if(!newMember.roles.exists("name","lobby")) return;
        if(oldMember.presence.game === "Rivals of Aether") {
            console.log("Removing role.")
            newMember.removeRole(role);
            return;
        }
    }
    else if(newMember.presence.game.name === "Rivals of Aether") {
        if(newMember.roles.exists("name","lobby"))  return;
        console.log("Adding!");
        newMember.addRole(role);
        return;
    }
    else {
        if(!newMember.roles.exists("name","lobby")) return;
        if(oldMember.presence.game === "Rivals of Aether") {
            console.log("Removing role.")
            newMember.removeRole(role);
            return;
        }
    }
    //if(oldMember.presense.game)
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
            points: 100
       });
       
   }
   let currentPoints = bot.points.getProp(key, "points");
    bot.points.setProp(key, "points", Math.round(currentPoints++))
    if(currentPoints < 100) {
        currentPoints = 100;
        bot.points.setProp(key, "points", Math.round(currentPoints))
    }
    if(!isFinite(currentPoints)) currentPoints = 100;

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
        let num = parseInt(args[1]);
        if(!Number.isInteger(num)) return;
        if(sender.id === "151790361746997248") {
            let pid = args[0].slice(2,-1);
            console.log(`Other users ID: ${pid}`);
            console.log(`${message.guild.id}-${pid}`);
            if(pid === "!151790361746997248") {
                let currentPoints = bot.points.getProp(`${key}`, "points");
                bot.points.setProp(key, "points", (currentPoints + num));
                console.log(key)
                return;
            }
            let currentPoints = bot.points.getProp(`${message.guild.id}-${pid}`, "points");
            bot.points.setProp(`${message.guild.id}-${pid}`, "points", (currentPoints + num));
            return;
        }
        console.log("No correct author found.");
        console.log(sender.id);
    }

   /*
    =================================================
    ==================Gamble Command=================
    =================================================
    */
    if(command === "gamble") {
        let amount = parseInt(args[0]);
        console.log("Beginning to gamble.");
        let roll = Math.floor(Math.random() * 101);
        console.log(amount);
        console.log(roll);
        if(amount <= 0 ) return message.channel.send("Amount is not a positive number.");
        if(!Number.isInteger(amount)) return message.channel.send("Amount is not an integer.");
        if(amount > currentPoints) return message.channel.send("Amount is greater than current TSMSBucks.");
        if(roll<=50) {
            bot.points.setProp(key, "points", currentPoints-amount);
            currentPoints = currentPoints - amount;
            let botembed = new Discord.RichEmbed()
            .setDescription(`You lost! :(`)
            .setColor("#533696")
            .addField("Gambler: ", sender)
            .addField("Roll: ", roll)
            .addField("Current TSMSBucks:", currentPoints);
            return message.channel.send(botembed);
        }
        if(roll>50) {
            bot.points.setProp(key, "points", currentPoints+amount);
            currentPoints = currentPoints + amount;
            let botembed = new Discord.RichEmbed()
            .setDescription(`You Won!!!`)
            .setColor("#533696")
            .addField("Gambler: ", sender)
            .addField("Roll: ", roll)
            .addField("Current TSMSBucks:", currentPoints);
            return message.channel.send(botembed);
        }
    }

    /*
    =================================================
    =================Betting Command=================
    =================================================
    */
    if(command === "bet") {
        if(!(sender.id === "151790361746997248")) return;
        const host = message.author;
        const server = message.guild.id;
        let choice1 = args[0].toLowerCase();
        let choice2 = args[1].toLowerCase();
        await message.channel.send(`Begin voting. Options: ${args[0]}, ${args[1]}`);
        let unique = [];
        let count1 = 0;
        let count2 = 0;
        let num1 = 0;
        let num2 = 0;
        const msgs = await message.channel.awaitMessages(response => {
            if(response.author.bot) return;
            let key = `${response.guild.id}-${response.author.id}`;
            msg = response.content.toLowerCase();
            let currentPoints = bot.points.getProp(`${key}`, "points");
            if(currentPoints < 100) {
                currentPoints = 100;
                bot.points.setProp(key, "points", Math.round(currentPoints))
            }
            let args = msg.trim().split(/ +/g);
            let better = [];
            //Error Checking
            console.log(`Current points: ${currentPoints}`);
            if(args[0] !== choice1 && args[0] !== choice2) return console.log(`${args[0]} doesn't equal either ${choice1} or ${choice2}`);
            else if(parseInt(args[1]) < 1) return console.log("args[1] < 1");
            else if(isNaN(args[1])) return console.log(`${args[1]} is not a number.`);
            else if(parseInt(args[1]) > currentPoints) return console.log("args[1] > currentPoints");
            //Look for correct responses    `choice1 300`
            if(msg.includes(choice1)) {
                if(unique.includes(response.author.id)) {
                    ;
                }
                else {
                    unique.push(response.author.id);
                }
                count1 += 1;
                better.push(response.member.id);
                better.push(args[0]);
                better.push(parseInt(args[1]));
                console.log(better);
                return better[1];
            }
            else if(msg.includes(choice2)) {
                if(unique.includes(response.author.id)) {
                    ;
                }
                else {
                    unique.push(response.author.id);
                }
                count2 += 1;
                better.push(response.member.id);
                better.push(args[0]);
                better.push(parseInt(args[1]));
                console.log(better);
                return better[1];
            }
        }, {time: 5000});
        if(count1 === 0 || count2 === 0) return message.channel.send("One of the options has no betters. Please try again.");
        message.channel.send(`Betting complete. Users that bet:`);
        let paid = 0;
        
        let sortedCollection = msgs.sort(function(a,b) {
            return a.createdTimestamp < b.createdTimestamp;
        });
        console.log(sortedCollection);
        console.log(`IDS FOR UNIQUE: ${unique}`);
        
        sortedCollection = sortedCollection.filter(message => {
            let tempArgs = message.content.slice(config.prefix.length).trim().split(/ +/g);
            let sender = message.author.id;
            console.log(`SENDER: ${sender}`);
            if(unique.includes(sender)) {
                if(message.content.includes(choice1)) {
                    num1 = num1 + parseInt(tempArgs[1]);
                }
                else if(message.content.includes(choice2)) {
                    num2 = num2 + parseInt(tempArgs[1]);
                }
                unique.pop(sender);
                return true;
            }
            return false;
        });
        console.log(sortedCollection);

        sortedCollection.map(msg => {
            let str = msg.content.trim().split(/ +/g);
            let choice = str[0].charAt(0).toUpperCase() + str[0].slice(1);
            message.channel.send(`${msg.member} - Bet: ${parseInt(str[1])} TSMSBucks on ${choice}`);
        });

        /*
        uniqueCollection = msgs.filter(message => {
            let sender = message.author.id;
            console.log(`SENDER: ${sender}`);
            if(unique.includes(sender)) {
                let indx = unique.indexOf(sender);
                unique[indx] = sender;
                return true;
            }
            unique.push(sender);
            return true;
        });
        console.log(uniqueCollection);
        console.log(uniqueCollection.lastKey(1));
        */

        
        //Test Unique
        /*
        console.log("BEGINNING TESTING FOR UNIQUE");
        let unique = msgs.filter((v, i, a) => {
            a.author.id === v.author.id
        });
        unique.map(msg => {
            console.log(msg);
        });
        */


       console.log(`HOST: ${host}`);
        const collector = new Discord.MessageCollector(message.channel, m=> m.author === host, { time: 60000 });
        collector.on('collect', response => {
            if(response.content.startsWith("!payout") && response.author === host) {
                console.log(`SENDER: ${sender}`)
                let args = response.content.trim().split(/ +/g);
                console.log("Beginning payout!");
                console.log(`CHOICE1 - ${num1}`);
                console.log(`CHOICE2 - ${num2}`);
                console.log("Args complete.")
                console.log(`Checking if ${args[1]} is ${choice1} or ${choice2}`);
                if(args[1] === choice1) {
                    if(num1 >= num2) { //You won the bet and have higher payout
                        let total = num1/num2;
                        console.log(`TOTAL: ${total}`);
                        distPayout(total, sortedCollection, choice1, num1, num2, server);
                        response.channel.send(`All bets have been paid out. The winner was: ${args[1]}`);
                        collector.stop("All bets Paid.");
                    }
                    else if(num2 > num1) { //You won the bet and have higher payout
                        let total = num2/num1;
                        console.log(`TOTAL: ${total}`);
                        distPayout(total, sortedCollection, choice1, num2, num1, server);
                        response.channel.send(`All bets have been paid out. The winner was: ${args[1]}`);
                        collector.stop("All bets Paid.");
                    }
                }
                if(args[1] === choice2) { //You won the bet and have higher payout
                    if(num1 >= num2) {
                        let total = num1/num2;
                        console.log(`TOTAL: ${total}`);
                        distPayout(total, sortedCollection, choice2, num1, num2, server);
                        response.channel.send(`All bets have been paid out. The winner was: ${args[1]}`);
                        collector.stop("All bets Paid.");
                    }
                    else if(num2 > num1) { //You won the bet and have lower payout
                        let total = num2/num1;
                        console.log(`TOTAL: ${total}`);
                        distPayout(total, sortedCollection, choice2, num2, num1, server);
                        response.channel.send(`All bets have been paid out. The winner was: ${args[1]}`);
                        collector.stop("All bets Paid.");
                    }
                }
    
            }
            
        });

        /*
        const payout = await message.channel.awaitMessages(response => {
            console.log(`Awaiting payout from ${host}`);
            console.log(`Recieved message from: ${response.sender}`)
            let args = response.content.trim().split(/ +/g);
            if(paid===1) {
                response.channel.send(`All bets have been paid out. The winner was: ${args[1]}`);
                break;
                console.log("Didn't break.");
            }

        }, {time:60000});
        */
    }

    /*
    =================================================
    ==================Lobby Command==================
    =================================================
    */
    if(command === "lobby") {
        let role = message.guild.roles.find("name", "lobby");
        let consent = message.guild.roles.find("name", "consensual lobby");
        if(sender.roles.exists("name","lobby")) {
            console.log("Removing lobby.");
            sender.removeRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        else {
            console.log("Adding lobby!");
            sender.addRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        if(sender.roles.exists("name","consensual lobby")) {
            console.log("Removing consensual lobby.");
            sender.removeRole(role);
            message.delete().catch(O_o=>{});
            return;
        }
        else {
            console.log("Adding consensual lobby!");
            sender.addRole(consent);
            message.delete().catch(O_o=>{});
            return;
        }
    }

    /*
    =================================================
    ==================Bwaaa Command==================
    =================================================
    */
   if(command === "bwaaaa") {
    return message.channel.send("BWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA BWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA https://www.youtube.com/watch?v=i4K9u0DTeus BWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA BWAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
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
/*
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
*/
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

function distPayout(total, msgs, winner, high, low, server) {
    console.log("Logging winner and choice.");
    msgs.map(msg => {
        let pid = msg.member.id;
        let str = msg.content.trim().split(/ +/g);
        let currentPoints = bot.points.getProp(`${server}-${pid}`, "points");
        let choice = str[0].toLowerCase();
        console.log(winner);
        console.log(choice);
        if(winner === choice) {
            console.log(`WINNER is ${msg.author.id}`);
            bot.points.setProp(`${server}-${pid}`, "points", Math.round(currentPoints + (total*parseInt(str[1]))));
        }
        else {
            console.log(`LOSER  is ${msg.author.id}`);
            bot.points.setProp(`${server}-${pid}`, "points", Math.round(currentPoints - parseInt(str[1])));
        }
    
    });
}


bot.login(config.token);