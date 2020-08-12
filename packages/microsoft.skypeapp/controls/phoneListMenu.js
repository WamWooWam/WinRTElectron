

(function () {
    "use strict";

    
    
    
    var phoneListMenu = MvvmJS.Class.derive(WinJS.UI.Menu, function phoneListMenu_constructor(element) {
        this.base(element);
    }, {

        
        smsMode: false,
        
        handler: null,
        
        phones: null,
        
        inputModel: null,
        
        isLyncContact:null,

        _isSelectedPhone: function (phone2) {
            
            
            
            return !!this.inputModel.selectedPhone &&
                this.inputModel.selectedPhone.number === phone2.number &&
                this.inputModel.selectedPhone.index === phone2.index &&
                this.inputModel.selectedPhone.phoneType === phone2.type;
        },

        _getMenuItemOptions: function (item, handler) {
            
            
            
            var phoneType = Skype.Model.PhoneType;
            var label;
            var selected = false;

            if (this.smsMode) {
                if (item.type === phoneType.skype) {
                    label = ("phonelistmenu_msg_" + this.inputModel.formattedContactType).translate();
                    selected = !this.inputModel.selectedPhone;
                } else {
                    label = ("phonelistmenu_msg_sms_" + phoneType.asArray[item.type].name).translate(item.index, item.number);
                    selected = this._isSelectedPhone(item);
                }
            } else {
                if (this.isLyncContact && item.type === phoneType.skype) { 
                    label = ("phonelistmenu_call_lync").translate();
                } else {
                    label = ("phonelistmenu_call_" + phoneType.asArray[item.type].name).translate(item.index, item.number);
                }
            }

            var data = {
                type: this.smsMode ? 'toggle' : "button",
                sublabel: (item.type === phoneType.skype) ? "" : item.number,
                number: item.number,
                index: item.index,
                phoneType: item.type,
                label: label,
                onclick: function () {
                    handler(data);
                }
            };

            if (data.type === 'toggle' ) {
                data.selected = selected; 
            }

            return data;
        },

        _mapPhoneNumbers: function (phones) {
            
            
            
            var lastType, lastIndex;

            return phones.map(function (item) {
                if (lastType !== item.type) {
                    lastType = item.type;
                    lastIndex = 1;
                    item.index = "";
                } else {
                    lastIndex++;
                    item.index = lastIndex;
                }
                return this._getMenuItemOptions(item, this.handler);
            }, this);
        },

        _getSmsMenu: function () {
            
            
            
            return {
                type: 'button',
                label: "phonelistmenu_msg_add_number".translate(),
                onclick: function () {
                    this.handler(null);
                }.bind(this)
            };
        },

        _getSmsMenuCommandsData: function () {
            
            
            
            var smsablePhones = Skype.Lib.getSmsAblePhones(this.phones);

            var commandsData = [];
            if (smsablePhones.length !== 0) {
                commandsData = this._mapPhoneNumbers(smsablePhones);
            }
            if (smsablePhones.length == 1 && smsablePhones[0].type == Skype.Model.PhoneType.skype) {
                commandsData.push(this._getSmsMenu());
            }
            return commandsData;
        },

        _getCallMenuCommandsData: function () {
            
            
            
            return this._mapPhoneNumbers(this.phones);
        },

        _createMenuCommands: function () {
            var commandsData = [];
            if (this.phones) {
                commandsData = this.smsMode ? this._getSmsMenuCommandsData() : this._getCallMenuCommandsData();
            }
            return commandsData;
        },

        _onDispose: function () {
            WinJS.Utilities.disposeSubTree(this.element); 
        },

        
        init: function (smsMode, handler, inputModel, isLyncContact) {
            this.smsMode = smsMode;
            this.handler = handler;
            this.inputModel = inputModel;
            this.isLyncContact = isLyncContact;
        },

        display: function (anchor, position, phones) {
            
            
            
            
            
            
            
            

            if (!this.hidden) {
                return false;
            }
            this.phones = phones;
            this.commands = this._createMenuCommands();
            this.show(anchor, position);
            return true;
        }

    });

    WinJS.Namespace.define("Skype.UI", {
        PhoneListMenu: WinJS.Class.mix(phoneListMenu, Skype.Class.disposableMixin)
    });
})();