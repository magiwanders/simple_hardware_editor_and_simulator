//#region SETUP
// This contains the code that loads the tool into existance at page load.
var url, chip, circuit, monitor, monitorview, iopanel, paper;
document.addEventListener('DOMContentLoaded', () => {
  console.log("S.H.E.A.S. -> Simple Hardware Editor And Simulator!")
  url = new URLSearchParams(window.location.search)
  saved_chip_state = localStorage.getItem('chip')
  // Check if the URL actually contains some chip to load, if not load empty chip
  if (saved_chip_state==null || saved_chip_state=='') {
    load(get_empty_chip(), false)
  } else {
    load(JSON.parse(LZString.decompressFromBase64(saved_chip_state)), false)
  } 
  document.getElementById('components').value = url.get('select')
  display_additional_settings()
  if (url.get('bits')!=undefined && url.get('bits')!=null && url.get('bits')!='') document.getElementById('bits').value = url.get('bits')
  save_state() 
  // setInterval(update_url, 5000);
  window.onbeforeunload = shutdown
})
//#endregion

//#region PAGE-WIDE FUNCTIONS

document.getElementById('reset').onclick = reset
document.getElementById('reload').onclick = reload
document.getElementById('save').onclick = save_circuit
document.getElementById('share').onclick = share

function shutdown() {
  save_state()
  monitorview.shutdown()
  iopanel.shutdown()
  circuit.stop()
  // monitor.shutdown()
}

function reset() {
  console.log('Canvas reset...')
  load(get_empty_chip())
}

function reload() {
  console.log('Canvas reloaded')
  load(circuit.toJSON(), false)
  location.reload()
}

function save_circuit() {
  var filename = 'chip.json'
  var textInput = JSON.stringify(circuit.toJSON())
  var element = document.createElement('a');
  element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
}

function share() {
  var compressed_circuit = LZString.compressToBase64(JSON.stringify(circuit.toJSON()))
  document.getElementById('share').innerHTML = 'Copied to clipboard ✓. Load in another SHEAS window with the "Circuit in Clipboard" option.'
  navigator.clipboard.writeText(compressed_circuit);
  setTimeout(() => {document.getElementById('share').innerHTML = 'Share'}, 3000);
}

function save_state() {
  var compressed_circuit = LZString.compressToBase64(JSON.stringify(circuit.toJSON()))
  localStorage.setItem("chip", compressed_circuit);
  set_url('select', document.getElementById('components').value)
  if (document.getElementById('bits')) set_url('bits', document.getElementById('bits').value)
}

function set_url(label, new_value) {
  url.set(label, new_value)
  var nextURL = '?' + url.toString()
  var nextTitle = document.title;
  var nextState = { additionalInformation: 'Updated the URL with JS' };
  window.history.pushState(nextState, nextTitle, nextURL);
}

//#endregion

//#region SIMULATION FUNCTIONS
document.getElementById('components').onchange = display_additional_settings
document.getElementById('add').onclick = function(){
  selected_chip(add)
}
document.getElementById('load').onclick = function(){
  selected_chip(load)
}
document.getElementById('remove').onclick = remove_chip
document.getElementById('rename').onclick = rename_chip
document.getElementById('toggle_simulation').onclick = toggle_simulation
document.getElementById('step').onclick = step
// document.getElementById('clock').onclick = clock
// Handlers for zoom of signal monitors
document.getElementById('ppt_up').onclick = (e) => { monitorview.pixelsPerTick *= 2; }
document.getElementById('ppt_down').onclick = (e) => { monitorview.pixelsPerTick /= 2;}
document.getElementById('left').onclick = (e) => { monitorview.start -= monitorview._width / monitorview.pixelsPerTick / 4;};
document.getElementById('right').onclick = (e) => { monitorview.start += monitorview._width / monitorview.pixelsPerTick / 4;};


// Counts number of currently displayed devices
function count(device_name, chip_to_research) {
  if (chip_to_research==undefined) chip_to_research = chip
  var n = 0
  for (var key in chip_to_research['devices']) {
    if (chip_to_research['devices'][key].type == device_name || chip_to_research['devices'][key].celltype == device_name) {
      n+=1
    }
  }
  return n
}

// Check there is not that very same name in the list of current chips
function name_already_present(name) {
  console.log('Checking name...' + name)
  for (var key in chip['devices']) {
    if (chip['devices'][key].label == name ) {
      alert('Chip with same name ('+ name + ') already present.')
      return true
    } 
  }
  return false
}

function display_additional_settings() {
  var selected = document.getElementById('components').value
  console.log('Setup additional settings for component ' + selected)
  document.getElementById('additional_settings').innerHTML = ''
  switch (selected) {
    case 'in': add_bits_option(); break;
    case 'out': add_bits_option(); break;
    case 'nand': add_bits_option(); break;
    case 'nor': add_bits_option(); break;
    case 'dff': add_bits_option(); break;
    case 'group': add_bits_option(); break;
    case 'ungroup': add_bits_option(); break;
    case 'memory': add_memory_options(); break;
    default: break;
  }
}

function add_bits_option() {
  var bits = document.createElement("INPUT");
  bits.setAttribute("type", "number");
  bits.min = 1
  bits.max = 64
  bits.id = 'bits'
  document.getElementById('additional_settings').appendChild(bits)
  document.getElementById('additional_settings').innerHTML = 'of ' + document.getElementById('additional_settings').innerHTML + ' bits '
  document.getElementById('additional_settings').getElementsByTagName('input')[0].value = 1
}

function add_memory_options() {
  var mem_bits = document.createElement("INPUT");
  mem_bits.setAttribute("type", "number");
  mem_bits.min = 1
  mem_bits.max = 64
  mem_bits.id = 'bits'
  document.getElementById('additional_settings').appendChild(mem_bits)
  document.getElementById('additional_settings').innerHTML = 'that is addressed with ' + document.getElementById('additional_settings').innerHTML + ' bits '
  document.getElementById('additional_settings').getElementsByTagName('input')[0].value = 1
}

// Retrieves the chip selected in the curtain input by the user to <callback>.
// <callback> can be either add to or load into the simulation
// If a saved chip is requested, the callback gets passed to the saved chip selector.
function selected_chip(callback) {
  var selected = document.getElementById('components').value
  switch (selected) {
    case "nand": callback(get_nand_chip()); break;
    case "nor": callback(get_nor_chip()); break;
    case "in": callback(get_input_chip()); break;
    case "out": callback(get_output_chip()); break;
    case "dff": callback(get_dff_chip()); break;
    case "clock": callback(get_clock_chip()); break;
    case "memory": callback(get_memory_chip()); break;
    case "saved_circuit": saved_chip(callback); break;
    case "huge_circuit": huge_chip(callback); break;
    case "group": callback(get_group_chip()); break;
    case "ungroup": callback(get_ungroup_chip()); break;
    case "singlecycle": singlecycle_chip(callback); break;
    case "pipeline": pipelined_chip(callback); break;
    default: console.log("FUNCTION NOT YET IMPLEMENTED"); break;
  }
}

function toggle_simulation() {
  if (document.getElementById('toggle_simulation').innerHTML=='Pause') {
    document.getElementById('toggle_simulation').innerHTML='Play'
    circuit.stop();
  } else {
    document.getElementById('toggle_simulation').innerHTML='Pause'
    circuit.start();
  }
}

function step() {
  circuit.updateGates()
}

// function clock() {
//   circuit.updateGatesNext()
// }

function remove_chip() {
  var new_chip = circuit.toJSON()
  var to_remove = document.getElementById("to_remove").value
  var key_to_remove = undefined
  for (var key in new_chip['devices']) {
    if (new_chip['devices'][key].label == to_remove) {
      key_to_remove = key
      delete new_chip['devices'][key]
    }
  }

  var i = 0
  var keys = new_chip['devices']
  new_chip['devices'] = {}
  for (var old_key in keys) {
    i += 1
    var new_key = 'dev' + i 
    new_chip['devices'][new_key] = keys[old_key]
    for (var connection in new_chip['connectors']) {
      if(new_chip['connectors'][connection]['from'].id == old_key) {
        new_chip['connectors'][connection]['from'].id = new_key
      }
      if(new_chip['connectors'][connection]['to'].id == old_key) {
        new_chip['connectors'][connection]['to'].id = new_key
      }
    }
  }

  for (var connection in new_chip['connectors']) {
    if (new_chip['connectors'][connection].from.id == key_to_remove || new_chip['connectors'][connection].to.id == key_to_remove) {
      delete new_chip['connectors'][connection]
    }
  }

  var i = 0
  var connections = new_chip['connectors']
  new_chip['connectors'] = []
  for (var connection in connections) {
    new_chip['connectors'][i] = connections[connection]
    i += 1
  }
  load(new_chip)
}

function rename_chip() {
  var new_chip = circuit.toJSON()
  var to_rename = document.getElementById("to_rename").value
  var new_name = document.getElementById("new_name").value
  if (name_already_present(new_name)) return
  for (var key in new_chip['devices']) {
    if (new_chip['devices'][key].label == to_rename ) {
      new_chip['devices'][key].label = new_name
      new_chip['devices'][key].net = new_name
    } 
  }
    load(new_chip)
}

// Add either component or saved subcircuit to simulation
function add(to_add, is_subcircuit, subcircuit_type, as_component) {
  var new_chip = circuit.toJSON() // Save current chip
  var n_dev = Object.keys(new_chip['devices']).length + 1 
  var n_sub = Object.keys(new_chip['subcircuits']).length + 1 
  if (name_already_present(to_add.label)) return
  if (is_subcircuit) {
    if(as_component) {
      // In case a subcircuit has to be added just as component
      new_chip['devices']['dev' + n_dev] = to_add.devices.dev1 
      for (var subsub in to_add['subcircuits']) {
        new_chip['subcircuits'][subsub] = to_add['subcircuits'][subsub]
      }
    } else {
      // Normal subcircuit
      new_chip['devices']['dev' + n_dev] = {
        type: "Subcircuit",
        label: subcircuit_type + '_' + count(subcircuit_type),
        celltype: subcircuit_type,
      }
      new_chip['subcircuits'] = subcircuitfy(to_add, subcircuit_type)
    }
  } else {
    new_chip['devices']['dev' + n_dev] = to_add
  }
  load(new_chip)
}

// Make a chip added as subcircuit into subcircuit form.
function subcircuitfy(subcircuit, subcircuit_type) {
  var to_return = chip['subcircuits']
  // Add subcircuits of the chip being added to the subcircuits of the current circuit
  var subsubcircuits = subcircuit['subcircuits']
  for (var subsub in subsubcircuits) {
    if (subsubcircuits[subsub]['type'] == "Lamp") {
      subsubcircuits[subsub]['type'] == "Output"
    } else if (subsubcircuits[subsub]['type'] == "Button") {
      subsubcircuits[subsub]['type'] == "Input"
    }
    to_return[subsub] = subsubcircuits[subsub]
  }
  // Add chip currently being added to subcircuits, after having removed its own subcircuits
  delete subcircuit.subcircuits
  to_return[subcircuit_type] = subcircuit
  return to_return
}

function load(chip_to_load, reload=true) {
  console.log('LOAD')
  console.log(chip_to_load)
  chip = chip_to_load

  // This happens when loading a component into the canvas not as blackbox but showing internals
  if (chip_to_load['devices']==null) {
    var component = chip_to_load
    chip = get_empty_chip()
    chip['devices']['dev0'] = component
  }

  // Reinstantiate circuit
  // var old_paper = document.getElementById("paper") // This solution theoretically solves the problem of reloading but not that of monitors halting
  // var new_paper = document.createElement("div");
  // new_paper.id = "paper"
  // old_paper.replaceWith(new_paper)
  if (circuit) circuit.stop()
  if (monitorview) monitorview.shutdown()
  if (iopanel) iopanel.shutdown()
  delete(paper)
  delete(monitor)
  circuit = new digitaljs.Circuit(chip);
  monitor = new digitaljs.Monitor(circuit);
  monitorview = new digitaljs.MonitorView({model: monitor, el: $('#monitor') });
  iopanel = new digitaljs.IOPanelView({model: circuit, el: $('#iopanel') });
  paper = circuit.displayOn($('#paper'));

  // Reinstate simulation
  if (document.getElementById('toggle_simulation').innerHTML=='Play') {
    circuit.stop();
  } else {
    circuit.start();
  }
  monitorview.live = true
  monitor.on('add', () => {
    console.log('Wire added to monitor.')
    // TODO: REFRESH THE SIGNAL MONITOR
    monitorview._drawAll();
  });
  monitorview.on('change', () => {monitorview._drawAll();})
  document.getElementById('paper').setAttribute('pointer-events', 'all')
  document.getElementById('paper').setAttribute('pointer-events', 'painted')

  // Reload
  if (reload) {
    save_state()
    location.reload()
  }
}

//#endregion

//#region LESSON FUNCTIONS

//#endregion

// DEBUG FUNCTION (utility)
document.getElementById('debug').style.visibility = 'hidden'
document.getElementById('debug').onclick = debug
function debug() {
  chip = get_empty_chip()
  chip.devices.dev1 = get_bus_ungroup()
  load(chip)
}
