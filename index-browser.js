'use strict';

const defaultBase = self.location ?
    self.location.protocol + '//' + self.location.host :
    '';
const URL = self.URL;

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

function format(obj) {
    if (typeof obj === 'string') {
        obj = new URL(obj);
    }
    if (!(obj instanceof URL)) {
        return URL.prototype.format.call(obj);
    }

    return obj.format();
}

const relative = (
    url,
    base = defaultBase,
    protocolMap = {},
    defaultProtocol
) => {
    const b = new URLWithLegacySupport(base);
    const protocolBase = b.protocol;

    b.protocol = protocolMap[protocolBase] || b.protocol || defaultProtocol;

    return new URLWithLegacySupport(url, b.toString());
};

module.exports = {
    URL: URLWithLegacySupport,
    URLSearchParams: self.URLSearchParams,
    defaultBase,
    format,
    relative
};
