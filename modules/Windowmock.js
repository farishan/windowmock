define(() => {
    //#region config
    const PADDING = 8
    const MIN_WIDTH = 24
    //#endregion

    //#region Built-in Modules
    const proxiedWindow = {
        eventListener: {
            mousemove: {},
            mouseup: {}
        },
        addEventListener: function (event, id, fn) {
            this.eventListener[event][id] = fn
            window.addEventListener(event, fn)
        },
        removeEventListener: function (event, id) {
            window.removeEventListener(event, this.eventListener[event][id])
            delete this.eventListener[event][id]
        }
    }
    function Vector2() {
        this.x = null
        this.y = null
        return this
    }
    const getId = () => Math.random().toString(36).slice(2, 9)
    //#endregion

    /** OS Window Mock
     * @param {*} options
     * @param {string} options.title
     * @param {number} options.width px
     * @param {number} options.height px
     * @param {string} options.color hex, example: #ffffff
     * @param {boolean} options.resizable
     * @param {boolean} options.closable
     * @param {boolean} options.movable
     * @param {function} options.onmousedown on window's container mousedown listener
     * @param {function} options.onInit function to execute after window initialized. can be used to connect with other modules.
     * @returns CustomWindow instance
     */
    function CustomWindow(options = {}) {
        const self = this

        this.id = getId()
        this.currentDistance = new Vector2()
        this.startPoint = new Vector2()
        this.initialDimension = new Vector2()
        this.clickedResizer = null
        this.onclose = undefined

        function generateParts() {
            const container = document.createElement('div')

            // two lines below: identifier, delete if you want
            container.classList.add(`custom-window-container`)
            if (options.title) {
                container.classList.add(`${options.title.split(' ').join('-') || ''}`)
            }

            container.style.boxSizing = 'border-box'
            container.style.border = '1px solid'
            container.style.position = 'absolute'
            container.style.overflow = 'hidden'
            container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'

            if (options.color) {
                container.style.borderColor = options.color
            }

            if (options.width) {
                container.style.width = options.width + 'px'
            }
            if (options.height) {
                container.style.height = options.height + 'px'
            }

            container.onmousedown = options.onmousedown ? e => options.onmousedown(self, e) : () => { }

            if (options.resizable) {
                const resizerNW = self.createResizer('nw')
                const resizerNE = self.createResizer('ne')
                const resizerSW = self.createResizer('sw')
                const resizerSE = self.createResizer('se')

                container.appendChild(resizerNW)
                container.appendChild(resizerNE)
                container.appendChild(resizerSW)
                container.appendChild(resizerSE)
            }

            const head = document.createElement('div')
            head.style.boxSizing = 'border-box'
            head.style.borderBottom = '1px solid'
            head.style.padding = `${PADDING}px`
            head.style.display = `flex`
            head.style.justifyContent = `space-between`
            head.innerHTML += options.title || 'window'

            if (options.closable) {
                const $close = document.createElement('button')
                $close.innerHTML = '&#x2715'
                $close.onclick = () => {
                    if (self.onclose) self.onclose()
                    else self.destroy()
                }
                head.appendChild($close)
            }

            container.appendChild(head)

            if (options.movable) {
                head.style.cursor = 'grab'
                head.onmousedown = (e) => {
                    self.isHeadClicked = true
                    head.style.cursor = 'grabbing'
                    document.body.style.cursor = 'grabbing'
                    self.currentDistance = {
                        x: e.clientX - container.offsetLeft,
                        y: e.clientY - container.offsetTop
                    }
                }

                const onmouseup = () => {
                    self.isHeadClicked = false
                    head.style.cursor = 'grab'
                    document.body.style.cursor = 'auto'
                    self.currentDistance = { x: null, y: null }
                }

                const onmousemove = e => {
                    if (!self.isHeadClicked || self.currentDistance.x === null || self.currentDistance.y === null) return;
                    container.style.left = e.clientX - self.currentDistance.x + 'px'
                    container.style.top = e.clientY - self.currentDistance.y + 'px'
                }

                proxiedWindow.addEventListener('mousemove', self.id, onmousemove)
                proxiedWindow.addEventListener('mouseup', self.id, onmouseup)
            }

            const body = document.createElement('div')
            body.style.boxSizing = 'border-box'
            body.style.padding = `${PADDING}px`
            body.style.maxHeight = container.offsetHeight - head.offsetHeight + 'px'
            body.style.overflow = 'auto'
            container.appendChild(body)

            return [container, head, body]
        }

        const parts = generateParts()

        this.container = parts[0]
        this.head = parts[1]
        this.body = parts[2]

        if (options.onInit && typeof options.onInit === 'function') {
            options.onInit(self)
        }

        document.body.appendChild(self.container)

        /* Post-rendering */
        self.container.style.height = self.body.scrollHeight + self.head.offsetHeight + 'px'
        self.body.style.maxHeight = self.container.offsetHeight - self.head.offsetHeight + 'px'

        this.destroy = function () {
            if (options.ondestroy && typeof options.ondestroy === 'function') {
                options.ondestroy(self)
            }
            proxiedWindow.removeEventListener('mousemove', self.id)
            proxiedWindow.removeEventListener('mouseup', self.id)
            self.container.remove()
        }

        return this
    }

    CustomWindow.prototype.getZ = function () {
        return this.container.style.zIndex
    }

    CustomWindow.prototype.setZ = function (zIndex) {
        this.container.style.zIndex = zIndex
    }

    CustomWindow.prototype.setContent = function (dom) {
        this.body.innerHTML = ''
        this.body.appendChild(dom)
        this.container.style.height = this.body.scrollHeight + this.head.offsetHeight + PADDING + 'px'
        this.body.style.maxHeight = this.container.offsetHeight - this.head.offsetHeight + 'px'
    }

    CustomWindow.prototype.setPosition = function (position) {
        if (position === 'center') {
            this.container.style.left = window.innerWidth / 2 - this.container.offsetWidth / 2 + 'px'
            this.container.style.top = window.innerHeight / 2 - this.container.offsetHeight / 2 + 'px'
        } else if (position === 'random') {
            this.container.style.left = Math.random() * (window.innerWidth - this.container.offsetWidth) + 'px'
            this.container.style.top = Math.random() * (window.innerHeight - this.container.offsetHeight) + 'px'
        }
    }

    CustomWindow.prototype.createResizer = function (position) {
        const self = this

        const resizer = document.createElement('div')
        resizer.style.width = `${PADDING}px`
        resizer.style.height = `${PADDING}px`
        resizer.style.backgroundColor = '#666'
        resizer.style.position = 'absolute'

        if (position.includes('n')) {
            resizer.style.top = 0
        } else if (position.includes('s')) {
            resizer.style.bottom = 0
        }

        if (position.includes('w')) {
            resizer.style.left = 0
        } else if (position.includes('e')) {
            resizer.style.right = 0
        }

        if (position === 'nw' || position === 'se') {
            resizer.style.cursor = 'nwse-resize'
        } else if (position === 'ne' || position === 'sw') {
            resizer.style.cursor = 'nesw-resize'
        }

        resizer.onmousedown = e => {
            self.isHeadClicked = false
            this.clickedResizer = position
            self.currentDistance = {
                x: e.clientX - self.container.offsetLeft,
                y: e.clientY - self.container.offsetTop
            }
            this.startPoint = { x: e.clientX, y: e.clientY }
            this.initialDimension = { x: self.container.offsetWidth, y: self.container.offsetHeight }
            document.body.style.cursor = 'grabbing'
        }

        const onmouseup = () => {
            this.clickedResizer = null
            this.startPoint = { x: null, y: null }
            document.body.style.cursor = 'auto'
        }

        const onmousemove = e => {
            if (self.clickedResizer === null) return;

            if (self.clickedResizer.includes('n')) {
                if (self.initialDimension.y - (e.clientY - self.startPoint.y) - MIN_WIDTH > 0) {
                    self.container.style.top = e.clientY - self.currentDistance.y + 'px'
                    self.container.style.height = self.initialDimension.y - (e.clientY - self.startPoint.y) + 'px'
                    self.body.style.maxHeight = self.container.offsetHeight - self.head.offsetHeight + 'px'
                }
            } else {
                if (self.initialDimension.y + (e.clientY - self.startPoint.y) - MIN_WIDTH > 0) {
                    self.container.style.height = self.initialDimension.y + (e.clientY - self.startPoint.y) + 'px'
                    self.body.style.maxHeight = self.container.offsetHeight - self.head.offsetHeight + 'px'
                }
            }

            if (self.clickedResizer.includes('w')) {
                if (self.initialDimension.x - (e.clientX - self.startPoint.x) - MIN_WIDTH > 0) {
                    self.container.style.left = e.clientX - self.currentDistance.x + 'px'
                    self.container.style.width = self.initialDimension.x - (e.clientX - self.startPoint.x) + 'px'
                }
            } else {
                if (self.initialDimension.x + (e.clientX - self.startPoint.x) - MIN_WIDTH > 0) {
                    self.container.style.width = self.initialDimension.x + (e.clientX - self.startPoint.x) + 'px'
                }
            }
        }

        proxiedWindow.addEventListener('mousemove', self.id, onmousemove)
        proxiedWindow.addEventListener('mouseup', self.id, onmouseup)

        return resizer
    }

    CustomWindow.prototype.show = function () {
        this.container.style.display = 'block'
    }

    CustomWindow.prototype.hide = function () {
        this.container.style.display = 'none'
    }

    return CustomWindow
})