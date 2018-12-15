'use strict';

const { URL, URLSearchParams, format } = require('url');

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

    format() {
        return this.toString();
    }
}

const relative = (url, location = {}, protocolMap = {}, defaultProtocol) => {
    let protocol = location.protocol ?
        location.protocol.replace(':', '') :
        'http';

    // Check protocol map
    protocol = (protocolMap[protocol] || defaultProtocol || protocol) + ':';

    const b = Object.assign({}, location, { protocol });

    return new URLWithLegacySupport(url, format(b)).toString();
};

module.exports = {
    URL: URLWithLegacySupport,
    URLSearchParams,
    format,
    relative
};
