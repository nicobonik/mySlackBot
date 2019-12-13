/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ______    ______    ______   __  __    __    ______
 /\  == \  /\  __ \  /\__  _\ /\ \/ /   /\ \  /\__  _\
 \ \  __<  \ \ \/\ \ \/_/\ \/ \ \  _"-. \ \ \ \/_/\ \/
 \ \_____\ \ \_____\   \ \_\  \ \_\ \_\ \ \_\   \ \_\
 \/_____/  \/_____/    \/_/   \/_/\/_/  \/_/    \/_/


 This is a sample Slack Button application that provides a custom
 Slash command.

 This bot demonstrates many of the core features of Botkit:

 * Authenticate users with Slack using OAuth
 * Receive messages using the slash_command event
 * Reply to Slash command both publicly and privately

 # RUN THE BOT:

 Create a Slack app. Make sure to configure at least one Slash command!

 -> https://api.slack.com/applications/new

 Run your bot from the command line:

 clientId=<my client id> clientSecret=<my client secret> PORT=3000 node bot.js

 Note: you can test your oauth authentication locally, but to use Slash commands
 in Slack, the app must be hosted at a publicly reachable IP or host.

 # EXTEND THE BOT:

 Botkit is has many features for building cool and useful bots!

 Read all about it here:

 -> http://howdy.ai/botkit

 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

/* Uses the slack button feature to offer a real time bot to multiple teams */
var Botkit = require('botkit');

var d = new Date();
// var n = d.getMinutes();

var batteryMoved;
var charging = [];
var uncharged = [];
var charged = ["max", "alton", "pranav", "jason", "louis"];

if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET || !process.env.PORT || !process.env.VERIFICATION_TOKEN) {
    console.log('Error: Specify CLIENT_ID, CLIENT_SECRET, VERIFICATION_TOKEN and PORT in environment');
    process.exit(1);
}

var config = {}
if (process.env.MONGOLAB_URI) {
    var BotkitStorage = require('botkit-storage-mongo');
    config = {
        storage: BotkitStorage({mongoUri: process.env.MONGOLAB_URI}),
    };
} else {
    config = {
        json_file_store: './db_slackbutton_slash_command/',
    };
}

var controller = Botkit.slackbot(config).configureSlackApp(
    {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scopes: ['commands'],
    }
);

controller.setupWebserver(process.env.PORT, function (err, webserver) {
    controller.createWebhookEndpoints(controller.webserver);

    controller.createOauthEndpoints(controller.webserver, function (err, req, res) {
        if (err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    });
});

// EDIT ME!
controller.on('slash_command', function (slashCommand, message) {

    switch (message.command) {
        case "/foodme": //handle the `/foodme` slash command. We might have others assigned to this app too!

            // Let's make sure the token matches. No imposters allowed!
            if (message.token !== process.env.VERIFICATION_TOKEN) return; //just ignore it.

            if (message.text === "test") {
              // Master list of foodmoji
              foodmoji = [":coffee:",":tea:",":sake:",":baby_bottle:", 
                ":beer:",":beers:",":cocktail:",":tropical_drink:", 
                ":wine_glass:",":fork_and_knife:",":pizza:",":hamburger:", 
                ":fries:",":poultry_leg:",":meat_on_bone:",":spaghetti:", 
                ":curry:",":fried_shrimp:",":bento:",":sushi:",":fish_cake:", 
                ":rice_ball:",":rice_cracker:",":rice:",":ramen:",":stew:", 
                ":oden:",":dango:",":egg:",":bread:",":doughnut:",":custard:", 
                ":icecream:",":ice_cream:",":shaved_ice:",":birthday:", 
                ":cake:",":cookie:",":chocolate_bar:",":candy:",":lollipop:", 
                ":honey_pot:",":apple:",":green_apple:",":tangerine:", 
                ":lemon:",":cherries:",":grapes:",":watermelon:", 
                ":strawberry:",":peach:",":melon:",":banana:",":pear:", 
                ":pineapple:",":sweet_potato:",":eggplant:",":tomato:", 
                ":corn:"];

              var food1 = foodmoji[Math.floor(Math.random() * foodmoji.length)];
              var food2 = foodmoji[Math.floor(Math.random() * foodmoji.length)];
              var food3 = foodmoji[Math.floor(Math.random() * foodmoji.length)];

              slashCommand.replyPublic(message, "How about having " + food1 + " + " + food2 + " + " + food3 + " tonight?");

            }

            // /foodme help displays this message
            if (message.text === "help") {
              slashCommand.replyPrivate(message, "Foodme is a Slack command" +
                " that helps you find something to eat. Just type `/foodme`" +
                " to start.")
            }

            break;
        case "/battery":

            if (message.token !== process.env.VERIFICATION_TOKEN) return;

            if(message.text.includes("-charging")) {
                if(message.text === "-charging") {
                    slashCommand.replyPrivate(message, "please input a valid battery name");
                }

                else {
                    batteryMoved = false;
                    for(i = 0; i < charged.length; i++) {
                        if(message.text.toLowerCase().includes(charged[i])) {
                            charging.push(charged[i]);
                            batteryMoved = true;
                            console.log(charging);
                            var contents = JSON.stringify({
                                "blocks": [
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "mrkdwn",
                                            "text": "Battery " + "\"" + charged[i] + "\"" + " added to charging list."
                                        }
                                    },
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "mrkdwn",
                                            "text": "*Currently Charging Batteries:*"
                                        }
                                    },
                                    {
                                        "type": "section",
                                        "text": {
                                            "type": "plain_text",
                                            "text": charging.join(', '),
                                            "emoji": true
                                        }
                                    },
                                    {
                                        "type": "divider"
                                    }
                                ]
                            });
                            charged.splice(i, 1);
                            slashCommand.replyPublic(message, JSON.parse(contents));
                        } 
                    }
                    if(!batteryMoved) {
                        for(i = 0; i < uncharged.length; i++) {
                            if(message.text.toLowerCase().includes(uncharged[i])) {
                                slashCommand.replyPublic(message, "Battery " + "\"" + uncharged[i] + "\"" + " is charging.");
                                charging.push(uncharged[i]);
                                uncharged.splice(i, 1);
                                batteryMoved = true;
                                console.log(charging);
                            } 
                        }
                    }
                    if(!batteryMoved) {
                        for (i = 0; i < charging.length; i++) {
                            if(message.text.toLowerCase().includes(charging[i])) {
                                slashCommand.replyPrivate(message, "this battery is already charging.");
                                batteryMoved = true;
                            }
                        }
                    }
                    if(!batteryMoved) {
                        slashCommand.replyPrivate(message, "battery does not exist.");
                    }
                }
            }
            else if(message.text.includes("-charged")) {
                if(message.text === "-charged") {
                    slashCommand.replyPrivate(message, "please input a valid battery name");
                }

                else {
                    batteryMoved = false;
                    for(i = 0; i < charging.length; i++) {
                        if(message.text.toLowerCase().includes(charging[i])) {
                            slashCommand.replyPublic(message, "Battery " + "\"" + charging[i] + "\"" + " is charged.");
                            charged.push(charging[i]);
                            charging.splice(i, 1);
                            batteryMoved = true;
                            console.log(charged);
                        } 
                    }
                    if(!batteryMoved) {
                        for(i = 0; i < uncharged.length; i++) {
                            if(message.text.toLowerCase().includes(uncharged[i])) {
                                slashCommand.replyPublic(message, "Battery " + "\"" + uncharged[i] + "\"" + " is charged.");
                                charged.push(uncharged[i]);
                                uncharged.splice(i, 1);
                                batteryMoved = true;
                                console.log(charged);
                            } 
                        }
                    }
                    if(!batteryMoved) {
                        for (i = 0; i < charged.length; i++) {
                            if(message.text.toLowerCase().includes(charged[i])) {
                                slashCommand.replyPrivate(message, "this battery is already charging.");
                                batteryMoved = true;
                            }
                        }
                    }
                    if(!batteryMoved) {
                        slashCommand.replyPrivate(message, "battery does not exist.");
                    }
                }
            }
            else if(message.text.includes("-uncharged")) {
                if(message.text === "-uncharged") {
                    slashCommand.replyPrivate(message, "please input a valid battery name");
                }

                else {
                    batteryMoved = false;
                    for(i = 0; i < charging.length; i++) {
                        if(message.text.toLowerCase().includes(charging[i])) {
                            slashCommand.replyPublic(message, "Battery " + "\"" + charging[i] + "\"" + " is uncharged.");
                            uncharged.push(charging[i]);
                            charging.splice(i, 1);
                            batteryMoved = true;
                            console.log(charged);
                        } 
                    }
                    if(!batteryMoved) {
                        for(i = 0; i < charged.length; i++) {
                            if(message.text.toLowerCase().includes(charged[i])) {
                                slashCommand.replyPublic(message, "Battery " + "\"" + charged[i] + "\"" + " is uncharged.");
                                uncharged.push(charged[i]);
                                charged.splice(i, 1);
                                batteryMoved = true;
                                console.log(charged);
                            } 
                        }
                    }
                    if(!batteryMoved) {
                        for (i = 0; i < uncharged.length; i++) {
                            if(message.text.toLowerCase().includes(uncharged[i])) {
                                slashCommand.replyPrivate(message, "this battery is already uncharged.");
                                batteryMoved = true;
                            }
                        }
                    }
                    if(!batteryMoved) {
                        slashCommand.replyPrivate(message, "battery does not exist.");
                    }
                }
            }

            else if(message.text.includes("add ")) {
                var batt = message.text.slice(3, (message.text.length - 1));
                if(!charging.includes(batt)) {
                    charged.push(batt);
                    slashCommand.replyPublic(message, "added " + batt + " to charged battery list");
                }
            } 

            else if(message.text === "list") {
                // slashCommand.replyPublic(message, "currently charging: " + charging);
                // slashCommand.replyPublicDelayed(message, "currently Not charging: " + charged);

                var contents = JSON.stringify({
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*Currently Charged Batteries:*"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": charged.join(', ') + " ",
                                "emoji": true
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*Currently Charging Batteries:*"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": charging.join(', ') + " ",
                                "emoji": true
                            }
                        },
                        {
                            "type": "divider"
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*Currently Uncharged Batteries: *"
                            }
                        },
                        {
                            "type": "section",
                            "text": {
                                "type": "plain_text",
                                "text": uncharged.join(', ') + " ",
                                "emoji": true
                            }
                        },
                        {
                            "type": "divider"
                        }
                    ]
                });

                console.log(contents);
                
                var parsedContents = JSON.parse(contents);
                
                // slashCommand.replyPublic(message, "recieved");
                slashCommand.replyPublic(message, parsedContents);

            }

            break;
        
        case "/list":

            

            break;
        default:
            slashCommand.replyPublic(message, "I'm sorry " + message.user +
                ", I'm afraid I can't do that. :robot_face:");

    }

});

setInterval(function() {
    if(charging.length > 0) {

        var block = {
            text: 'battery ' + charging.join(', ') + ' is still charging!',
            channel: '#general',
          };

        var bot = controller.spawn({
            incoming_webhook: {
              url: "https://hooks.slack.com/services/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"
            }
          })
          
          bot.sendWebhook(block, function(err,res) {
            if (err) {
              // ...
            }
          });
    }
}
, 900000);
