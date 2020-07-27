// env
let wsurl = "wss://" + window.location.host + "/chat/websocket.aspx";
if (window.location.protocol === 'http:') {
    wsurl = "ws://"+window.location.host+"/chat/websocket.aspx";
}
if (window.location.host.slice(0, 9) === 'localhost') {
    wsurl = "ws://localhost:8080/chat/websocket.aspx";
}

const currentlyDisplayedUserIds = [];
var curChatOffset = 0;
var canLoadMore = false;
let latestMessage = {};

userId = parseInt(userId, 10);

function getCsrf() {
    // For now, since the ws connection can't validate csrf tokens, we have to make this request which will result in a csrf validation error. 
    // 
    // In the future, I would probably like to look into either a) using a custom 'csrf'/'authentication' type system for ws connections, or an endpoint that returns a csrf token in the body/headers while returning '200 OK'
    return new Promise(function (res, rej) {
        $.ajax({
            type: "POST",
            url: '/api/v1/chat/metadata',
            data: '',
            complete: function (xhr) {
                res(xhr.getResponseHeader('X-CSRF-Token'));
            },

        });
    });
}

function chatInit() {
    return;
    if (window.location.pathname === '/Membership/NotApproved.aspx') {
        return; // account is banned so dont bother trying to load chat since it wont work
    }
    if (!wsSupported) {
        return;
    }
    // Random Vars
    var unreadChatMessages = 0;
    var openUserId = 0;

    var canLoadMoreChat = true;
    var chatDmOffset = 0;

    var openedChatModalUserIdLS = parseInt(localStorage.getItem('ChatModalOpenUserId'));
    // Setup Chat Modal
    $('body').append(`<div class="d-none d-lg-flex row fixed-bottom" style="z-index:999999;pointer-events: none;" id="chatModalComplete">
<div class="col-6 col-md-4 col-xl-3">
    <div class="card" style="box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.075);pointer-events: all;max-width: 300px;float: right;">
        <div class="card-body bg-success" style="padding: 0.75rem;">
            <div class="row">
                <div class="col-12">
                    <p style="cursor: pointer;color: white;" id="chatModalTextBar" data-open="false"><i class="fas fa-comments"></i> Chat</p>
                </div>
            </div>
        </div>
        <div id="scrollingDivForAllChatUsersList" class="card-body" style="
        padding: 0;    
        height: auto;
        overflow-y: scroll;
        overflow-x: hidden;
        ">

            <div class="row" id="latestChatUsersParent" style="display:none;">
                <div class="col-12" id="latest-chats-header">
                    <h5 style="padding-left:0.5rem;margin-top:0.5rem;">Latest Chats</h5>
                </div>
                <div class="col-12" id="latestChatUsers">

                </div>
            </div>

            <div class="row" id="chatUsersParent" style="display:none;">
                <div class="col-12" id="latest-friends-header">
                    <h5 style="padding-left:0.5rem;margin-top:0.5rem;">Friends</h5>
                </div>
                <div class="col-12" id="chatUsers">

                </div>
            </div>
        </div>
    </div>
</div>
</div>`);
    // Setup DM Modal
    $('#chatModalComplete').prepend(`
<div class="col-6 col-md-4 offset-md-4 col-xl-3 offset-xl-6">
    <div class="card" style="box-shadow: 0 0 5px 5px rgba(0, 0, 0, 0.075);display:none;pointer-events: all;max-width: 300px;float: right;" id="chatDMModal">
        <div class="card-body bg-success" style="padding: 0.75rem;">
            <div class="row">
                <div class="col-12">
                    <p style="cursor: pointer;color: white;" id="chatusername"></p>
                </div>
            </div>
        </div>
        <div class="card-body" style="padding: 0;padding-left:1rem;padding-right:1rem;">
            <div class="row" style="min-height:300px;height:300px;">
                <div class="col-12" id="dmchatmessages" style="height:225px;overflow-y: scroll;">

                </div>
                <div class="col-12" id="partnerChatStatus" style="padding: 0;padding-left:0.25rem;padding-right:0.25rem;opacity: 0;">
                    <p>User is typing...</p>
                </div>
                <div class="col-10" id="dmchattextbox" style="height:50px;padding: 0;">
                    <div class="form-group" style="padding:0;margin-bottom:0;">
                        <textarea style="height:50px;padding:0;resize: none;" class="form-control" id="chatMessageContent" rows="3"></textarea>
                    </div>
                </div>
                <div class="col-2" style="padding: 0;">
                    <button type="button" class="btn btn-success" id="sendChatMessage" style="margin:0 auto;display:block;width: 100%;height:100%;padding-left: 0;padding-right: 0;margin:0;"><i class="fas fa-sign-in-alt"></i>

                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
`);

    function updateUnreadMessages() {
        if (!unreadChatMessages) {
            $('#chatModalTextBar').html('<i class="fas fa-comments"></i> Chat');
            return;
        }
        $('#chatModalTextBar').html('<i class="fas fa-comments"></i> Chat <span class="badge badge-dark">(' + unreadChatMessages + ' Unread)</span>');
    }
    function loadUnread() {
        request('/chat/unread/count', 'GET')
            .then(function (d) {
                unreadChatMessages = d.total;
                updateUnreadMessages();
            })
            .catch(function (e) {

            });
    }
    loadUnread();
    localStorage.setItem('notifSystemInUse', false);

    function parseBool(bool) {
        if (bool === "true") {
            return true;
        }
        return false;
    }
    setupListen();

    // local storage stuff was way harder to set up than its worth
    /*
    if (parseBool(localStorage.getItem('notifSystemInUse')) === false) {
        setupListen();
    } else {
        console.log('Already in use');
        console.log(parseBool(localStorage.getItem('notifSystemInUse')));
    }*/
    var isTrying = false;
    function attemptRetry(closeEvent) {
        if (!isTrying) {
            isTrying = true;
            setTimeout(function () {
                setupListen();
                isTrying = false;
            }, 1500);
        }
    }
    window.sock = undefined;
    var unload = false;
    function setupListen() {
        getCsrf().then(function (csrf) {
            if (openUserId) {
                loadMessages(openUserId);
            }
            sock = new WebSocket(wsurl + '?csrf=' + csrf);
            sock.onmessage = function (event) {
                var messageToLoad = JSON.parse(event.data);
                if (messageToLoad.pong) {
                    return;
                } 
                handleChatMessage(messageToLoad);
                // localStorage.setItem('notifSystemJson', event.data);
            }
            sock.onopen = function (event) {
                if (unload) {
                    return;
                }
                // localStorage.setItem('notifSystemInUse', true);
            }
            sock.onclose = function (event) {
                if (unload) {
                    return;
                }
                // console.log('close');
                // console.log(event);
                attemptRetry(event);
            }
            sock.onerror = function (event) {
                if (unload) {
                    return;
                }
                // console.log('error');
                // console.log(event);
                attemptRetry(event);
            }
            window.onbeforeunload = function () {
                unload = true;
                // localStorage.setItem('notifSystemInUse', false);
                sock.close();
            }
        });
    }
    setInterval(() => {
        if (sock && sock.readyState && sock.readyState === WebSocket.OPEN) {
            sock.send(JSON.stringify({
                'ping': Math.floor(new Date().getTime() / 1000),
            }));
        }
    }, 10000);
    function onStorageEvent(storageEvent) {
        if (storageEvent.key === "notifSystemJson") {
            handleChatMessage(JSON.parse(storageEvent.newValue));
        } else if (storageEvent.key === 'notifSystemInUse') {
            if (parseBool(localStorage.getItem('notifSystemInUse')) === false) {
                setupListen();
            }
        }
    }
    window.addEventListener('storage', onStorageEvent, false);

    var lastTypeUpdate = false;
    setInterval(function () {
        if (lastTypeUpdate && lastTypeUpdate.isSameOrAfter(moment().subtract(2, 'seconds'))) {
            $('#partnerChatStatus').css('opacity', 1);
        } else {
            $('#partnerChatStatus').css('opacity', 0);
        }
    }, 250);

    /**
     * Handle a Chat Message
     * @param {string} data Json String
     */
    function handleChatMessage(data) {
        if (!data.chatMessageId) {
            var istyping = data.typing;
            if (data.userIdFrom === openUserId) {
                if (istyping === 1) {
                    lastTypeUpdate = moment();
                }
            }
        } else {
            if (data.userIdFrom !== openUserId) {
                unreadChatMessages += 1;
                updateUnreadMessages();
                // maybe play old school roblox notification sound? :3
            } else {
                lastTypeUpdate = false;
                $('#partnerChatStatus').css('opacity', 0);
                loadMessageArr([data]);
            }
        }
    }
    if (openedChatModalUserIdLS !== 0 && !isNaN(openedChatModalUserIdLS)) {
        $('#chatModalTextBar').attr('data-open', 'true');
        $('#scrollingDivForAllChatUsersList').css('height','300px');
        $('#chatUsersParent').show();
        $('#latestChatUsersParent').show();
        $('#chatDMModal').show();
        openUserId = openedChatModalUserIdLS;
        loadMessages(openUserId);
        $('#chatDMModal').find('.card-body').first().find('.row').first().find('.col-12').first().find('p').first().attr('data-userid', openedChatModalUserIdLS);
        setUserNames([openedChatModalUserIdLS]);
    }

    // Open Handle
    $(document).on('click', '#chatModalTextBar', function () {
        if ($(this).attr('data-open') === "false") {
            // Is closed. Let's open it
            $(this).attr('data-open', 'true');
            $('#chatUsersParent').show();
            $('#latestChatUsersParent').show();
            $('#scrollingDivForAllChatUsersList').css('height','300px');
        } else {
            // Is open. Let's close it
            $(this).attr('data-open', 'false');
            $('#chatUsersParent').hide();
            $('#latestChatUsersParent').hide();
            $('#chatDMModal').hide();
            $('#scrollingDivForAllChatUsersList').css('height','auto');
            openUserId = 0;
            chatDmOffset = 0;
            localStorage.setItem('ChatModalOpenUserId', 0);
        }
    });
    loadLatestChats().then(() => {
        loadChatFriends(0);
    })
    // Load latest convos
    function loadLatestChats() {
        return request('/chat/latest', 'GET')
            .then((d) => {
                if (d.length === 0) {
                    $('#latest-chats-header').hide();
                    // $('#latestChatUsersParent').empty();
                    // $('#chatUsersLatest').append('<div class="row"><div class="col-12"><p class="text-center">N/A</p></div></div>');
                    return;
                }
                let index = 0;
                for (const chatMessage of d) {
                    index++;
                    let savedIndex = index;
                    let user = chatMessage.userIdTo;
                    if (user === userId) {
                        console.log('Using userIdFrom instead');
                        user = chatMessage.userIdFrom;
                    }
                    console.log(user);
                    if (currentlyDisplayedUserIds.includes(user)) {
                        console.log('already includes');
                        continue;
                    }
                    currentlyDisplayedUserIds.push(user);
                    $('#latestChatUsers').append(`<div class="row userChatCard" style="cursor:pointer;" data-userid="${user}"></div>`)
                        latestMessage = chatMessage;
                        if (!latestMessage) {
                            latestMessage = '';
                        } else {
                            latestMessage = latestMessage['content'];
                            if (!latestMessage) {
                                latestMessage = '';
                            }
                        }
                        $('#latestChatUsers').find('.userChatCard[data-userid="'+user+'"]').append(`
                            <div class="col-4">
                                <img data-userid="${user}" style="width:100%;max-width:50px;margin:0 auto;display: block;" />
                            </div>
                            <div class="col-8">
                                <p data-userid="${user}" class="text-truncate" style="font-weight:500;font-size:0.75rem;">Loading...</p>
                                <p class="chatMessageTrunc text-truncate" style="font-size: small;">${latestMessage.escape()}</p>
                            </div>
                        `);
                        $('#latestUserChats').append(`<div class="row"><div class="col-12"> <hr style="margin: 0.05rem;" /></div></div>`);
                }
                setUserThumbs(currentlyDisplayedUserIds);
                setUserNames(currentlyDisplayedUserIds);
            })
            .catch((e) => {
                console.log(e);
            });
    }

    // Load Friends
    function loadChatFriends(offset) {
        canLoadMore = false;
        request('/user/' + userId + '/friends?limit=25&offset=' + offset, 'GET')
            .then(function (d) {
                console.log(d);
                if (d.total === 0) {

                }
                console.log(d);
                if (d.friends.length >= 25) {
                    canLoadMore = true;
                    curChatOffset += 25;
                }
                if (d.total === 0) {
                    $('#latest-chats-header').hide();
                    $('#latest-friends-header').hide();
                    $('#chatUsers').append(`<div class="row" style="margin-top:1rem;padding-left:1rem;padding-right:1rem;"><div class="col-12"><p class="text-center" style="font-size:0.85rem;">Make some Friends to chat with them!</p></div></div>`)
                } else {
                    var ids = [];
                    d.friends.forEach(function (fr) {
                        if (currentlyDisplayedUserIds.includes(fr.userId)) {
                            return;
                        }
                        currentlyDisplayedUserIds.push(fr.userId);
                        ids.push(fr.userId);
                        if (!fr.UserStatus || fr.UserStatus === null || fr.UserStatus === undefined) {
                            fr.UserStatus = "";
                        }
                        $('#chatUsers').append(`
                        <div class="row userChatCard" style="cursor:pointer;" data-userid="${fr.userId}">
                            <div class="col-4">
                                <img data-userid="${fr.userId}" style="width:100%;max-width:50px;margin:0 auto;display: block;" />
                            </div>
                            <div class="col-8">
                                <p data-userid="${fr.userId}" class="text-truncate" style="font-weight:500;">Loading...</p>
                                <p class="chatMessageTrunc text-truncate" style="font-size: small;">${fr.UserStatus.escape()}</p>
                            </div>
                            <div class="col-12">
                                <hr style="margin: 0.05rem;" />
                            </div>
                        </div>
                        `);
                    });
                    setUserNames(ids);
                    setUserThumbs(ids);
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    }

    $('#scrollingDivForAllChatUsersList').on('scroll', function () {
        if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
            if (canLoadMore) {
                loadChatFriends(curChatOffset);
            }
        }
    });

    // Chat Card Loader
    $(document).on('click', '.userChatCard', function (e) {
        e.preventDefault();
        openUserId = parseInt($(this).attr('data-userid'));
        $('#chatDMModal').show();
        $('#chatusername').html($(this).find('.col-8').first().find('p').first().html());
        // Get Chat Messages
        $('#dmchatmessages').empty();
        // loadMessages();
        canLoadMoreChat = true;
        chatDmOffset = 0;
        loadMessages(openUserId);
    });

    $(document).on('click', '#chatusername', function (e) {
        e.preventDefault();
        openUserId = 0;
        chatDmOffset = 0;
        $('#chatDMModal').hide();
    });

    /**
     * Load Chat Messages
     */
    function loadMessages(userId) {
        if (!canLoadMoreChat) {
            return;
        }
        localStorage.setItem('ChatModalOpenUserId', userId);
        canLoadMoreChat = false;
        request('/chat/' + userId + '/history?offset=' + chatDmOffset, 'GET')
            .then(function (d) {
                if (d.length === 0) {
                    console.log('No Chat History');
                } else {
                    loadMessageArr(d);
                    if (d.length >= 25) {
                        // canLoadMoreChat = true;
                        // chatDmOffset += 25;
                    }
                    request('/chat/' + userId + '/read', 'PATCH')
                        .then(function (d) {
                            loadUnread();
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                }
            })
            .catch(function (e) {
                console.log(e);
            });
    }

    var pastUserId = 0;
    function loadMessageArr(d) {
        userId = parseInt(userId);
        var ids = [];
        d = d.reverse();
        d.forEach(function (fr, i, arr) {
            ids.push(fr.userIdFrom);
            ids.push(fr.userIdTo);
            if (!fr.UserStatus) {
                fr.UserStatus = "";
            }
            var textalign = "";
            if (fr.userIdFrom === userId) {
                // Sender is current user
                textalign = "text-right";
            } else {
                // Sender is partner
                textalign = "text-left";
            }
            if (pastUserId === fr.userIdFrom) {
                /*
                var hr = "";
                if (arr[i + 1] && arr[i + 1]['userIdFrom'] === fr.userIdFrom) {

                } else {
                    hr = '<hr style="margin: 0;" />'
                }
                */
                if ($('#dmchatmessages').children().length === 0) {
                    $('#dmchatmessages').append(`
                    <div class="row userChatMessageCard" style="cursor:pointer;" data-userid="${fr.userIdFrom}">
                        <div class="col-12" style="padding: 0;padding-right:0.25rem;padding-left:0.25rem;">
                            <a href="/users/${fr.userIdFrom}/profile"><p data-userid="${fr.userIdFrom}" class="text-truncate text-right" style="font-weight:500;">...</p></a>
                            <p class="text ${textalign}" style="font-size: small;">${fr.content.escape()}</p>
                        </div>
                    </div>
                    `);
                }else{
                    $('#dmchatmessages').append(`
                    <div class="row userChatMessageCard" style="cursor:pointer;" data-userid="${fr.userIdFrom}">
                        <div class="col-12" style="padding: 0;padding-right:0.25rem;padding-left:0.25rem;">
                            <p class="text ${textalign}" style="font-size: small;">${fr.content.escape()}</p>
                        </div>
                    </div>
                    `);
               }
                
            } else {
                /*
                var hr = "";
                if (arr[i + 1] && arr[i + 1]['userIdFrom'] === fr.userIdFrom) {

                } else {
                    hr = '<hr style="margin: 0;" />'
                }
                */
                $('#dmchatmessages').append(`
                    <div class="row userChatMessageCard" style="cursor:pointer;" data-userid="${fr.userIdFrom}">
                        <div class="col-12" style="padding: 0;padding-right:0.25rem;padding-left:0.25rem;">
                            <a href="/users/${fr.userIdFrom}/profile"><p data-userid="${fr.userIdFrom}" class="text-truncate ${textalign}" style="font-weight:500;">Loading...</p></a>
                            <p class="text ${textalign}" style="font-size: small;">${fr.content.escape()}</p>
                        </div>
                        <div class="col-12">
                        </div>
                    </div>
                    `);
            }
            pastUserId = fr.userIdFrom;
        });
        setUserNames(ids);
        setUserThumbs(ids);
        $('#dmchatmessages').scrollTop($('#dmchatmessages')[0].scrollHeight);
    }

    $(document).on('click', '#sendChatMessage', function (e) {
        e.preventDefault();
        sendMessageFinal();
    });
    var lastKeyUp = false;
    $('#chatMessageContent').on('keypress', function (e) {
        lastKeyUp = moment();
        if (e.which === 13) {
            sendMessageFinal()
        }
    });
    setInterval(function () {
        if (lastKeyUp && lastKeyUp.add(1, 'seconds').isSameOrAfter(moment())) {
            lastKeyUp = false;
            if (openUserId !== 0) {
                request('/chat/' + openUserId + '/typing', 'PUT', JSON.stringify({ 'typing': 1 }))
                    .then(function (d) {

                    })
                    .catch(function (e) {
                        console.log(e);
                    });
            }
        }
    }, 1000);

    function sendMessageFinal() {
        lastKeyUp = false;
        var content = $('#chatMessageContent').val();
        if (content === '') {
            return;
        }
        $('#chatMessageContent').attr("disabled", "disabled");
        $('#sendChatMessage').attr("disabled", "disabled");
        request('/chat/' + openUserId + '/send', 'PUT', JSON.stringify({ 'content': content }))
            .then(function () {
                $('#chatMessageContent').val("");
                $('#chatMessageContent').removeAttr("disabled");
                $('#sendChatMessage').removeAttr("disabled");
                loadMessageArr([{
                    'chatMessageId': 0,
                    'userIdFrom': userId,
                    'userIdTo': openUserId,
                    'content': content,
                    'dateCreated': moment().format('YYYY-MM-DD HH:mm:ss'),
                    'read': 0,
                }]);
                $('#chatMessageContent').focus();
            })
            .catch(function (e) {
                warning(e.responseJSON.message);
                $('#chatMessageContent').removeAttr("disabled");
                $('#sendChatMessage').removeAttr("disabled");
            })
    }
};
chatInit();