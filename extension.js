let _windows, _lastMonitorCount, _connectedSignals, _windowSignals, _firstLoad;

function _handleMonitorChange() {
   let currentMonitorCount = global.screen.get_n_monitors();
   // Only return windows if the number of monitors increased to more than 1
   if (currentMonitorCount > _lastMonitorCount && currentMonitorCount > 1) {
      _returnWindows();
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
   let monitor = metaWindow.get_monitor();
   _windows.push({
      metaWindow: metaWindow,
      monitor: monitor
   });
   // Only connect to signal if it's a newly added window
   if (isNew) {
      _saveSignalID(_windowSignals, metaWindow, metaWindow.connect('unmanaged', _handleWindowClose));
   }
}

function _handleWindowClose(metaWindow) {
   // remove the window from the list
   for (let i = 0; i < _windows.length; i++) {
      if (_windows[i].metaWindow === metaWindow) {
         _windows.splice(i, 1);
         break;
      }
   }
   // disconnect from the window signal
   for (let i = 0; i < _windowSignals.length; i++) {
      if (_windowSignals[i].obj === metaWindow) {
         metaWindow.disconnect(_windowSignals[i].id);
         _windowSignals.splice(i, 1);
         break;
      }
   }
}

function _handleNewWindow(metaDisplay, metaWindow) {
   // New windows get saved even on single monitor setup since they should be on
   // the primary monitor after going back to a multi-monitor setup
   _saveWindow(metaWindow, true);
}

function _handleMovedWindow() {
   // If a window moved to another monitor, update window list
   _updateWindowList(false);
}

function _saveSignalID(signalList, obj, id) {
   signalList.push({
      obj: obj,
      id: id
   });
}

function _returnWindows() {
   _windows.forEach(function(win) {
      win.metaWindow.move_to_monitor(win.monitor);
   });
}

function init() {
   _connectedSignals = [];
   _windowSignals = [];
   _windows = [];
   _firstLoad = true;
}

function enable() {
   _lastMonitorCount = global.screen.get_n_monitors();
   // Only return windows if there's more than 1 monitor
   if (global.screen.get_n_monitors() > 1) {
      _returnWindows();
   }
   // Only update the window list if this is the first time the extension loads
   if (_firstLoad) {
      _updateWindowList(true);
      _firstLoad = false;
   }

   _saveSignalID(_connectedSignals, global.screen, global.screen.connect('monitors-changed', _handleMonitorChange));
   _saveSignalID(_connectedSignals, global.screen, global.screen.connect('window-left-monitor', _handleMovedWindow));
   _saveSignalID(_connectedSignals, global.screen, global.screen.get_display().connect('window-created', _handleNewWindow));
}

function disable() {
   _connectedSignals.forEach(function(signal) {
      signal.obj.disconnect(signal.id);
   });
}
