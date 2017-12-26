class ScrollSyncHelper {
  static HORIZONTAL = 'SCROLL_SYNC_HORIZONTAL'
  static VERTICAL = 'SCROLL_SYNC_VERTICAL'

  verticalPanes = []
  horizonalPanes = []

  addEvents = node => {
    /* For some reason element.addEventListener doesnt work with document.body */
    node.onscroll = this.handlePaneScroll.bind(this, node) // eslint-disable-line
  }
  removeEvents = node => {
    /* For some reason element.removeEventListener doesnt work with document.body */
    node.onscroll = null // eslint-disable-line
  }

  handlePaneScroll = node => {
    window.requestAnimationFrame(() => {
      this.syncScrollPositions(node)
    })
  }

  registerPane(pane, MODE) {
    this.addEvents(pane)
    if (
      MODE === ScrollSyncHelper.HORIZONTAL &&
      !this.horizonalPanes.includes(pane)
    ) {
      this.horizonalPanes = [...this.horizonalPanes, pane]
    }
    if (
      MODE === ScrollSyncHelper.VERTICAL &&
      !this.verticalPanes.includes(pane)
    ) {
      this.verticalPanes = [...this.verticalPanes, pane]
    }
  }

  unReisterPane(pane) {
    this.verticalPanes = this.verticalPanes.filter(p => p !== pane)
    this.horizonalPanes = this.horizonalPanes.filter(p => p !== pane)
    this.removeEvents(pane)
  }

  isHorizontallySynced = pane => this.horizonalPanes.includes(pane)

  isVerticallySynced = pane => this.verticalPanes.includes(pane)

  syncScrollPositions = scrolledPane => {
    const {
      scrollTop,
      // scrollHeight,
      // clientHeight,
      scrollLeft,
      // scrollWidth,
      // clientWidth,
    } = scrolledPane
    // const scrollTopOffset = scrollHeight - clientHeight
    // const scrollLeftOffset = scrollWidth - clientWidth
    if (this.isHorizontallySynced(scrolledPane)) {
      this.setTargetScrolls(
        scrolledPane,
        this.horizonalPanes,
        pane => (pane.scrollLeft = scrollLeft)
      )
    }
    if (this.isVerticallySynced(scrolledPane)) {
      this.setTargetScrolls(
        scrolledPane,
        this.verticalPanes,
        pane => (pane.scrollTop = scrollTop)
      )
    }
  }
  setTargetScrolls(pane, syncedTargets, setter) {
    for (let i = 0; i < syncedTargets.length; i++) {
      if (syncedTargets[i] !== pane) {
        this.removeEvents(syncedTargets[i])
        setter(syncedTargets[i])
        window.requestAnimationFrame(() => this.addEvents(syncedTargets[i]))
      }
    }
  }
}
export default ScrollSyncHelper
