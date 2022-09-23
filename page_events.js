function BindEvents() {
    // Global
    window.onbeforeunload = shutdown

    // Add or Load Row
    document.getElementById('components').onchange = display_additional_settings
    document.getElementById('add').onclick  = function(){selected_chip(add)}
    document.getElementById('load').onclick = function(){selected_chip(load)}
    
    // Remove Row
    document.getElementById('remove').onclick = remove_chip
    
    // Rename Row
    document.getElementById('rename').onclick = rename_chip
    
    // Visualization Controls
    document.getElementById('reload').onclick = reload
    document.getElementById('reset').onclick = reset
    document.getElementById('save').onclick = save_circuit
    document.getElementById('share_chip').onclick = share_chip
    document.getElementById('share_link').onclick = share_link
    document.getElementById('debug').onclick = debug
    
    // Simulation Controls
    document.getElementById('toggle_simulation').onclick = toggle_simulation
    document.getElementById('step').onclick = step

    // Monitor Controls
    document.getElementById('ppt_up').onclick = (e) => { monitorview.pixelsPerTick *= 2; }
    document.getElementById('ppt_down').onclick = (e) => { monitorview.pixelsPerTick /= 2;}
    document.getElementById('left').onclick = (e) => { monitorview.start -= monitorview._width / monitorview.pixelsPerTick / 4;};
    document.getElementById('right').onclick = (e) => { monitorview.start += monitorview._width / monitorview.pixelsPerTick / 4;};
}