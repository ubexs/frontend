
let loadedChatUserIds = [];
// ok, so load chat
const loadChat = () => {
    request('/chat/latest', 'GET').then(d => {
        if (d.length === 0) {
            // user has no latest chats, just load friends
        }

        for (const user of d) {
            
        }
    });
}