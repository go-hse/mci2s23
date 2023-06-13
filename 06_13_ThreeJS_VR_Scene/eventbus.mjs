///////////////////////////////////////////////////////////////////////////////
//
function EventBus() {
    let listeners = {};

    function subscribe(event, callback) {
        if (!listeners[event]) {
            listeners[event] = [];
        }
        listeners[event].push(callback);
    };


    function publish(event, obj) {
        if (listeners[event]) {
            for (let cb of listeners[event]) {
                cb(obj);
            }
        } else {
            console.log(`no listener for ${event}`);
        }
    };
    return { subscribe, publish };
};

export const eventbus = EventBus();
