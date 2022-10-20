/* jshint esversion: 8 */

/**
 * @param {int} radix
 * @param {int} defaultValue
 * @returns {int}
 */
String.prototype.toInt = function (radix, defaultValue) {
    'use strict';

    let parsed = parseInt(this, radix);
    // NaN !== NaN   ...wtf javascript
    if (parsed === parsed) {
        return parsed;
    }

    return defaultValue;
};

/**
 * @return {Object}
 */
function getUrlParameters() {
    'use strict';

    let tmp = [];
    let parameters = {};

    location.search
        .slice(1)
        .split("&")
        .forEach((item) => {
            tmp = item.split("=");
            if (tmp.length === 2) {
                parameters[tmp[0]] = tmp[1];
            }
        });

    return parameters;
}

/**
 * @param {string} parameterName
 * @returns {string|null}
 */
function getUrlParameter(parameterName) {
    'use strict';

    let tmp = [];
    let value = null;

    location.search
        .slice(1)
        .split("&")
        .forEach((item) => {
            tmp = item.split("=");
            if (tmp[0] === parameterName) {
                value = decodeURIComponent(tmp[1]);
            }
        });

    return value;
}

/**
 * @param {string} parameterName
 * @param {string} parameterValue
 * @returns {void}
 */
function setUrlParameter(parameterName, parameterValue) {
    'use strict';

    const parameters = getUrlParameters();
    parameters[parameterName] = parameterValue;

    let paramStringList = [];
    Object.entries(parameters).forEach(([key, value]) => {
        paramStringList[paramStringList.length] = `${key}=${value}`;
    });

    let paramPrefix = '';
    if (paramStringList.length > 0) {
        paramPrefix = '?';
    }

    history.pushState(parameters, document.title, `${paramPrefix}${paramStringList.join('&')}`);
}
