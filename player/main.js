const realNames = {
    "bedwars": ["Wins", "Loses", "Kills", "Deaths", "Broken Beds"],
    "rush": ["Wins", "Loses", "Kills", "Deaths", "Broken Beds"],
    "quake": ["Wins", "Loses", "Kills", "Deaths"],
    "skywars": ["Wins", "Loses", "Kills", "Deaths"],
    "knockPvp": ["Kills", "Deaths"],
    "knockFfa": ["Kills", "Deaths"],
    "oneVsOne": ["Kills", "Deaths"],
    "mlgrush": ["Wins", "Loses", "Broken Beds"],
    "oneline": ["Kills", "Deaths"],
    "qsg": ["Wins", "Loses", "Kills", "Deaths"],
    "sumo": ["Kills", "Deaths"],
    "spleef": ["Wins", "Loses"],
    "bowspleef": ["Wins", "Loses"],
    "uhc": ["Wins", "Loses", "Kills", "Deaths"],
    "tntrun": ["Wins", "Loses"],
};

const apiNames = {
    "bedwars": ["wins", "loses", "kills", "deaths", "brokenBeds"],
    "rush": ["wins", "loses", "kills", "deaths", "brokenBeds"],
    "quake": ["wins", "loses", "kills", "deaths"],
    "skywars": ["wins", "loses", "kills", "deaths"],
    "uhc": ["wins", "loses", "kills", "deaths"],
    "qsg": ["wins", "loses", "kills", "deaths"],
    "oneline": ["kills", "deaths"],
    "sumo": ["kills", "deaths"],
    "spleef": ["wins", "loses"],
    "tntrun": ["wins", "loses"],
    "bowspleef": ["wins", "loses"],
    "knockPvp": ["kills", "deaths"],
    "knockFfa": ["kills", "deaths"],
    "oneVsOne": ["kills", "deaths"],
    "mlgrush": ["wins", "loses", "breaks"]
};

function findGetParameter(parameterName) {
    let result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
            tmp = item.split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function getPlayerUUID(name) {
    return new Promise(function (resolve, reject) {
        $.get('https://api.greev.eu/v2/player/uuid/' + name, function (data) {
            resolve(data.uuid);
        });
    });
}

function generateTable(uuid) {
    return new Promise(function (resolve, reject) {
        let table = "";
        $.get('https://api.greev.eu/v2/player/stats/' + uuid, function (data) {
            Object.keys(apiNames).forEach(function (key) {

                let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">${key}</h2><table class="playerTable">`;

                let keyArray = apiNames[key];
                let realNameI = 0;
                keyArray.forEach((name) => {

                    let realName = realNames[key][realNameI];
                    let statValue = data["stats"].hasOwnProperty(key) ? data["stats"][key][name] : 0;

                    miniTable += generateTableEntry(realName, statValue);

                    realNameI++;
                });

                if (keyArray.includes("kills") && keyArray.includes("deaths")) {
                    if (data["stats"].hasOwnProperty(key)) {
                        miniTable += generateTableEntry("K / D", (data["stats"][key]["kills"] / data["stats"][key]["deaths"]).toFixed(2));
                    } else {
                        miniTable += generateTableEntry("K / D", "0");
                    }
                }

                if (keyArray.includes("wins") && keyArray.includes("loses")) {
                    if (data["stats"].hasOwnProperty(key)) {
                        miniTable += generateTableEntry("W / L", (data["stats"][key]["wins"] / data["stats"][key]["loses"]).toFixed(2));
                    } else {
                        miniTable += generateTableEntry("W / L", "0");
                    }
                }

                miniTable += `</table></div></div>`;
                table += miniTable;
            });

            table += generateClanCard(data);

            table += fastbridgeCard(data, "NORMAL");
            table += fastbridgeCard(data, "SHORT");
            table += fastbridgeCard(data, "INCLINED");
            table += fastbridgeCard(data, "INCLINED_SHORT");

            table += fastbridgeIslandCard(data);

            table += generateRank(data);
            table += generateOther(data);

            resolve(table);
        });
    });
}

function generateClanCard(data) {
    let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">Clan</h2><table class="playerTable">`;

    if (data["clan"] === undefined || !data["clan"].hasOwnProperty("name")) {
        miniTable += generateTableEntry("Is in no clan", "");
        miniTable += generateTableEntry("", "");
        miniTable += generateTableEntry("", "");
        miniTable += generateTableEntry("", "");
    } else {
        miniTable += generateTableEntry("Clan Name", data["clan"]["name"]);
        miniTable += generateTableEntry("Clan Tag", data["clan"]["tag"]);
        miniTable += generateTableEntry("Members", data["clan"]["size"]);
        miniTable += generateTableEntry("Clan Role", data["clan"]["role"] === "leader" ? "Leader" : "Member");
    }

    miniTable += `</table></div></div>`;
    return miniTable;
}

function generateRank(data) {
    let rankMap = {
        'lead-developer': 'developer',
        'vip': 'VIP',
        'premiumplus': 'Premium+'
    };

    let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">Rank</h2><table class="playerTable">`;

    let rankName = rankMap[data['rank']['name']] ?? data['rank']['name'];
    let formattedRankName = rankName.split('-').map((word) => {
        return word[0].toUpperCase() + word.substring(1);
    }).join('-');

    miniTable += generateTableEntry('Rank', formattedRankName);
    miniTable += generateTableEntry('Until', data['rank']['until'] === 0 ? 'permanent' : timeConverter(data['rank']['until']));

    miniTable += `</table></div></div>`;
    return miniTable;
}

function fastbridgeCard(data, mode) {
    let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">Fastbridge ${mode}</h2><table class="playerTable">`;

    let fb = getFastbridgeTime(data, mode)

    miniTable += generateTableEntry("Time", fb === undefined ? "%" : fb["time"]);
    miniTable += generateTableEntry("Achieved on", fb === undefined ? "%" : fb["timestamp"]);

    miniTable += `</table></div></div>`;
    return miniTable;
}

function fastbridgeIslandCard(data) {
    let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">Fastbridge Islands</h2><table class="playerTable">`;

    miniTable += generateTableEntry("Cubes", getFastbridgeIslandTime(data, "Cubes"));
    miniTable += generateTableEntry("Rails", getFastbridgeIslandTime(data, "Rails"));
    miniTable += generateTableEntry("Street", getFastbridgeIslandTime(data, "Street"));
    miniTable += generateTableEntry("Coral", getFastbridgeIslandTime(data, "Coral"));
    miniTable += generateTableEntry("Athen", getFastbridgeIslandTime(data, "Athen"));

    miniTable += `</table></div></div>`;
    return miniTable;
}

function generateOther(data) {
    let miniTable = `<div class="col-md-6"><div class="well well-inside"><h2 class="playerStatsTitle">Other</h2><table class="playerTable">`;

    miniTable += generateTableEntry("Player Performance", data["playerperformance"]);
    miniTable += generateTableEntry("Tokens", data["tokens"]);
    miniTable += generateTableEntry("Current Loginstreak", data["loginstreak"] === undefined ? "0" : data["loginstreak"]["currentLoginStreak"]);
    miniTable += generateTableEntry("Highest Loginstreak", data["loginstreak"] === undefined ? "0" : data["loginstreak"]["maxLoginStreak"]);
    miniTable += generateTableEntry("Last Online", timeConverter(data["lastOnline"]));
    miniTable += generateTableEntry("First join", timeConverter(data["firstOnline"]));

    miniTable += `</table></div></div>`;
    return miniTable;
}

function generateTableEntry(name, value) {

    let miniTable = "";
    miniTable += `<tr>`;
    miniTable += `<td class="playerTD"><span class="info">${name}</span></td>`;
    miniTable += `<td class="playerTD"><span class="playerSt">${value}</span></td>`;
    miniTable += `</tr>`;
    return miniTable;

}

function getFastbridgeTime(data, mode) {
    for (let i = data["stats"]["fastbridge"].length - 1; i >= 0; i--) {
        if (data["stats"]["fastbridge"][i]["mode"] === mode) {
            return data["stats"]["fastbridge"][i]
        }
    }
}

function getFastbridgeIslandTime(data, map) {
    for (let i = data["stats"]["fastbridge"].length - 1; i >= 0; i--) {
        if (data["stats"]["fastbridge"][i]["mode"] === "ISLANDS" && data["stats"]["fastbridge"][i]["map"] === map) {
            return data["stats"]["fastbridge"][i]["time"]
        }
    }
    return "%"
}

function timeConverter(UNIX_timestamp) {
    let date = new Date(UNIX_timestamp * 1000);
    let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let year = date.getFullYear();
    let month = months[date.getMonth()];
    let dayOfMonth = date.getDate().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let hour = date.getHours().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let min = date.getMinutes().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
    let sec = date.getSeconds().toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});

    return `${dayOfMonth} ${month} ${year} ${hour}:${min}:${sec}`;
}

function mainRun() {
    let getName = findGetParameter("u");
    if (getName == null) {
        return;
    }

    document.getElementById("statsTitle").innerHTML = (getName + " Stats");
    document.getElementById("avatarImg").src = `https://minotar.net/armor/bust/${getName}/200.png`

    getPlayerUUID(getName).then((uuid) => {
        generateTable(uuid).then((table) => {
            document.getElementById("userStats").innerHTML = table;
        })
    });
}
