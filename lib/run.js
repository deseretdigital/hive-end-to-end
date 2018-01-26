import hippie from 'hippie';
import config from '../config.dev.json';
import {
    yellow, bgYellow,
    blue, bgBlue,
    green, bgGreen,
    red, bgRed,
    white, whiteBright, bgWhite,
    black, bgBlack, bgBlackBright
} from 'chalk';

const base = process && process.env && process.env.BASE ? process.env.BASE : config.base;
const varnishBase = process && process.env && process.env.BASE ? process.env.VARNISH_BASE : config.base_varnish;
const token = process && process.env && process.env.TOKEN ? process.env.TOKEN : config.token;
const verbose = process && process.env && process.env.VERBOSE ? !!process.env.VERBOSE : false;

if (!token) {
    throw 'No token provided for API';
}

export function start(useVarnish = false, apiKeyName)
{
    return getHippieInstance(typeof useVarnish === 'string' ? useVarnish : (useVarnish ? varnishBase : base), apiKeyName);
}

function getHippieInstance(base, apiKeyName)
{
    return hippie()
        .json()
        .use((...args) => addHeader(...args, apiKeyName))
        .use(preview)
        .base(base)
        .time(true)
    ;
}

function addHeader(options, next, apiKeyName) {
    options.headers['User-Agent'] = 'hive-end-to-end';
    options.headers.Authentication = `token ${apiKeyName && config.tokens && config.tokens[apiKeyName] ? config.tokens[apiKeyName] : token}`;
    options.headers['X-Requesting-For'] = apiKeyName;
    next(options);
}

export function report(message) {
    const { request } = message;
    console.log(`${logMethod(request.method)} ${logUrl(request.uri.href)} took ${request.elapsedTime}ms`);
    return message;
}
export function preview(options, next) {
    if (verbose) {
        console.log(`${logMethod(options.method)} ${logUrl(options.url, true)} for ${options.headers['X-Requesting-For']}`);
    }
    next(options);
}
export function reportErrors(err, shouldThrow = true) {
    // console.log(`${request.method} ${domain}${request.path}: ${request.elapsedTime}`);
    if (err && shouldThrow) {
        throw err;
    } else if (err) {
        console.error(err);
    }
}
export function logErrors(err) {
    return reportErrors(err, false);
}

export function promiseTimeout(timeout = 500)
{
    console.log(bgBlue(white(`Timeout set for ${timeout} ms`)))
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);
    });
}

function logMethod(method) {
    const strMethod = ` ${method} `.padStart(10);
    switch (method) {
        case 'GET':
            return bgGreen(white(strMethod));
        case 'PUT':
            return bgGreen(yellow(strMethod));
        default:
            return bgGreen(yellow(strMethod));
    }
}

function logUrl(url, starting) {
    return (starting ? bgYellow : bgBlackBright)(
        ' ' +
        whiteBright(
            url.substr(0, 120).padStart(120)
        )
        + ' '
    );
}

export function suite(title) {
    console.log(bgBlue(whiteBright(` Test Suite ${title}`.padEnd(133) + `\n`)));
}

export retry from './retry';
