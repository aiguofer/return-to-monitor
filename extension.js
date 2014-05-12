let windows, lastMonitorCount, monitorChangeHandlerID, ;

function handleMonitorChange() {
   let currentMonitorCount = global.screen.get_n_monitors();
   // log('monitor changed from ' + lastMonitorCount + " to " + currentMonitorCount);
   if (currentMonitorCount > lastMonitorCount) {
      returnWindows();
   } else if (currentMonitorCount < lastMonitorCount) {}
   lastMonitorCount = currentMonitorCount;
}

function updateWindowList() {
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

function returnWindows() {
   windows.forEach(function(win) {
      // log('Returning ' + win.metaWindow.get_title() + " to " + win.monitor);
      win.metaWindow.move_to_monitor(win.monitor);
   })
}

// function startWindowPoller() {
//    intervalID = setInterval(updateWindowList, 5 * 60000);
// }

// function stopWindowPoller() {
//    clearInterval(setIntervalID)
// }

function init() {}

function enable() {
   lastMonitorCount = global.screen.get_n_monitors();
   updateWindowList();
   monitorChangeHandlerID = global.screen.connect('monitors-changed', handleMonitorChange);
}

function disable() {
   windows = [];
   global.screen.disconnect(monitorChangeHandlerID);
}