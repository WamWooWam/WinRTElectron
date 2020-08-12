

(function () {
    "use strict";
    
    var liveAriaRegion = Skype.UI.Control.define(
        function constructor() {
            this._participantItems = {};
        }, {
            
            _participantItems: null,

            _onParticipantCallStatusChanged: function (evt) {
                var CallStatus = Skype.UI.ConversationParticipant.CallStatus,
                    participant = evt.detail.participant,
                    status = evt.detail.status,
                    participantItem,
                    div;
                
                if (status === CallStatus.Live || status === CallStatus.Ending) {
                    participantItem = this._participantItems[participant.id];
                    
                    if (participantItem && participantItem.status === status) {
                        return;
                    }
                    
                    if (!participantItem) {
                        participantItem = this._participantItems[participant.id] = {};

                        div = document.createElement("div");
                        div.setAttribute("aria-live", "polite");
                        div.setAttribute("role", "heading");
                        this.element.appendChild(div);

                        participantItem.elm = div;
                    }
                    
                    participantItem.status = status;
                    participantItem.elm.innerText = (status === CallStatus.Live ? "aria_liveconversation_participant_joined_call" : "aria_liveconversation_participant_left_call").translate(participant.name);
                } 
            },
            
            _onConversationStateChanged: function (isInFullLive) {
                if (isInFullLive) {
                    this._participantItems = {};
                    this.element.innerHTML = "";
                }
            },

            

            init: function (conversationParticipantManager, sharedState) {
                
                
                
                
                
                
                
                
                
                this.regEventListener(conversationParticipantManager, Skype.UI.ConversationParticipant.Events.StatusChanged, this._onParticipantCallStatusChanged.bind(this));
                this.regBind(sharedState, "isInFullLive", this._onConversationStateChanged.bind(this));
            }
        });

    WinJS.Namespace.define("Skype.UI.Conversation", {
        
        
        
        
        
        
        
        LiveAriaRegion: liveAriaRegion
    });
}());