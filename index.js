const config = require("./config.json");

const fetch = require('node-fetch');

const port = 7778;

const wargamingapikey = config.wargaming.applicationId;

const API = require('call-of-duty-api')();

API.login(config.CODAPI.email, config.CODAPI.pass).then().catch();

var runner = require("child_process");

const request = require('request')

const express = require('express')

, logger = require('morgan')

, cache = require('express-cache-response')

, rateLimit = require("express-rate-limit")

, app = express()

app.set('trust proxy', 1);


const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 10,
    message: '{"status": 429, "message": "Too many Requests from this IP, please try again after 5 minutes"}'
});

app.get('/', function(req, res) { res.send(JSON.stringify({ "status": "ok", "online": 1, "servername": "GAMING API Server" })); });

/* ================================================================================================ */
/* ==== Apex Legends API ==== */
/* ================================================================================================ */
app.get('/v1/apex/:plat/:username', function(req, res) {
	
	var username = req.params.username;	
	var plat = req.params.plat;	
	
	res.header("Access-Control-Allow-Origin", "*");
	res.contentType('application/json');
	
	const Apex = require('apex-api');
    const apex = new Apex('ef58b503-4ae3-4ecc-ab7d-88488b76fd38');
 
    apex.user(username, plat).then(data => {
        res.send(data.data)
    });
	
});

/* ================================================================================================ */
/* ==== Runescape 3 API ==== */
/* ================================================================================================ */
app.get('/v1/rs3/:username', function(req, res) {
	
	var username = req.params.username;		
	
	res.header("Access-Control-Allow-Origin", "*");
	res.contentType('application/json');
	
	request("https://apps.runescape.com/runemetrics/profile/profile?user="+username+"&activities=2", function(err1, res1, body1) {
	
		var data = JSON.parse(body1);
		
		if (data.error == "NO_PROFILE") return res.send(JSON.stringify({"status": "error", "message": "Account not Found!"}))
        res.send(JSON.stringify({"status": "ok", "name": data.name, "online": data.loggedIn, "quest_started": data.questsstarted, "quest_todo": data.questsnotstarted, "quest_done": data.questscomplete, "alerts": { "latest": { "date": data.activities[0].date, "details": data.activities[0].details, "text": data.activities[0].text}, "last": { "date": data.activities[1].date, "details": data.activities[1].details, "text": data.activities[1].text} }, "skills": { "mining": data.skillvalues[0].level, "fletching": data.skillvalues[1].level, "cooking": data.skillvalues[2].level, "firemaking": data.skillvalues[3].level, "smithing": data.skillvalues[4].level, "woodcutting": data.skillvalues[5].level, "prayer": data.skillvalues[6].level, "dungeoneering": data.skillvalues[7].level, "defence": data.skillvalues[8].level, "fishing": data.skillvalues[9].level, "crafting": data.skillvalues[10].level, "runecrafting": data.skillvalues[11].level, "magic": data.skillvalues[12].level, "attack": data.skillvalues[13].level, "constitution": data.skillvalues[14].level, "strength": data.skillvalues[15].level, "ranged": data.skillvalues[16].level, "construction": data.skillvalues[17].level, "agility": data.skillvalues[18].level, "thieving": data.skillvalues[19].level, "slayer": data.skillvalues[20].level, "summoning": data.skillvalues[21].level, "farming": data.skillvalues[22].level, "herblore": data.skillvalues[23].level, "divination": data.skillvalues[24].level, "hunter": data.skillvalues[25].level, "archaeology": data.skillvalues[26].level, "invention": data.skillvalues[27].level}}))
    })
	
});

/* ================================================================================================ */
/* ==== WarGaming API ==== */
/* ================================================================================================ */

app.get('/v1/game/wg/wot/:username', apiLimiter, function(req, res) {

    const Wargamer = require('wargamer').default;

    const wot = Wargamer.WoT({ realm: 'eu', applicationId: wargamingapikey });


    var username = req.params.username;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');


    wot.get('account/list', { search: username })
        .then((response) => {
            wot.get('account/info', { account_id: response.data[0].account_id, extra: "statistics.epic,statistics.fallout,statistics.random,statistics.ranked_battles", language: "en" })
                .then((response11) => {
                    res.send(response11.data[response.data[0].account_id])
                })
        })
        .catch((error) => {
            res.send(JSON.stringify({ "error": 404, "message": "Username not Found!" }));
        });

});

app.get('/v1/game/wg/wows/:username', apiLimiter, function(req, res) {

    const Wargamer = require('wargamer').default;
    const WorldOfWarships = require('wargamer').WorldOfWarships;

    const wows = new WorldOfWarships({ realm: 'eu', applicationId: wargamingapikey });


    var username = req.params.username;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');


    wows.get('account/list', { search: username })
        .then((response) => {
            wows.get('account/info', { account_id: response.data[0].account_id, extra: "statistics.pve,statistics.rank_solo,statistics.club" })
                .then((response11) => {
                    res.send(response11.data[response.data[0].account_id])
                })
        })
        .catch((error) => {
            res.send(JSON.stringify({ "error": 404, "message": "Username not Found!" }));
        });

});


app.get('/v1/game/wg/wowp/:username', apiLimiter, function(req, res) {

    const Wargamer = require('wargamer').default;
    const WorldOfWarplanes = require('wargamer').WorldOfWarplanes;

    const wowp = new WorldOfWarplanes({ realm: 'eu', applicationId: wargamingapikey });


    var username = req.params.username;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');


    wowp.get('account/list', { search: username })
        .then((response) => {
            wowp.get('account/info', { account_id: response.data[0].account_id, fields: "statistics.all,statistics" })
                .then((response11) => {
                    res.send(response11.data[response.data[0].account_id])
                })
        })
        .catch((error) => {
            res.send(JSON.stringify({ "error": 404, "message": "Username not Found!" }));
        });

});

app.get('/v1/game/wg/wotb/:username', apiLimiter, function(req, res) {

    const Wargamer = require('wargamer').default;
    const WorldOfTanksBlitz = require('wargamer').WorldOfTanksBlitz;

    const wotb = new WorldOfTanksBlitz({ realm: 'eu', applicationId: wargamingapikey });


    var username = req.params.username;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');


    wotb.get('account/list', { search: username })
        .then((response) => {
            wotb.get('account/info', { account_id: response.data[0].account_id, fields: "statistics.all,statistics" })
                .then((response11) => {
                    res.send(response11.data[response.data[0].account_id])
                })
        })
        .catch((error) => {
            res.send(JSON.stringify({ "error": 404, "message": "Username not Found!" }));
        });

});

/* ================================================================================================ */
/* ==== COD API ==== */
/* ================================================================================================ */

app.get('/v1/game/cod/bo4/:plat/:gm/:username', apiLimiter, function(req, res) {

    var username = req.params.username;
    var gamemode = req.params.gm;
    var plat = req.params.plat;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (gamemode == "mp") {

        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }

        API.BO4Stats(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else if (gamemode == "zm") {


        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        //if (plat == "pc") return res.send(JSON.stringify({ "error": 404, "message": "PC API not Supported" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else if (plat == "pc") {
            var platform = API.platforms.pc
		} else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }

        API.BO4zm(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else {

        res.send(JSON.stringify({ "error": 404, "message": "Theres no other platforms then mp and zm" }));

    }
});

app.get('/v1/game/cod/mw/:plat/:gm/:username', apiLimiter, function(req, res) {

    var username = req.params.username;
    var gamemode = req.params.gm;
    var plat = req.params.plat;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (gamemode == "mp") {

        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        if (plat == "pc") return res.send(JSON.stringify({ "error": 404, "message": "PC API not Supported" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }


        API.MWmp(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else {

        res.send(JSON.stringify({ "error": 404, "message": "Theres no other platforms then mp" }));

    }
});

app.get('/v1/game/cod/iw/:plat/:gm/:username', apiLimiter, function(req, res) {

    var username = req.params.username;
    var gamemode = req.params.gm;
    var plat = req.params.plat;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (gamemode == "mp") {

        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        if (plat == "pc") return res.send(JSON.stringify({ "error": 404, "message": "PC API not Supported" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }


        API.IWStats(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else {

        res.send(JSON.stringify({ "error": 404, "message": "Theres no other platforms then mp" }));

    }
});

app.get('/v1/game/cod/wwii/:plat/:gm/:username', apiLimiter, function(req, res) {

    var username = req.params.username;
    var gamemode = req.params.gm;
    var plat = req.params.plat;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (gamemode == "mp") {

        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        if (plat == "pc") return res.send(JSON.stringify({ "error": 404, "message": "PC API not Supported" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }


        API.WWIIStats(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else {

        res.send(JSON.stringify({ "error": 404, "message": "Theres no other platforms then mp" }));

    }
});

app.get('/v1/game/cod/bo3/:plat/:gm/:username', apiLimiter, function(req, res) {

    var username = req.params.username;
    var gamemode = req.params.gm;
    var plat = req.params.plat;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (gamemode == "mp") {

        if (plat.match(/psn|xbl|pc/g) == null) return res.send(JSON.stringify({ "error": 404, "message": "That Platform not Valid Infomation, Try again or check your spelling" }));

        if (plat == "pc") return res.send(JSON.stringify({ "error": 404, "message": "PC API not Supported" }));

        if (plat == "psn") {
            var platform = API.platforms.psn
        } else if (plat == "xbl") {
            var platform = API.platforms.xbl
        } else {

            res.send(JSON.stringify({ "error": 404, "message": "Wrong Platform" }));

        }

        API.BO3Stats(username, platform).then((output) => {

            res.send(JSON.stringify(output));

        }).catch((err) => {
            var errors = { "error": 404, "message": err }
            res.send(JSON.stringify(errors));
        });
    } else {

        res.send(JSON.stringify({ "error": 404, "message": "Theres no other platforms then mp" }));

    }
});

/* ================================================================================================ */
/* ==== Destiny 2 API ==== */
/* ================================================================================================ */

app.get('/v1/game/bungie/d2/profile/:platform/:username/:num', apiLimiter, function(req, res) {

    const Destiny2API = require('node-destiny-2');

    const destiny = new Destiny2API({
        key: config.bungieapi
    });

    var username = req.params.username;

    var plat = req.params.platform;

    var num = req.params.num;

    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    if (plat == "steam") {
        destiny.searchDestinyPlayer(3, username)
            .then(res1 => {
                const data = res1.Response;

                destiny.getProfile(3, data[0].membershipId, [100])
                    .then(res2 => {
                        if (num == 1) {
                            destiny.getCharacter(3, data[0].membershipId, res2.Response.profile.data.characterIds[0], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                });
                        }

                        if (num == 2) {
                            destiny.getCharacter(3, data[0].membershipId, res2.Response.profile.data.characterIds[1], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                });
                        }

                        if (num == 3) {
                            destiny.getCharacter(3, data[0].membershipId, res2.Response.profile.data.characterIds[2], [200, 205])
                                .then(res5 => {

                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                });
                        }
                    })
                    .catch(err => {
                        res.send(JSON.stringify({ "error": 404, "message": "Account not found" }));
                    });

            })
            .catch(err => {
                res.send(JSON.stringify({ "error": 404, "message": "Username not found" }));
            });

    } else if (plat == "psn") {

        destiny.searchDestinyPlayer(2, username)
            .then(res1 => {
                const data = res1.Response;

                destiny.getProfile(2, data[0].membershipId, [100])
                    .then(res2 => {
                        if (num == 1) {
                            destiny.getCharacter(2, data[0].membershipId, res2.Response.profile.data.characterIds[0], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                });
                        }

                        if (num == 2) {
                            destiny.getCharacter(2, data[0].membershipId, res2.Response.profile.data.characterIds[1], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                });
                        }

                        if (num == 3) {
                            destiny.getCharacter(2, data[0].membershipId, res2.Response.profile.data.characterIds[2], [200, 205])
                                .then(res5 => {

                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                });
                        }
                    })
                    .catch(err => {
                        res.send(JSON.stringify({ "error": 404, "message": "Account not found" }));
                    });

            })
            .catch(err => {
                res.send(JSON.stringify({ "error": 404, "message": "Username not found" }));
            });

    } else if (plat == "xbl") {

        destiny.searchDestinyPlayer(1, username)
            .then(res1 => {
                const data = res1.Response;

                destiny.getProfile(1, data[0].membershipId, [100])
                    .then(res2 => {
                        if (num == 1) {
                            destiny.getCharacter(1, data[0].membershipId, res2.Response.profile.data.characterIds[0], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 1st Character on Destiny 2" }));
                                });
                        }

                        if (num == 2) {
                            destiny.getCharacter(1, data[0].membershipId, res2.Response.profile.data.characterIds[1], [200, 205])
                                .then(res5 => {
                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 2nd Character on Destiny 2" }));
                                });
                        }

                        if (num == 3) {
                            destiny.getCharacter(1, data[0].membershipId, res2.Response.profile.data.characterIds[2], [200, 205])
                                .then(res5 => {

                                    if (res5.ErrorCode != 7) {
                                        res.send(JSON.stringify(res5.Response));
                                    } else {
                                        res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                    }
                                })
                                .catch(err => {
                                    res.send(JSON.stringify({ "error": 7, "message": "You dont have 3rd Character on Destiny 2" }));
                                });
                        }
                    })
                    .catch(err => {
                        res.send(JSON.stringify({ "error": 404, "message": "Account not found" }));
                    });

            })
            .catch(err => {
                res.send(JSON.stringify({ "error": 404, "message": "Username not found" }));
            });

    } else if (plat == "stadia") {
        /*
			
			
			destiny.searchDestinyPlayer(5, username)
			.then(res1 => {
				const data = res1.Response;
		
			destiny.getProfile(5, data[0].membershipId, [100])
			.then(res2 => {
				//console.log(res1.Response.profile.data.characterIds[2]);
				if (num == 1){
					destiny.getCharacter(5, data[0].membershipId, res2.Response.profile.data.characterIds[0], [200, 205]) 
						.then(res5 => {
							if (res5.ErrorCode != 7){
								res.send(JSON.stringify(res5.Response));
							} else {
								res.send(JSON.stringify({"error": 7, "message": "You dont have 1st Character on Destiny 2"}));
							}
						})
						.catch(err => {
							res.send(JSON.stringify({"error": 7, "message": "You dont have 1st Character on Destiny 2"}));
							//console.log(`getCharacter Error: ${err}`);
					});
				}
				
				if (num == 2){
					destiny.getCharacter(5, data[0].membershipId, res2.Response.profile.data.characterIds[1], [200, 205]) 
						.then(res5 => {
							if (res5.ErrorCode != 7){
								res.send(JSON.stringify(res5.Response));
							} else {
								res.send(JSON.stringify({"error": 7, "message": "You dont have 2nd Character on Destiny 2"}));
							}
						})
						.catch(err => {
							res.send(JSON.stringify({"error": 7, "message": "You dont have 2nd Character on Destiny 2"}));
							//console.log(`getCharacter Error: ${err}`);
					});
				}
				
				if (num == 3){
					destiny.getCharacter(5, data[0].membershipId, res2.Response.profile.data.characterIds[2], [200, 205]) 
						.then(res5 => {
							
							if (res5.ErrorCode != 7){
								res.send(JSON.stringify(res5.Response));
							} else {
								res.send(JSON.stringify({"error": 7, "message": "You dont have 3rd Character on Destiny 2"}));
							}
						})
						.catch(err => {
							res.send(JSON.stringify({"error": 7, "message": "You dont have 3rd Character on Destiny 2"}));
							//console.log(`getCharacter Error: ${err}`);
					});
				}
				})
			.catch(err => {
				res.send(JSON.stringify({"error": 404, "message": "Account not found"}));
				//console.error(`getProfile Error: ${err}`);
		});

    })
    .catch(err => {
		res.send(JSON.stringify({"error": 404, "message": "Username not found"}));
        //console.error(`searchPlayer Error: ${err}`);
    });
			
			
			*/

        res.send(JSON.stringify({ "error": 403, "message": "Google Stadia API not OUT YET on Destiny API" }));
    } else {
        res.send(JSON.stringify({ "error": 404, "message": "You didnt enter Correct Platform" }));
    }

});

app.get('/v1/game/bungie/d2/clans/weekly/:username', apiLimiter, function(req, res) {

    const Destiny2API = require('node-destiny-2');

    const destiny = new Destiny2API({
        key: config.bungieapi
    });

    var username = req.params.username;


    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    destiny.getClanWeeklyRewardState(username)
        .then(res1 => {
            if (res1.ErrorCode != 686) {
                res.send(JSON.stringify(res1.Response));

            } else {
                res.send(JSON.stringify({ "error": 686, "message": "Clan not Found" }));
            }
        })
        .catch(err => {
            console.log(`getClanWeeklyRewardState Error: ${err}`);
        });

});


app.get('/v1/game/bungie/d2/clans/aggregate/:username', apiLimiter, function(req, res) {

    const Destiny2API = require('node-destiny-2');

    const destiny = new Destiny2API({
        key: config.bungieapi
    });

    var username = req.params.username;


    res.header("Access-Control-Allow-Origin", "*");

    res.contentType('application/json');

    destiny.getClanAggregateStats(username)
        .then(res1 => {
            if (res1.ErrorCode != 686) {
                res.send(JSON.stringify(res1.Response));

            } else {
                res.send(JSON.stringify({ "error": 686, "message": "Clan not Found" }));
            }
        })
        .catch(err => {
            console.log(err);
        });

});


/* ================================================================================================ */

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));