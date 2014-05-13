let _windows, _lastMonitorCount, _connectedSignals, _windowSignals;

function _handleMonitorChange() {
   let currentMonitorCount = global.screen.get_n_monitors();
   if (currentMonitorCount > _lastMonitorCount) {
      returnWindows();
   }
   _lastMonitorCount = currentMonitorCount;
}

function _updateWindowList(isNew) {
   let currentMonitorCount = global.screen.get_n_monitors();
   // Only update if there's more than 1 monitor and it hasn't changed
   if (currentMonitorCount > 1 && _lastMonitorCount === currentMonitorCount) {
      _windows = [];
      let windowActors = global.get_window_actors();
      for (let i = 0; i < windowActors.length; i++) {
         let metaWindow = windowActors[i].get_meta_window();
         _saveWindow(metaWindow, isNew);
      }
   }
}

function _saveWindow(metaWindow, isNew) {
   _windows.push({
      metaWindow: metaWindow,
      monitor: metaWindow.get_monitor()
   });
   // Only create a signal if it's newly added
   if (isNew) {
      _windowSignals.push({
         obj: metaWindow,
         id: metaWindow.connect('unmanaged', _handleWindowClose)
      });
   }
}

function _handleWindowClose(metaWindow) {
   for (let i = 0; i < _windows.length; i++) {
      if (_windows[i].metaWindow === metaWindow) {
         _windows.splice(i, 1);
         break;
      }
   }
   for (let i = 0; i < _windowSignals.length; i++) {
      if (_windowSignals[i].obj === metaWindow) {
         metaWindow.disconnect(_windowSignals[i].id);
         _windowSignals.splice(i, 1);
         break;
      }
   }
}

function _handleNewWindow(metaDisplay, metaWindow) {
   // New windows get saved regardless since they should be on the primary monitor
   // after going back to a multi-monitor setup
   _saveWindow(metaWindow, true);
}

function _handleMovedWindow() {
   // If a window moved to another monitor, update window list
   _updateWindowList(false);
}

function returnWindows() {
   _windows.forEach(function(win) {
      win.metaWindow.move_to_monitor(win.monitor);
   })
}

function init() {}

function enable() {
   _connectedSignals = [];
   _windowSignals = [];
   _windows = [];
   _lastMonitorCount = global.screen.get_n_monitors();
   _updateWindowList(true);
   _connectedSignals.push({
      obj: global.screen,
      id: global.screen.connect('monitors-changed', _handleMonitorChange)
   });
   _connectedSignals.push({
      obj: global.screen,
      id: global.screen.connect('window-left-monitor', _handleMovedWindow)
   })
   _connectedSignals.push({
      obj: global.screen.get_display(),
      id: global.screen.get_display().connect('window-created', _handleNewWindow)
   })
}

function disable() {
   _windows = [];
   _connectedSignals.forEach(function(signal) {
      signal.obj.disconnect(signal.id);
   });
}