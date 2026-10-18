'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../../assets/js/sidebar-focus.js'), 'utf8');

// Model browser event ordering, not a second implementation of the adapter.
// Chrome may update CSS, blur Menu to body, then dispatch the media change.
function environment() {
  const triggerEvents = {}, mediaEvents = {}, attrs = {};
  let open = false, triggerHidden = false, observe;
  const body = { hasAttribute: () => open };
  const other = { id: 'unrelated-link' };
  const doc = { body, activeElement: body, addEventListener() {}, querySelector: () => null };
  const avatar = { id: 'avatar', focus() { assert.equal(sidebar.inert, false, 'remove inert before focus'); doc.activeElement = avatar; } };
  const sidebar = { inert: false, contains: el => el === avatar, querySelector: () => avatar };
  const trigger = { id: 'sidebar-trigger',
    setAttribute: (name, value) => attrs[name] = value,
    focus: () => { doc.activeElement = trigger; },
    getClientRects: () => triggerHidden ? [] : [{}],
    addEventListener: (name, handler) => triggerEvents[name] = handler,
    click: () => { open = !open; observe(); }
  };
  const desktop = { matches: false, addEventListener: (name, handler) => mediaEvents[name] = handler };
  doc.getElementById = id => ({ sidebar, 'sidebar-trigger': trigger })[id];
  vm.runInNewContext(source, { document: doc, window: { matchMedia: () => desktop },
    MutationObserver: class { constructor(callback) { observe = callback; } observe() {} } });
  return { doc, body, trigger, avatar, sidebar, other, desktop,
    hideTrigger() { triggerHidden = true; },
    resize() { mediaEvents.change(); },
    blur(relatedTarget = null, active = body) {
      doc.activeElement = active; triggerEvents.blur({ relatedTarget });
    }
  };
}

test('Chrome hidden-trigger blur before media change restores visible sidebar focus', () => {
  const e = environment(); e.trigger.focus(); e.desktop.matches = true; e.hideTrigger();
  e.blur();
  assert.equal(e.doc.activeElement, e.avatar);
  assert.equal(e.sidebar.inert, false);
  e.resize(); assert.equal(e.doc.activeElement, e.avatar, 'later change event does not move focus again');
});

test('WebKit media change with Menu still focused retains the existing rescue', () => {
  const e = environment(); e.trigger.focus(); e.desktop.matches = true; e.hideTrigger(); e.resize();
  assert.equal(e.doc.activeElement, e.avatar);
});

test('an intentional mobile blur to body is not remembered across resize', () => {
  const e = environment(); e.trigger.focus(); e.blur();
  assert.equal(e.doc.activeElement, e.body);
  e.desktop.matches = true; e.hideTrigger(); e.resize();
  assert.equal(e.doc.activeElement, e.body, 'no stale last-focus restoration');
});

test('blur with an unrelated focus destination never redirects focus', () => {
  const e = environment(); e.trigger.focus(); e.desktop.matches = true; e.hideTrigger();
  e.blur(e.other, e.other); e.resize(); assert.equal(e.doc.activeElement, e.other);
  e.blur(null, e.other); assert.equal(e.doc.activeElement, e.other, 'do not overwrite a newer focus');
  e.blur(e.other); assert.equal(e.doc.activeElement, e.body, 'relatedTarget also protects an in-progress focus transfer');
});

test('a visible trigger blur is not treated as CSS hiding', () => {
  const e = environment(); e.trigger.focus(); e.desktop.matches = true;
  e.blur(); assert.equal(e.doc.activeElement, e.body);
});
