(function(global) {
    chrome.runtime.onMessage.addListener(function(response, sender, sendResponse) {
        switch (response.signal) {
            case 'time':
                App.updateTimePopup(response.time);
                break;
            default:

        }
    });

    var workMinutes = El.$('#work-minutes'),
        breakMinutes = El.$('#break-minutes'),
        tHours = El.$('#t-hours'),
        tMinutes = El.$('#t-minutes'),
        tSeconds = El.$('#t-seconds'),
        startButton = El.$('#start'),
        stopButton = El.$('#stop'),
        restartButton = El.$('#restart'),
        startWorkTimeButton = El.$('#start-work-time'),
        startBreakTimeButton = El.$('#start-break-time'),

        workText = El.$('#work-text'),
        breakText = El.$('#break-text'),
        minutesText = El.$$('.minutes-text'),
        settings = El.$('#settings')
    ;

    chrome.storage.local.get('pomodoro', function(storage) {
        El.text(workMinutes, storage.pomodoro.workTime);

        if (storage.pomodoro.isLongBreak) {
            El.text(breakMinutes, storage.pomodoro.longBreakAfter4PomodoroTime);
        } else {
            El.text(breakMinutes, storage.pomodoro.breakTime);
        }

        if (storage.pomodoro.isStarted) {
            El.hide(startButton);
        } else {
            El.hide(stopButton);
        }
    });
    var App = {
        /**
         * Start pomodoro timer
         */
        start: function() {
            El.show(stopButton);
            El.hide(startButton);
            Ext.sendMessage({signal: 'start'});
        },

        /**
         * Stop pomodoro timer
         */
        stop: function() {
            El.show(startButton);
            El.hide(stopButton);
            Ext.sendMessage({signal: 'stop'});
        },

        /**
         * Restart pomodoro timer
         */
        restart: function() {
            El.show(stopButton);
            El.hide(startButton);
            Ext.sendMessage({signal: 'restart'});
        },

        updateTimePopup: function(time) {
            El.text(tHours, time.hours);
            El.text(tMinutes, time.minutes);
            El.text(tSeconds, time.seconds);
        }
    };

    startButton.addEventListener('click', function() {
        App.start();
    }, false);

    stopButton.addEventListener('click', function() {
        App.stop();
    }, false);

    restartButton.addEventListener('click', function() {
        App.restart();
    }, false);
    /**
     * Populate translations
     */
    El.text(workText, Ext.__('work_text'));
    El.text(breakText, Ext.__('break_text'));
    El.text(minutesText, Ext.__('minutes_text'));
    El.text(startButton, Ext.__('start_button_text'));
    El.text(stopButton, Ext.__('stop_button_text'));
    El.text(restartButton, Ext.__('restart_button_text'));
    El.text(startWorkTimeButton, Ext.__('start_work_time_text'));
    El.text(startBreakTimeButton, Ext.__('start_break_time_text'));
    El.text(settings, Ext.__('settings_text'));
})(window);
