(function() {
    var
        workMinutesSlider = El.$('#change-work-minutes'),
        breakMinutesSlider = El.$('#change-break-minutes'),
        longBreakAfter4PomodoroSlider = El.$('#change-long-break-after-4-pomodoro'),
        workMinutesBlock = El.$('#work-minutes'),
        breakMinutesBlock = El.$('#break-minutes'),
        longBreakAfter4PomodoroBlock = El.$('#long-break-after-4-pomodoro-minutes'),
        alertBlock = El.$('#alert'),
        saveButton = El.$('#save'),

        workText = El.$('#work-text'),
        breakText = El.$('#break-text'),
        longBreakAfter4PomodoroText = El.$('#long-break-after-4-pomodoro-text'),
        workNotificationSettingTitle = El.$('#work-notification-setting-title'),
        workNotificationDescription = El.$('#work-notification-description'),
        breakNotificationSettingTitle = El.$('#break-notification-setting-title'),
        breakNotificationDescription = El.$('#break-notification-description'),
        longBreakNotificationSettingTitle = El.$('#long-break-notification-setting-title'),
        longBreakNotificationDescription = El.$('#long-break-notification-description'),
        minutesText = El.$$('.minutes-text'),
        siteUrlInput = El.$('#site-url'),
        addSite = El.$('#add-site'),
        sitesListTypeSelect = El.$('#site-list-select'),
        siteList = El.$('#site-list')
    ;

    chrome.storage.local.get('pomodoro', function(storage) {
        var workMinutes = workMinutesSlider.value = storage.pomodoro.workTime;
        El.text(workMinutesBlock, workMinutes);

        var breakMinutes = breakMinutesSlider.value = storage.pomodoro.breakTime;
        El.text(breakMinutesBlock, breakMinutes);

        var longBreakAfter4PomodoroMinutes = longBreakAfter4PomodoroSlider.value = storage.pomodoro.longBreakAfter4PomodoroTime;
        El.text(longBreakAfter4PomodoroBlock, longBreakAfter4PomodoroMinutes);

        El.value(workNotificationDescription, storage.pomodoro.workNotificationDescription);
        El.value(breakNotificationDescription, storage.pomodoro.breakNotificationDescription);
        El.value(longBreakNotificationDescription, storage.pomodoro.longBreakNotificationDescription);

        var sites = storage.pomodoro.sites;
        for (var i = 0, siteslen = sites.length; i < siteslen; ++i) {
            siteList.insertAdjacentHTML('beforeend', getSiteTemplate(sites[i]));
        }

        var selectedWhitelist = '';
        if (storage.pomodoro.sitesListType === 'whitelist') {
            selectedWhitelist = 'selected';
        }

        var selectedBlacklist = '';
        if (storage.pomodoro.sitesListType === 'blacklist') {
            selectedBlacklist = 'selected';
        }

        El.html(sitesListTypeSelect,
            '<option value="whitelist" ' + selectedWhitelist + '>' + Ext.__('site_whitelist') + '</option>' +
            '<option value="blacklist" ' + selectedBlacklist + '>' + Ext.__('site_blacklist') + '</option>'
        );
    });

    saveButton.addEventListener('click', function() {
        Ext.setValue({
            workTime: workMinutesSlider.value,
            breakTime: breakMinutesSlider.value,
            longBreakAfter4PomodoroTime: longBreakAfter4PomodoroSlider.value,
            workNotificationDescription: workNotificationDescription.value,
            breakNotificationDescription: breakNotificationDescription.value,
            longBreakNotificationDescription: longBreakNotificationDescription.value,
            sitesListType: sitesListTypeSelect.options[sitesListTypeSelect.selectedIndex].value
        });

        El.html(alertBlock,
            '<div class="alert alert-success">' + Ext.__('settings_saved') +
                '<button type="button" class="close close-alert"><span aria-hidden="true">&times;</span></button>' +
            '</div>'
        );
    }, false);

    document.addEventListener('click', function(e) {
        var el = e.target;



        // close alert
        if (el.parentNode.classList.contains('close-alert')) {
            El.hide(el.parentNode.parentNode);
        }

        // delete a site
        if (el.classList.contains('remove-site')) {
            chrome.storage.local.get('pomodoro', function(storage) {
                var sites = storage.pomodoro.sites,
                    siteBlock = el.parentNode.parentNode,
                    siteUrl = siteBlock.querySelector('.site-url').textContent
                ;

                for (var i = 0, siteslen = sites.length; i < siteslen; ++i) {
                    if (sites[i] == siteUrl) {
                        sites.splice(i, 1);
                        break;
                    }
                }

                Ext.setValue({
                    sites: sites
                }, function() {
                    siteBlock.parentNode.removeChild(siteBlock);
                });
            });
        }
    });

    workMinutesSlider.addEventListener('input', function() {
        El.text(workMinutesBlock, this.value);
    }, false);

    breakMinutesSlider.addEventListener('input', function() {
        El.text(breakMinutesBlock, this.value);
    }, false);

    longBreakAfter4PomodoroSlider.addEventListener('input', function() {
        El.text(longBreakAfter4PomodoroBlock, this.value);
    }, false);

    addSite.addEventListener('click', function() {
        if (siteUrlInput.value) {
            chrome.storage.local.get('pomodoro', function(storage) {
                storage.pomodoro.sites.push(siteUrlInput.value);

                Ext.setValue({
                    sites: storage.pomodoro.sites
                });

                siteList.insertAdjacentHTML('beforeend', getSiteTemplate(siteUrlInput.value));

                siteUrlInput.value = '';
            });
        } else {
            siteUrlInput.focus();
        }
    }, false);
    /**
     * Populate translations
     */
    El.text(saveButton, Ext.__('save_button_text'));
    El.text(workText, Ext.__('work_text'));
    El.text(breakText, Ext.__('break_text'));
    El.text(minutesText, Ext.__('minutes_text'));
    El.text(longBreakAfter4PomodoroText, Ext.__('long_break_after_4_pomodoro_text'));
    El.text(workNotificationSettingTitle, Ext.__('work_notification_setting_title'));
    El.text(breakNotificationSettingTitle, Ext.__('break_notification_setting_title'));
    El.text(longBreakNotificationSettingTitle, Ext.__('long_break_notification_setting_title'));
    siteUrlInput.placeholder = Ext.__('enter_site_url_text');
    El.text(addSite, Ext.__('add_text'));


    function getSiteTemplate(siteUrl) {
        return  '<li class="list-group-item">' +
                    '<span class="site-url">' + siteUrl + '</span>' +
                    '<span class="actions">' +
                        '<i class="glyphicon glyphicon-remove remove-site"></i>' +
                    '</span>' +
                '</li>'
        ;
    }
})();
