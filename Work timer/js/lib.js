var El = {
    $: function(el) {
        return document.querySelector(el);
    },

    $$: function(el) {
        return document.querySelectorAll(el);
    },

    show: function(el) {
        if (typeof el == 'string') {
            this.$(el).style.display = 'inline-block';
        } else {
            el.style.display = 'inline-block';
        }
    },

    hide: function(el) {
        if (typeof el == 'string') {
            this.$(el).style.display = 'none';
        } else {
            el.style.display = 'none';
        }
    },

    text: function(el, text) {
        if (el instanceof NodeList) {
            for (var i = 0, len = el.length; i < len; ++i) {
                el[i].textContent = text;
            }
        }
        else if (typeof el === 'object' && (el instanceof Node)) {
            el.textContent = text;
        }
        else if (typeof el === 'string') {
            this.text(this.$$(el), text);
        }
    },


    html: function(el, html) {
        if (el instanceof NodeList) {
            for (var i = 0, len = el.length; i < len; ++i) {
                el[i].innerHTML = html;
            }
        }
        if (typeof el === 'object' && (el instanceof Node)) {
            el.innerHTML = html;
        }
        if (typeof el === 'string') {
            this.html(this.$$(el), html);
        }
    },
    value: function(el, value) {
        if (el instanceof Node) el.value = value;
    }
};


var Ext = {

    sendMessage: function(message) {
        if (typeof message !== 'object') {
            throw new Error('Message must be an object');
        }

        chrome.runtime.sendMessage(message, function(response) {

        });
    },

    setValue: function(data, callback) {
        if (typeof data !== 'object') {
            throw new Error('Data must be an object');
        }

        chrome.storage.local.get('pomodoro', function(storage) {
            if (typeof storage.pomodoro === 'undefined') {
                storage.pomodoro = {};
            }

            for (var prop in data) {
                storage.pomodoro[prop] = data[prop];
            }

            chrome.storage.local.set({
                pomodoro: storage.pomodoro
            }, function() {
                if (callback) {
                    callback();
                }
            });
        });
    },


    __: function(key) {
        return chrome.i18n.getMessage(key);
    },


    trimTrailingSlash: function(url) {
        return url.replace(/\/$/, '');
    },


    getSiteWithProtocols: function(siteUrl) {
        if (
            siteUrl.indexOf('http://') == 0 ||
            siteUrl.indexOf('https://') == 0 ||
            siteUrl.indexOf('http://www.') == 0 ||
            siteUrl.indexOf('https://www.') == 0
        ) {
            return [siteUrl];
        }

        return [
            'http://' + siteUrl,
            'https://' + siteUrl,
            'http://www.' + siteUrl,
            'https://www.' + siteUrl
        ];
    },

 
    blockSite: function(tab) {
        var self = this;

        chrome.storage.local.get('pomodoro', function(storage) {
            if (storage.pomodoro.isWorkTime) {
                var
                    sites = storage.pomodoro.sites,
                    tabUrl = self.trimTrailingSlash(tab.url),
                    allowSiteInWhitelistMode = false
                ;

                for (var i = 0, siteslen = sites.length; i < siteslen; ++i) {
                    var siteWithProtocols = Ext.getSiteWithProtocols(sites[i]);
                    for (var j = 0, siteProtocolsLen = siteWithProtocols.length; j < siteProtocolsLen; ++j) {
                        var siteUrl = self.trimTrailingSlash(siteWithProtocols[j]);

                        if (storage.pomodoro.sitesListType === 'whitelist') {
                            if (tabUrl.indexOf(siteUrl) === 0) {
                                allowSiteInWhitelistMode = true;
                            }
                        }

                        if (storage.pomodoro.sitesListType === 'blacklist') {
                            if (tabUrl.indexOf(siteUrl) === 0) {
                                chrome.tabs.executeScript(tab.id, {
                                    runAt: 'document_end',
                                    file: 'js/pomodoro.js'
                                });

                                break;
                            }
                        }
                    }
                }

                if (storage.pomodoro.sitesListType === 'whitelist' && allowSiteInWhitelistMode === false) {
                    chrome.tabs.executeScript(tab.id, {
                        runAt: 'document_end',
                        file: 'js/pomodoro.js'
                    });
                }
            }
        });
    }
};
