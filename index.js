'use strict';

const { URL, URLSearchParams } = require('url');

// https://github.com/nodejs/node/issues/12682
const defaultBase = 'http://localhost';

class URLWithLegacySupport extends URL {
    constructor(url, base = defaultBase) {
        super(url, base);
        this.path = this.pathname + this.search;
        this.auth =
            this.username && this.password ?
                this.username + ':' + this.password :
                null;
        this.query =
            this.search && this.search.startsWith('?') ?
                this.search.slice(1) :
                null;
    }
}

module.exports = {
    URL: URLWithLegacySupport,
    URLSearchParams
};
