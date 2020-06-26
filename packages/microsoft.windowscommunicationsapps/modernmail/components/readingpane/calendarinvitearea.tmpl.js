(function() {
    var Mail = this.Mail || (this.Mail = {}),
        Templates = Mail.Templates || (Mail.Templates = {}),
        __Tmpl__ = Templates;
    __Tmpl__.calendarInviteArea = function(__data__) {
        __data__ = __data__ || {};
        with (__data__) {
            var $_ = '';
            {
                function str(name) {
                    return Jx.escapeHtml(Jx.res.getString(name));
                }
            }
            $_ += '    <div><span>' + str("mailCalendarInviteWhenLabel") + '</span><span class="calendarInviteWhenContent"></span><span class="calendarInviteRecurrence"> &#x1f503;</span></div>    <div><span>' + str("mailCalendarInviteWhereLabel") + '</span><span class="calendarInviteWhereContent"></span></div>    <div class="calendarInviteStatus"></div>    <div class="calendarInviteButtons">            <input type="button" class="calendarInviteAccept"    value="' + str('EventAccept') + '">            <input type="button" class="calendarInviteTentative" value="' + str('EventTentative') + '">            <input type="button" class="calendarInviteDecline"   value="' + str('EventDecline') + '">            <input type="button" class="calendarInviteRespond"   value="' + str('EventRespond') + '">            <input type="button" class="calendarInviteRemove"    value="' + str('mailCalendarInviteRemove') + '">            <a href="#" class="calendarInviteViewCalendar" tabindex="0" role="button">' + str('mailCalendarInviteViewCalendar') + '</a>    </div>';
            return $_;
        }
    };
})();
