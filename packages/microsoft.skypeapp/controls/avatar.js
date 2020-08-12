

(function () {
    "use strict";

    var avatar = Skype.UI.Control.define(function () {
        this.init();
    }, {
        _identity: null,
        _conversation: null,
        _isMyAvatar: false,

        image: null,
        overlay: null,

        identity: {
            get: function () {
                return this._identity;
            },
            set: function (id) {
                this._identity = id;
                this._isMyAvatar = (id === lib.myIdentity);
                if (this._conversation) {
                    this._conversation.dispose();
                    this._conversation = null;
                }
                var libConv = lib.getConversationByIdentity(id);
                if (libConv) {
                    this._conversation = Skype.Model.ConversationFactory.createConversation(libConv);
                }

                this.updateAvatar();
            }
        },

        init: function () {
            this.element.style.overflow = 'hidden';
            this.element.style.display = '-ms-grid';
            this.element.style.msGridRows = '1fr';
            this.element.style.msGridColumns = '1fr';
                        
            this.image = document.createElement("div");
            this.image._waitingForDimensionsIterations = 0;
            this.image.setAttribute('draggable', 'false'); 
            this.image.className = "avatarImageBase";
            
            this.element.insertAdjacentElement('afterBegin', this.image);

            this.overlay = document.createElement("div");
            this.overlay.className = "protectionLayer";
            this.element.appendChild(this.overlay);

            if (this.options.identity) {
                this.identity = this.options.identity;
            } else {
                this.updateAvatar();
            }

            this.avatarImageClicked = this.avatarImageClicked.bind(this);

            this.regEventListener(this.element, "click", this.avatarImageClicked);
            this.regEventListener(this.element, "pointerdown", this.avatarImagePressed.bind(this));

            this.element.winControl = this;
        },

        updateAvatar: function () {
            var avatarUri = this._conversation ? this._conversation.avatarUri : Skype.Model.AvatarUpdater.instance.getAvatarURI(this.identity); 

            avatarUri = '{0}?{1}'.format(avatarUri.replace(/\?.*/g, ''), +new Date()); 
            this.image.style.backgroundImage = "url('{0}')".format(avatarUri);

            var isDefaultAvatar = LibWrap.AvatarManager.isDefaultAvatarURI(avatarUri);
            Skype.UI.Util.setClass(this.element, 'DEFAULTAVATAR', isDefaultAvatar);
        },

        avatarImagePressed: function (evt) {
            if (this._isMyAvatar) {
                Skype.UI.Util.animateInvoke(this.element);
            }
        },

        avatarImageClicked: function () {
            if (this._isMyAvatar) {
                Skype.UI.SelectAvatarImage(function (imageBinary) {
                    var imageWithZeroByte = new LibWrap.Binary();
                    imageWithZeroByte.set([0x0]);
                    imageWithZeroByte.append(imageBinary);
                    lib.account.setProfileAttachment("profile://{0}/MyAvatar".format(lib.myIdentity), imageWithZeroByte);
                    
                    lib.account.setBinProperty(LibWrap.PROPKEY.contact_AVATAR_IMAGE, imageWithZeroByte);
                });
            }
        }
    });

    function selectAvatarImage(handlerFn) {
        var openPicker = new Windows.Storage.Pickers.FileOpenPicker();
        openPicker.viewMode = Windows.Storage.Pickers.PickerViewMode.thumbnail;
        openPicker.suggestedStartLocation = Windows.Storage.Pickers.PickerLocationId.picturesLibrary;
        openPicker.fileTypeFilter.replaceAll([".png", ".jpg", ".jpeg", ".bmp"]);

        openPicker.pickSingleFileAsync().then(function (file) {
            
            if (!file) {
                return;
            }

            file.openAsync(Windows.Storage.FileAccessMode.read).then(function (fileStream) {
                
                
                Windows.Graphics.Imaging.BitmapDecoder.createAsync(fileStream).then(function (bitmapDecoder) {
                    var jpegStream = new Windows.Storage.Streams.InMemoryRandomAccessStream();
                    
                    Windows.Graphics.Imaging.BitmapEncoder.createAsync(Windows.Graphics.Imaging.BitmapEncoder.jpegEncoderId, jpegStream).then(function (jpegEncoder) {
                        
                        var transform = new Windows.Graphics.Imaging.BitmapTransform();
                        var pixelFormat = bitmapDecoder.bitmapPixelFormat;
                        var alphaMode = Windows.Graphics.Imaging.BitmapAlphaMode.premultiplied;
                        var maxImageDimension = 256;
                        var aspectRation = bitmapDecoder.pixelHeight / bitmapDecoder.pixelWidth;
                        
                        transform.interpolationMode = Windows.Graphics.Imaging.BitmapInterpolationMode.fant;

                        if (aspectRation < 1.0) { 
                            transform.scaledWidth = maxImageDimension;
                            transform.scaledHeight = maxImageDimension * aspectRation;
                        } else {
                            transform.scaledHeight = maxImageDimension;
                            transform.scaledWidth = maxImageDimension / aspectRation;
                        }

                        
                        bitmapDecoder.getPixelDataAsync(pixelFormat, alphaMode, transform,
                            Windows.Graphics.Imaging.ExifOrientationMode.respectExifOrientation,
                            Windows.Graphics.Imaging.ColorManagementMode.colorManageToSRgb).then(function (pixelProvider) {
                            
                            jpegEncoder.setPixelData(
                                bitmapDecoder.bitmapPixelFormat,
                                bitmapDecoder.bitmapAlphaMode,
                                transform.scaledWidth,
                                transform.scaledHeight,
                                bitmapDecoder.dpiX,
                                bitmapDecoder.dpiY,
                                pixelProvider.detachPixelData());
                            
                            jpegEncoder.flushAsync().then(function () {
                                
                                jpegStream.seek(0);
                                var dataReader = new Windows.Storage.Streams.DataReader(jpegStream);
                                dataReader.loadAsync(jpegStream.size).then(function () {
                                    ///<disable>JS2005.UseShortFormInitializations</disable>
                                    var imageBytes = new Array(jpegStream.size); 
                                    ///<enable>JS2005.UseShortFormInitializations</enable>
                                    dataReader.readBytes(imageBytes);
                                    
                                    var imageBinary = new LibWrap.Binary();
                                    imageBinary.set(imageBytes);
                                    
                                    handlerFn(imageBinary);
                                });
                            });
                        });
                    });
                });
            });
        });
    }

    WinJS.Namespace.define("Skype.UI", {
        Avatar: avatar,
        SelectAvatarImage: selectAvatarImage
    });
})();