(function () {
    'use strict';

    function CustomMouseEvent(config = {}) {
        this.name = config.name || 'undefined';
        this.x = config.x || null;
        this.y = config.y || null;

        return this
    }

    /** Point -
     * Simple geometry point with x and y axis
     * @see https://en.wikipedia.org/wiki/Point_(geometry)
     * @returns Point instance
     */
    function Point() {
        this.x = {};
        this.y = {};

        return this
    }

    const point = new Point();
    console.log(point);

    let mousePoint = new Point();

    window.onclick = e => {
        // console.log(e)

        mousePoint.x = e.clientX;
        mousePoint.y = e.clientY;

        // console.log(mousePoint)
    };

    const mouseDriver = {
        state: {
            is_mousedown: false,
            is_mouseup: false,
            is_mousemove: false
        },
        listenerMap: {
            mousedown: [],
            mouseup: [],
            mousemove: []
        },
        on: function (event, listener) {
            this.listenerMap[event].push(listener);
        },
        run: function () {
            const self = this;

            const eventKeys = Object.keys(self.listenerMap);

            eventKeys.forEach(eventKey => {
                self.listenerMap[eventKey].forEach(func => {
                    const mouseEvent = new CustomMouseEvent({ name: eventKey });

                    window.addEventListener(eventKey, e => {
                        if (eventKey === 'mouseup' && self.state[`is_mousedown`]) {
                            self.state[`is_mousedown`] = false;
                        } else if (eventKey === 'mousedown' && self.state[`is_mouseup`]) {
                            self.state[`is_mouseup`] = false;
                        } else {
                            self.state[`is_${eventKey}`] = true;
                        }

                        mouseEvent.x = e.clientX;
                        mouseEvent.y = e.clientY;
                        func(mouseEvent);
                    });
                });
            });
        }
    };

    mouseDriver.on('mousedown', payload => {
        console.log(payload, mouseDriver.state);
    });
    mouseDriver.on('mouseup', payload => {
        console.log(payload, mouseDriver.state);
    });
    mouseDriver.on('mousemove', payload => {
        console.log(payload, mouseDriver.state);
    });
    mouseDriver.run();

})();
