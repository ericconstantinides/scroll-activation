//------------------------------------------------------------------------------
//
//  Scroll Activation
//
//  Summary
//    Scroll Activation makes an element "active" when the top of its container
//    is scrolled upon
//
//  Usage
//    .js-scroll-activation
//       Add this class to the element you want to be the target of activation
//
//  Element Options
//     [data-keep-this-active]
//       Keeps the item always active once activated; otherwise, the active
//       will be removed after going back up.
//     [data-target="TARGET_ID"]
//       Add to the target element and any element you want to set 'is-active'.
//       Be sure to use matching TARGET_IDs
//     [data-activate-viewport-at-top]
//       Activation matching occurs at the top of the viewport/window instead
//       of the bottom
//     [data-activate-this-at-bottom]
//       Activation matching occurs at the bottom of the element instead of the
//       top
//     [data-manual-offset="NUMBER"] -or- [data-manual-offset="QUERY-SELECTOR"]
//       Either:
//        option 1. Offset by a NUMBER of pixels. Do not include "px".
//        option 2. Offset by an element (like a header) using a QUERY-SELECTOR
//
//  Creates
//    .is-active
//       This class gets added to both the .js-scroll-activation class and the
//       [data-target="TARGET_ID"]
//
//------------------------------------------------------------------------------
;(function() {

  // cache the goods
  let w = window
  let d = document;
  let items = [...d.getElementsByClassName('js-scroll-activation')]

  function init() {
    if (items.length) {
      items.forEach(item => {
        // cache all the constant variables:
        item.activationTargets = [...(d.querySelectorAll('[data-target=' + item.getAttribute('data-target') + ']'))]
        item.hasViewportActivatingAtTop = item.hasAttribute('data-activate-viewport-at-top') ? true : false
        item.isActivatingAtBottom = item.hasAttribute('data-activate-this-at-bottom') ? true : false
        item.isKeepingActive = item.hasAttribute('data-keep-this-active') ? true : false

        // get the manual offset or if necessary, prepare the offsetElement
        item.manualOffset = 0;
        if (item.hasAttribute('data-manual-offset')) {
          let offset = item.getAttribute('data-manual-offset');
          if (isNaN(offset)) {
            let offsetEl = d.querySelector(offset);
            if (offsetEl)
              item.offsetEl = offsetEl
            else
              item.manualOffset = Number(offset)
          }
        }
      })

      // wait half a second for other page items to finish
      w.setTimeout(() => checkScrollState(items), 500)

      // add the scroll listener
      d.addEventListener('scroll', (() => checkScrollState(items)))
    }
  }

  // perform as few hits to the DOM as necessary
  function changeState (direction, callee) {
    if (callee && this.isSameNode(callee)) return
    if (direction === 'activate') {
      if (!this.isActive) {
        this.classList.add('is-active')
        this.isActive = true
      }
    } else {
      if (this.isActive) {
        this.classList.remove('is-active')
        this.isActive = false
      }
    }
    if (this.activationTargets && this.activationTargets.length) {
      this.activationTargets.forEach(target => changeState.call(target, direction, this))
    }
  }

  // cycles through the scroll state of items and ajusts if necessary
  function checkScrollState (items) {
    items.forEach((item) => {
      // don't bother running if it's already active and keep-active is set:
      if (!item.isKeepingActive || !item.classList.contains('is-active')) {

        // get the items current top position:
        item.currentPxFromTop = item.getBoundingClientRect().top

        // get the height of the offsetEl
        if (item.offsetEl !== 'undefined')
          item.manualOffset = item.offsetEl.offsetHeight

        if (item.isActivatingAtBottom)
          item.offset = item.manualOffset - item.offsetHeight;
        else
          item.offset = item.manualOffset

        // is executing at the top of the viewport:
        if (item.hasViewportActivatingAtTop) {
          if (item.currentPxFromTop <= item.offset )
            changeState.call(item,'activate')
          else
            changeState.call(item,'deactivate')
        }
        // is executing at the bottom of the viewport:
        else {
          // take the items pixels from top, minus the height of the viewport, minus any manual Offset:
          if (item.currentPxFromTop - item.offset < w.innerHeight)
            changeState.call(item,'activate')
          else
            changeState.call(item,'deactivate')
        }
      }
    })
  }

  init(items)
})()