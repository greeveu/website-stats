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

function getRawData(year, map, page) {
    return new Promise(function (resolve, reject) {

        let offset = (10 * page);

        $.get('https://api.greev.eu/v2/stats/advent/top/' + year + '/' + map + '?amount=10&offset=' + offset, function (data) {
            resolve(data);
        });
    });
}

function generateUsernameColumn(username) {
    return "<td><a class='usernameListe' href='https://greev.eu/stats/player/?u=" + username + "'><img src='https://minotar.net/helm/" + username + "/25' class='skull'><p class='playername'> " + username + "</p></a></td>"
}

function generateFullTable(year, map, page = 0) {
    return new Promise(function (resolve, reject) {
        getRawData(year, map, page).then((result) => {
            let output = "";

            for (let i = 0; i < result.length; i++) {
                let place = (i + 1) + (page * 10);
                let name = result[i].name;
                let uuid = result[i].uuid;
                let fails = result[i].fails;
                let time = msToTime(result[i].time);
                output += `<li data-rank="${place}"><div class="thumb"><span class="img" style="background-image:url(https://crafatar.com/avatars/${uuid}?size=25&default=MHF_Steve&overlay)" data-name="${name}"></span><span class="name">${name}</span><span class="stat-fails"><b>${fails}</b>Fails</span><span class="stat"><b>${time}</b>Time</span></div></li>`;
            }

            resolve(output);
        });
    });
}

function msToTime(s) {
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    let hrs = (s - mins) / 60;

    if (mins <= 9) {
        mins = "0" + mins;
    }
    if (secs <= 9) {
        secs = "0" + secs;
    }

    if (ms <= 9) {
        ms = "00" + ms;
    } else if (ms <= 99) {
        ms = "0" + ms;
    }

    if (hrs > 0) {
        return hrs + ':' + mins + ':' + secs + '.' + ms;
    }
    return mins + ':' + secs + '.' + ms;
}