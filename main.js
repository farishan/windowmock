require(['modules/Windowmock', 'modules/eventBus', 'modules/layerManager'], (Windowmock, eventBus, layerManager) => {
    const windowmock = new Windowmock({
        title: 'Windowmock 0',
        movable: true,
        resizable: true,
        closable: true,
        onmousedown: (self, e) => {
            self.setZ(layerManager.windowBringToFront())
            eventBus.dispatch('windowClick')
        },
        onInit: (self) => {
            console.log(self)
            /* listen click event */
            eventBus.subscribe('windowClick', self.id, function () {
                self.setZ(layerManager.windowSendBack(self.getZ()))
            })
            /* initial z index setting */
            eventBus.dispatch('windowClick')
        },
        ondestroy: (self) => {
            eventBus.unsubscribe('windowClick', self.id)
        }
    })

    const windowmock1 = new Windowmock({
        title: 'Windowmock 1',
        movable: true,
        resizable: true,
        closable: true,
        onmousedown: (self, e) => {
            self.setZ(layerManager.windowBringToFront())
            eventBus.dispatch('windowClick')
        },
        onInit: (self) => {
            console.log(self)
            /* listen click event */
            eventBus.subscribe('windowClick', self.id, function () {
                self.setZ(layerManager.windowSendBack(self.getZ()))
            })
            /* initial z index setting */
            eventBus.dispatch('windowClick')
        },
        ondestroy: (self) => {
            eventBus.unsubscribe('windowClick', self.id)
        }
    })

    // console.log(windowmock)
    // console.log(windowmock1)

    const $content = document.createElement('div')
    $content.innerHTML = 'world'
    const $content1 = document.createElement('div')
    $content1.innerHTML = 'world'

    windowmock.setContent($content)
    windowmock1.setContent($content1)
})