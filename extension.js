let windows, lastMonitorCount, signalIDs;

function handleMonitorChange() {
   let currentMonitorCount = global.screen.get_n_monitors();
   // log('monitor changed from ' + lastMonitorCount + " to " + currentMonitorCount);
   if (currentMonitorCount > lastMonitorCount) {
      returnWindows();
   } else if (currentMonitorCount < lastMonitorCount) {}
   lastMonitorCount = currentMonitorCount;
}

function updateWindowList() {
   let currentMonitorCount = global.screen.get_n_monitors();
   // log("There are " + currentMonitorCount + " monitors");
   if (currentMonitorCount > 1 && lastMonitorCount == currentMonitorCount) {
      windows = [];
      let windowActors = global.get_window_actors();
      for (let i = 0; i < windowActors.length; i++) {
         windows.push({
            'metaWindow': windowActors[i].get_meta_window(),
            'monitor': windowActors[i].get_meta_window().get_monitor()
         });
         // log('Saving: ' + windows[windows.length - 1].metaWindow.get_title() + " to " + windows[windows.length - 1].monitor);
      }
   }
}

function returnWindows() {
   windows.forEach(function(win) {
      // log('Returning ' + win.metaWindow.get_title() + " to " + win.monitor);
      win.metaWindow.move_to_monitor(win.monitor);
   })
}

function init() {}

function enable() {
   signalIDs = [];
   lastMonitorCount = global.screen.get_n_monitors();
   updateWindowList();
   signalIDs.push({
      'obj': global.screen,
      'id': global.screen.connect('monitors-changed', handleMonitorChange)
   });
   signalIDs.push({
      'obj': global.screen,
      'id': global.screen.connect('window-left-monitor', updateWindowList)
   })
   signalIDs.push({
      'obj': global.screen.get_display(),
      'id': global.screen.get_display().connect('window-created', updateWindowList)
   })
}

function disable() {
   windows = [];
   signalIDs.forEach(function(signal) {
      signal.obj.disconnect(signal.id);
   });
}