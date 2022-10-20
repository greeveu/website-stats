/* jshint esversion: 8 */
/* global getUrlParameters */
/* global getUrlParameter */
/* global setUrlParameter */

const API_URL = 'https://api.greev.eu/v2/stats/minesweeper/top';
const LOADING_ELEMENT = '<li style="background: #EAEAEA;"><div class="thumb"><span class="name">Loading...</span></div></li>';
const NO_DATA_ELEMENT = '<li style="background: #EAEAEA;"><div class="thumb"><span class="name">Not data found for your search options ._.</span></div></li>';
const CONTENT_ELEMENT = document.getElementById('content');
const AMOUNT_PER_PAGE = 10;

let page = 1;
let difficulty = 'EASY';
let generator = 'GREEV';


document.querySelectorAll('#select_difficulty input[name="filter"]').forEach((element) => {
    'use strict';
    element.addEventListener("click", difficultyChangeClick);
});
document.querySelectorAll('#select_generator input[name="filter"]').forEach((element) => {
    'use strict';
    element.addEventListener("click", generatorChangeClick);
});
document.querySelectorAll('#pagination button[name="pageChange"]').forEach((element) => {
    'use strict';
    element.addEventListener("click", pageChangeClick);
});


class MinesweeperStat {
    /**
     * @param {string} uuid Uuid string of player
     * @param {string} name Username of player
     * @param {int} time    Time in ms
     */
    constructor(uuid, name, time) {
        this.uuid = uuid;
        this.name = name;
        this.time = time;
    }

    /**
     * @param {Object} jsonObject
     * @return {MinesweeperStat}
     */
    static fromObj(jsonObject) {
        return new MinesweeperStat(
            jsonObject.uuid,
            jsonObject.name,
            jsonObject.time
        );
    }

    /**
     * @return {string}
     */
    getReadableTime() {
        'use strict';

        return new Date(this.time).toISOString().slice(11, -5);
    }
}


function init() {
    'use strict';

    if (getUrlParameter('page') !== null) {
        page = getUrlParameter('page');
    }
    if (getUrlParameter('difficulty') !== null) {
        difficulty = getUrlParameter('difficulty');
    }
    if (getUrlParameter('generator') !== null) {
        generator = getUrlParameter('generator');
    }

    updatePageNumber();
    updateSelectOptions();
    updateLeaderboardData();
}

/**
 * @return {Promise<Object[]>}
 */
async function fetchApiData() {
    'use strict';

    const requestUrl = `${API_URL}/${difficulty}/${generator}?amount=${AMOUNT_PER_PAGE}&offset=${(page - 1) * AMOUNT_PER_PAGE}`;

    const response = await fetch(requestUrl);
    return await response.json();
}

/**
 * @returns {void}
 */
async function updateLeaderboardData() {
    'use strict';

    CONTENT_ELEMENT.innerHTML = LOADING_ELEMENT;
    fetchApiData().then((statObjects) => {
        let contentText = '';
        for (let i = 0; i < statObjects.length; i++) {
            let minesweeperStat = MinesweeperStat.fromObj(statObjects[i]);

            contentText += createStatElementText((page - 1) * AMOUNT_PER_PAGE + i + 1, minesweeperStat);
        }

        if (contentText.length > 0) {
            CONTENT_ELEMENT.innerHTML = contentText;
        } else {
            CONTENT_ELEMENT.innerHTML = NO_DATA_ELEMENT;
        }
    });
}

function updateSelectOptions() {
    'use strict';

    document.getElementById('select_difficulty')
        .querySelectorAll('input[name="filter"]')
        .forEach((element) => {
            element.removeAttribute('checked');
            if (element.getAttribute('data-difficulty') === difficulty) {
                element.setAttribute('checked', 'true');
            }
        });
    document.getElementById('select_generator')
        .querySelectorAll('input[name="filter"]')
        .forEach((element) => {
            element.removeAttribute('checked');
            if (element.getAttribute('data-generator') === generator) {
                element.setAttribute('checked', 'true');
            }
        });

    setUrlParameter('difficulty', difficulty);
    setUrlParameter('generator', generator);
}

function updatePageNumber() {
    'use strict';

    document.getElementById('pageNr').innerHTML = page.toString(10);
    setUrlParameter('page', page.toString(10));
}

/**
 * @param {Event} event
 */
function difficultyChangeClick(event) {
    'use strict';

    if (event.currentTarget.getAttribute('data-difficulty') !== null) {
        difficulty = event.currentTarget.getAttribute('data-difficulty');
        page = 1;
        updatePageNumber();
        updateLeaderboardData();
        setUrlParameter('difficulty', difficulty);
    }
}

/**
 * @param {Event} event
 */
function generatorChangeClick(event) {
    'use strict';

    if (event.currentTarget.getAttribute('data-generator') !== null) {
        generator = event.currentTarget.getAttribute('data-generator');
        page = 1;
        updatePageNumber();
        updateLeaderboardData();
        setUrlParameter('generator', generator);
    }
}

/**
 * @param {Event} event
 */
function pageChangeClick(event) {
    'use strict';

    if (event.currentTarget.getAttribute('data-page_change') !== null) {
        let pageChange = event.currentTarget.getAttribute('data-page_change').toInt(10, 0);
        if (pageChange !== 0) {
            page = parseInt(page, 10) + pageChange;

            if (page > 0) {
                updatePageNumber();
                updateLeaderboardData();
            } else {
                page = 1;
            }
        }
    }
}

/**
 * @param {int} place
 * @param {MinesweeperStat} stat
 * @returns string
 */
function createStatElementText(place, stat) {
    'use strict';

    let readableTime = stat.getReadableTime();

    return `<li data-rank="${place}"><div class="thumb"><span class="img" style="background-image:url(https://crafatar.com/avatars/${stat.uuid}?size=25&default=MHF_Steve&overlay)" data-name="${stat.name}"></span><span class="name">${stat.name}</span><span class="stat"><b>${readableTime}</b>Time</span></div></li>`;
}

window.onload = init;
