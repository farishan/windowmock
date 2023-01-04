define(() => {
    return {
        subscriber: {
            windowClick: {}
        },
        subscribe: function (event, id, fn) {
            this.subscriber[event][id] = fn
        },
        unsubscribe: function (event, id) {
            delete this.subscriber[event][id]
        },
        dispatch: function (event) {
            if (this.subscriber[event]) {
                for (const [k, v] of Object.entries(this.subscriber[event])) {
                    v()
                }
            }
        }
    }
})