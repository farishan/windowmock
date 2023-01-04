function CustomMouseEvent(config = {}) {
    this.name = config.name || 'undefined'
    this.x = config.x || null
    this.y = config.y || null

    return this
}

export default CustomMouseEvent