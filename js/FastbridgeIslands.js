$("#leaderboards .tabTitles span").click(function () {
    $("#leaderboards .active").removeClass("active");
    $("#leaderboards .tabContents ." + $(this).attr("id")).addClass("active");
    $(this).addClass("active");
    console.log($(this).attr("id"));
});

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

function getRawData(map, page) {
    return new Promise(function (resolve, reject) {

        let offset = (25 * page);

        $.get('https://api.greev.eu/v2/stats/fastbridge_islands/top/' + map + '?amount=25&offset=' + offset, function (data) {
            resolve(data);
        });
    });
}

function generateUsernameColumn(username) {
    return "<td><a class='usernameListe' href='https://greev.eu/stats/player/?u=" + username + "'><img src='https://minotar.net/helm/" + username + "/25' class='skull'><p class='playername'> " + username + "</p></a></td>"
}

function generateFullTable(map, page = 0) {
    return new Promise(function (resolve, reject) {
        getRawData(map, page).then((result) => {
            let output = "";

            for (let i = 0; i < result.length; i++) {
                let place = (i + 1) + (page * 25);
                let name = result[i].name;
                let uuid = result[i].uuid;
                let time = result[i].time;
                output += `<li data-rank="${place}"><div class="thumb"><span class="img" style="background-image:url(https://crafatar.com/avatars/${uuid}?size=25&default=MHF_Steve&overlay)" data-name="${name}"></span><span class="name">${name}</span><span class="stat"><b>${time}</b>Seconds</span></div></li>`;
            }

            resolve(output);
        });
    });
}