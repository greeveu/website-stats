const header = {
    "clans": ["Name", "Tag", "Size", "Combined PP"]
};

const bodyAPI = {
    "clans": ["name", "tag", "size", "playerperformance"]
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
    let generatedString = "<th>Platz</th>";
    for (const element of tempheaders) {
        generatedString += '<th>' + element + '</th>';
    }
    return generatedString;
}

function generateTableBody(page) {
    return new Promise(function (resolve, reject) {

        let generatedString = "";
        let offset = (25 * page);

        $.get('https://api.greev.eu/v2/clan/top?count=25&offset=' + offset, function (d) {

            for (let i = 0; i < d.length; i++) {
                let tempheaders = bodyAPI['clans'];
                let tempString = "<tr><td>" + (i + offset + 1) + "</td>";
                for (const element of tempheaders) {
                    let data = d[i][element];
                    if (element === "name") {
                        data = generateClanColumn(data);
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

function generateFullTable(game, page = 0) {
    return new Promise(function (resolve, reject) {
        generateTableBody(game, page).then((result) => {
            let output = '<table class="table"><thead><tr>' + generateTableHeader(game) + '</tr></thead><tbody><tr>' + result + '</tr></tbody></table>';
            resolve(output);
        });
    });
}

function generateClanColumn(clanname) {
    return `<a class='usernameListe' href='https://greev.eu/stats/clans/info.html?name=${clanname}'><p class='playername'>${clanname}</p></a>`
}