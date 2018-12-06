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
}

module.exports = {
    URL: URLWithLegacySupport,
    URLSearchParams: self.URLSearchParams,
    defaultBase
};
