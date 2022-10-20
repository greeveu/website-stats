const header = {
    "bedwars": ["User", "Wins", "Losses", "Kills", "Deaths", "Broken Beds"],
    "rush": ["User", "Wins", "Losses", "Kills", "Deaths", "Broken Beds"],
    "quake": ["User", "Wins", "Losses", "Kills", "Deaths"],
    "skywars": ["User", "Wins", "Losses", "Kills", "Deaths"],
    "knockpvp": ["User", "Kills", "Deaths"],
    "knockffa": ["User", "Kills", "Deaths"],
    "snowballfight": ["User", "Kills", "Deaths"],
    "1vs1": ["User", "Kills", "Deaths"],
    "mlgrush": ["User", "Wins", "Losses", "Broken Beds"],
    "oneline": ["User", "Kills", "Deaths"],
    "qsg": ["User", "Wins", "Losses", "Kills", "Deaths"],
    "sumo": ["User", "Kills", "Deaths"],
    //"mlgrush": ["User", "Wins", "Lost"],
    "spleef": ["User", "Wins", "Lost"],
    "tntrun": ["User", "Wins", "Lost"],
    "cores": ["User", "Wins", "Losses", "Kills", "Deaths", "Broken Cores"],
    "fastbridge": ["User", "Time (Sec)"],
    "fastbridge_inclined": ["User", "Time (Sec)"],
    "fastbridge_staircase": ["User", "Time (Sec)"],
    "fastbridge_short": ["User", "Time (Sec)"],
    "fastbridge_inclined_short": ["User", "Time (Sec)"],
    "loginstreak": ["User", "Highest Loginstreak", "Current Loginstreak"],
    "bowspleef": ["User", "Wins", "Lost"],
    "uhc": ["User", "Wins", "Losses", "Kills", "Deaths"],
    "performance": ["User", "Player Performance"],
    "clans": ["Name", "Tag", "Members", "CombinedPerformance"],
    "tokens": ["User", "Tokens"],
};

const bodyAPI = {
    "bedwars": ["name", "wins", "loses", "kills", "deaths", "brokenBeds"],
    "rush": ["name", "wins", "loses", "kills", "deaths", "brokenBeds"],
    "quake": ["name", "wins", "loses", "kills", "deaths"],
    "skywars": ["name", "wins", "loses", "kills", "deaths"],
    "knockpvp": ["name", "kills", "deaths"],
    "knockffa": ["name", "kills", "deaths"],
    "snowballfight": ["name", "kills", "deaths"],
    "1vs1": ["name", "kills", "deaths"],
    "mlgrush": ["name", "wins", "loses", "breaks"],
    "oneline": ["name", "kills", "deaths"],
    "qsg": ["name", "wins", "loses", "kills", "deaths"],
    "sumo": ["name", "kills", "deaths"],
    //"mlgrush": ["name", "wins", "loses"],
    "spleef": ["name", "wins", "loses"],
    "tntrun": ["name", "wins", "loses"],
    "cores": ["name", "wins", "loses", "kills", "deaths", "brokenCores"],
    "fastbridge": ["name", "time"],
    "fastbridge_inclined": ["name", "time"],
    "fastbridge_staircase": ["name", "time"],
    "fastbridge_short": ["name", "time"],
    "fastbridge_inclined_short": ["name", "time"],
    "loginstreak": ["name", "maxstreak", "currentstreak"],
    "bowspleef": ["name", "wins", "loses"],
    "uhc": ["name", "wins", "loses", "kills", "deaths"],
    "performance": ["name", "playerperformance"],
    "clans": ["name", "tag", "size", "performance"],
    "tokens": ["name", "tokens"],
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

function generateTableHeader(game) {
    let tempheaders = header[game];
    let generatedString = "<th>Place</th>";
    for (const element of tempheaders) {
        generatedString += '<th>' + element + '</th>';
    }
    return generatedString;
}

function generateTableBody(game, page) {
    return new Promise(function (resolve, reject) {

        let generatedString = "";
        let offset = (25 * page);

        $.get('https://api.greev.eu/v2/stats/' + game + '/top?count=25&offset=' + offset, function (d) {

            for (let i = 0; i < d.length; i++) {
                let tempheaders = bodyAPI[game];
                let tempString = "<tr><td>" + (i + offset + 1) + "</td>";
                for (const element of tempheaders) {
                    let n = element;
                    if (n === "name") {
                        tempString += generateUsernameColumn(d[i][n], d[i]["uuid"]);
                        continue;
                    }

                    /**
                     * FASTBRIDGE ONLY
                     */
                    if (n === "time") {
                        let timestamp = new Date(d[i]["timestamp"]);
                        let time = d[i][n] + "";
                        if(!time.includes(".")) {
                            time = time + ".000";
                        }
                        time = time.split(".")[0] + "." + (time.split(".")[1].padEnd(3, '0'))
                        if (d[i]["verified"] === true) {
                            tempString += '<td>' + time + '&nbsp;<span class="timeInfoVerified" title="This time was verified.">&#10004;</span></td>';
                        } else {
                            if (new Date().getTime() - timestamp.getTime() < 86400000) {
                                tempString += '<td>' + time + '&nbsp;<span class="timeInfo" title="This time was achieved less than 24 hours ago.">❗</span></td>'; //
                            } else {
                                tempString += '<td>' + time + '</td>';
                            }
                        }
                        console.log(new Date().getTime() - timestamp.getTime());
                        continue;
                    }

                    tempString += '<td>' + d[i][n] + '</td>';
                }
                tempString += "</tr>";
                generatedString += tempString;
            }
            resolve(generatedString);
        });
    });
}

function generateUsernameColumn(username, uuid) {
    return `<td><a class='usernameListe' href='https://greev.eu/stats/player/?u=${username}'><img src='https://crafatar.com/avatars/${uuid}?size=20&default=MHF_Steve&overlay' class='skull'><p class='playername'>${username}</p></a></td>`
}

function generateFullTable(game, page = 0) {
    return new Promise(function (resolve, reject) {
        generateTableBody(game, page).then((result) => {
            let output = '<table class="table"><thead><tr>' + generateTableHeader(game) + '</tr></thead><tbody><tr>' + result + '</tr></tbody></table>';
            resolve(output);
        });
    });
}