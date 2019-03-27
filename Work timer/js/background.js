(function(global) {
    chrome.notifications.getPermissionLevel(function(permissionLevel) {
        if (permissionLevel == 'granted') {
        }
    });


    chrome.browserAction.onClicked.addListener(function() {

    });


    chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
        switch (response.signal) {
            case 'start':
                Bg.start();
                break;
            case 'stop':
                Bg.stop(true);
                break;
            case 'restart':
                Bg.restart();
                break;
            default:
                Bg.start();
        }
    });

 
    var Bg = {
        
        workTime: null,
        breakTime: null,
        endTimestamp: null,
        currentTimestamp: null,
        timeLeft: null,
        minutesLeft: null,
        secondsLeft: null,
        startInterval: null,
        countPomodoro: 0,
        start: function() {
            var self = this;

            chrome.storage.local.get('pomodoro', function(storage) {
                if (storage.pomodoro.stoppedManually) {
                    storage.pomodoro.isWorkTime = true;
                }

                Ext.setValue({
                    isStarted: true,
                    isWorkTime: storage.pomodoro.isWorkTime
                }, function() {
                    var time;
                    if (storage.pomodoro.isWorkTime) {
                        time = storage.pomodoro.workTime;
                        self.setRedIcon();
                    } else {
                        if (self.countPomodoro === 4) {
                            time = storage.pomodoro.longBreakAfter4PomodoroTime;
                            self.countPomodoro = 0;
                        } else {
                            time = storage.pomodoro.breakTime;
                        }

                        self.setGreenIcon();
                    }

                    self.endTimestamp = self.getCurrentTimestamp() + self.toSeconds(time);

                    self.startInterval = setInterval((function(that) {
                        return function() {
                            that.updateTime();
                        };
                    })(self), 1000);
                });
            });
        },

        stop: function(stoppedManually, callback) {
            clearInterval(this.startInterval);

            if (stoppedManually) {
                this.setBadgeText('');
            }

            Ext.setValue({
                stoppedManually: typeof stoppedManually !== 'undefined' ? stoppedManually : false,
                isStarted: false,
                isWorkTime: false
            }, function() {
                if (callback) {
                    callback();
                }
            });
        },

        restart: function() {
            var self = this;

            self.stop(true, function() {
                self.start();
            });
        },

        updateTime: function() {
            var self = this;

            self.timeLeft = self.endTimestamp - self.getCurrentTimestamp();

            Ext.sendMessage({ signal: 'time', time: self.getTime() });

            self.setBadgeText(self.minutesLeft.toString() + ':' + self.secondsLeft.toString());

            if (self.timeLeft === 0) {
                self.stop();

                chrome.storage.local.get('pomodoro', function(storage) {
                    var
                        isWorkTime = null,
                        isLongBreak = false
                    ;
                    if (storage.pomodoro.isWorkTime) {
                        isWorkTime = false;
                        ++self.countPomodoro;

                        if (self.countPomodoro === 4) {
                            self.showBreakMessage('Long');
                            isLongBreak = true;
                        } else {
                            self.showBreakMessage('');
                        }
                    } else {
                        self.showWorkMessage();
                        isWorkTime = true;
                    }

                    Ext.setValue({
                        isWorkTime: isWorkTime,
                        isLongBreak: isLongBreak
                    }, function() {
                        self.start();
                    });
                });
            }
        },


        showBreakMessage: function(type) {
            var self = this;
            chrome.storage.local.get('pomodoro', function(storage) {
                var
                    title =  Ext.__(type === 'long' ? 'long_break_notification_title' : 'break_notification_title'),
                    description = storage.pomodoro[type === 'long' ? 'longBreakNotificationDescription' : 'breakNotificationDescription']
					url = "http://random.cat";
					window.open(url);
                ;

                self.createBasicNotification('green', title, description);
                self.setGreenIcon();
            });
        },

        showWorkMessage: function() {
            var self = this;
            chrome.storage.local.get('pomodoro', function(storage) {
                var
                    title = Ext.__('work_notification_title'),
                    description = storage.pomodoro.workNotificationDescription
                ;

                self.createBasicNotification('red', title, description);
                self.setRedIcon();
            });
        },

        setBadgeText: function (text) {
            chrome.browserAction.setBadgeText({ text: text });
        },

        setGreenIcon: function () {
            chrome.browserAction.setIcon({ path: 'img/green/icon32.png' });
            this.setGreenBadge();
        },

        setRedIcon: function () {
            chrome.browserAction.setIcon({ path: 'img/red/icon32.png' });
            this.setRedBadge();
        },

        setGreenBadge: function () {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#007f01' });
        },

        setRedBadge: function () {
            chrome.browserAction.setBadgeBackgroundColor({ color: '#7f1503' });
        },

        toSeconds: function(minutes) {
            return minutes * 60;
        },


        getTime: function() {
            return {
                hours:  this.formatTime((this.timeLeft / 3600) % 24),
                minutes: this.minutesLeft = this.formatTime((this.timeLeft / 60) % 60),
                seconds: this.secondsLeft = this.formatTime(this.timeLeft % 60)
            };
        },

        formatTime: function(dirtyTime) {
            var time = Math.floor(dirtyTime);
            return time > 9 ? time : '0' + time;
        },

        createBasicNotification: function(type, title, message) {
            chrome.notifications.create('', {
                type: 'basic',
                iconUrl: 'img/' + type + '/icon128.png',
                title: title,
                message: message
            }, function(notificationId) {
            });
        },

        getCurrentTimestamp: function() {
            return Math.round(Date.now() / 1000);
        }
    };

    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (changeInfo && changeInfo.status === 'loading') {
            Ext.blockSite(tab);
        }
    });


    chrome.tabs.onActivated.addListener(function() {
        chrome.tabs.query({ active: true, currentWindow: true }, function(arrayOfTabs) {
            Ext.blockSite(arrayOfTabs[0]);
        });
    });

    /**
     * Start timer after Chrome startup and start work time
     */
    chrome.runtime.onStartup.addListener(function() {
        Ext.setValue({
            isWorkTime: true
        }, function() {
            Bg.start();
        });
    });

    /**
     * Starts when an extension update is available
     */
    chrome.runtime.onUpdateAvailable.addListener(function() {
        var featuresToAdd = {},
            newFeatures = {
                sitesListType: 'blacklist',
                workNotificationDescription: Ext.__('work_notification_description'),
                breakNotificationDescription: Ext.__('break_notification_description'),
                longBreakNotificationDescription: Ext.__('long_break_notification_description'),
            }
        ;

        chrome.storage.local.get('pomodoro', function(storage) {
            for (var key in newFeatures) {
                if (typeof storage.pomodoro[key] === 'undefined') {
                    featuresToAdd[key] = newFeatures[key];
                }
            }

            Ext.setValue(featuresToAdd);
        });
    });


    chrome.runtime.onInstalled.addListener(function() {
        Ext.setValue({
            isStarted: true,
            stoppedManually: false,
            isWorkTime: true,
            workTime: 30,
            breakTime: 10,
            longBreakAfter4PomodoroTime: 25,
            sitesListType: 'blacklist',
            sites: [
                'facebook.com',
                'youtube.com',
                'twitter.com'
            ],
            workNotificationDescription: Ext.__('work_notification_description'),
            breakNotificationDescription: Ext.__('break_notification_description'),
            longBreakNotificationDescription: Ext.__('long_break_notification_description')
        }, function() {
            Bg.start();
        });
    });
})(window);
