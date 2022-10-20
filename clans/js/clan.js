const header = {
    "clans": ["Roll", "Name"]
};

const bodyAPI = {
    "clans": ["type", "name"]
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

function generateTableHeader() {
    let tempheaders = header['clans'];
    let generatedString = "<th></th>";
    for (const element of tempheaders) {
        generatedString += '<th>' + element + '</th>';
    }
    return generatedString;
}

function generateTableBody(clanname) {
    return new Promise(function (resolve, reject) {

        let generatedString = "";

        $.get('https://api.greev.eu/v2/clan/' + clanname, function (d) {
            generateHeader(d.name, d.tag, d.size, d.playerperformance);
        });

        $.get('https://api.greev.eu/v2/clan/members/' + clanname, function (members) {
            for (let i = 0; i < members.length; i++) {
                let tempheaders = bodyAPI['clans'];
                let tempString = "<tr><td>" + (i + 1) + "</td>";
                for (const element of tempheaders) {
                    let data = members[i][element];
                    if (element === "type") {
                        if (data === 1) {
                            data = "Leader";
                        } else {
                            data = "Member";
                        }
                    }
                    if (element === "name") {
                        data = generateUsernameColumn(data);
                    }
                    tempString += '<td>' + data + '</td>';
                }
                tempString += "</tr>";
                generatedString += tempString;
            }
            resolve(generatedString);
        });
    });
}

function generateHeader(name, tag, members, pp) {
    let clanname = `<div class="col-md-3"><div class="well well-inside"><p class="clanSiteTitle">Clan Name</p><p class="clanSiteText">${name}</p></div></div>`;
    let clanTag = `<div class="col-md-3"><div class="well well-inside"><p class="clanSiteTitle">Clan Tag</p><p class="clanSiteText">${tag}</p></div></div>`;
    let clanmembers = `<div class="col-md-3"><div class="well well-inside"><p class="clanSiteTitle">Members</p><p class="clanSiteText">${members}</p></div></div>`;
    let clanpp = `<div class="col-md-3"><div class="well well-inside"><p class="clanSiteTitle">Playerperformance</p><p class="clanSiteText">${pp}</p></div></div>`;
    setTableHeader(clanname + clanTag + clanmembers + clanpp);
}

function setTableHeader(html) {
    document.getElementById('extraInfo').innerHTML = html;
}

function generateUsernameColumn(username) {
    return `<a class='usernameListe' href='https://greev.eu/stats/player/?u=${username}'><img src='https://minotar.net/helm/${username}/20' class='skull' alt=""><p class='playername'>${username}</p></a>`
}

function generateFullTable(clanname) {
    return new Promise(function (resolve, reject) {
        generateTableBody(clanname).then((result) => {
            let output = '<table class="table"><thead><tr>' + generateTableHeader(clanname) + '</tr></thead><tbody><tr>' + result + '</tr></tbody></table>';
            resolve(output);
        });
    });
}
