define(() => {
    const Z_INDEX = {
        desktop: 1,
        desktopFile: 2,
        windows: 4,
        selectArea: 100
    }

    return {
        getZIndex: function (type) {
            return Z_INDEX[type]
        },
        windowBringToFront: function () {
            return Z_INDEX.windows + 10
        },
        windowSendBack: function (currentZ) {
            if (currentZ - 1 < Z_INDEX.windows) {
                return Z_INDEX.windows
            } else {
                return currentZ - 1
            }
        }
    }
})