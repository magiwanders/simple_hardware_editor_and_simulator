//#region SETUP
// This contains the code that loads the tool into existance at page load.
console.log("S.H.E.A.S. -> Simple Hardware Editor And Simulator!")
var url, chip, circuit, monitor, monitorview, iopanel, paper;
document.addEventListener('DOMContentLoaded', () => {
  url = new URLSearchParams(window.location.search)
  // Check if the URL actually contains some chip to load, if not load empty chip
  if (LZString.decompressFromBase64(url.get('chip'))==null || LZString.decompressFromBase64(url.get('chip'))=='') {
    load(get_empty_chip(), false)
  } else {
    load(JSON.parse(LZString.decompressFromBase64(url.get('chip'))), false)
  }
  document.getElementById('components').value = url.get('select')
  update_url() 
  // setInterval(update_url, 5000);
  window.onbeforeunload = update_url
})
//#endregion

//#region CHIPS

function get_empty_chip() {
  return {
    devices: {},
    connectors: [],
    subcircuits: {}
  }
}

function get_input_chip() {
  return { 
    type: "Button", 
    label: "in_"+count('Button'), 
    net: "in_"+count('Button'), 
    order: 0, 
    bits: 1,
    position: {
      x:0,
      y:0
    }
  }
}

function get_output_chip() {
  return { 
    type: "Lamp", 
    label: "out_"+count('Lamp'), 
    net: "out_"+count('Lamp'), 
    order: 0, 
    bits: 1,
    position: {
      x:0,
      y:0
    }
  }
}

function get_nand_chip() {
  return {
    type: "Nand",
    label: "nand_"+count('Nand'),
    net: "nand_"+count('Nand'),
    bits:1
  }
}

function get_dff_chip() {
  return {
    type: "Dff",
    label: "dff_"+count('Dff'),
    net: "dff_"+count('Dff'),
    bits:1,
    polarity: {
      clock: true,
      enable: true,
    },
  }
}

function get_clock_chip() {
  return {
    type: "Clock",
    label: "clock_"+count('Clock'),
    net: "clock_"+count('Clock'),
    bits:1
  }
}

//#endregion

//#region PAGE-WIDE FUNCTIONS

document.getElementById('reset').onclick = reset
document.getElementById('reload').onclick = reload
document.getElementById('save').onclick = save
document.getElementById('share').onclick = share

function reset() {
  console.log('Canvas reset...')
  load(get_empty_chip())
}

function reload() {
  console.log('Canvas reloaded')
  load(circuit.toJSON())
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
  delete(circuit)
  delete(paper)
  delete(monitor)
  delete(monitorview)
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
  });
  document.getElementById('paper').setAttribute('pointer-events', 'all')
  document.getElementById('paper').setAttribute('pointer-events', 'painted')

  // Reload
  
  if (reload) {
    update_url()
    location.reload()
  }
}

function save() {
  var filename = 'chip.json'
  var textInput = JSON.stringify(circuit.toJSON())
  var element = document.createElement('a');
  element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
  element.setAttribute('download', filename);
  document.body.appendChild(element);
  element.click();
}

function share() {
  update_url()
  if (url.get('chip').length >= 30000) {
    alert('Circuit too big to be shared.')
  }
}

function update_url() {
  set_url('select', document.getElementById('components').value)
  set_url('chip', LZString.compressToBase64(JSON.stringify(circuit.toJSON()))) 
}

function set_url(label, new_value) {
  url.set(label, new_value)
  var nextURL = '?' + url.toString()
  var nextTitle = document.title;
  var nextState = { additionalInformation: 'Updated the URL with JS' };
  window.history.replaceState(nextState, nextTitle, nextURL);
}

//#endregion

//#region SIMULATION FUNCTIONS

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
// Handlers for zoom of signal monitors
document.getElementById('ppt_up').onclick = (e) => { monitorview.pixelsPerTick *= 2;}
document.getElementById('ppt_down').onclick = (e) => { monitorview.pixelsPerTick /= 2; }

// Counts number of currently displayed devices
function count(device_name) {
  var n = 0
  for (var key in chip['devices']) {
    if (chip['devices'][key].type == device_name || chip['devices'][key].celltype == device_name) {
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

// Retrieves the saved chip that the user wants to <callback>.
// <callback> can be either add to or load into the simulation
function saved_chip(callback) {
  var last_read_file = undefined
  var input = document.createElement('input'); 
  input.type = 'file';
  input.onchange = e => {
    last_read_file = e.target.files[0];
    var reader = new FileReader();
    reader.readAsText(last_read_file,'UTF-8');
    reader.onload = readerEvent => {
      var loaded_chip = JSON.parse(readerEvent.target.result);
      // console.log('Loaded chip from file: ' + loaded_chip)
      callback(loaded_chip, true, last_read_file.name.split('.')[0])
    }
    e.target.value = null
  }
  input.click();
}

// Retrieves the chip selected in the curtain input by the user to <callback>.
// <callback> can be either add to or load into the simulation
// If a saved chip is requested, the callback gets passed to the saved chip selector.
function selected_chip(callback) {
  var selected = document.getElementById('components').value
  switch (selected) {
    case "nand": callback(get_nand_chip()); break;
    case "in": callback(get_input_chip()); break;
    case "out": callback(get_output_chip()); break;
    case "dff": callback(get_dff_chip()); break;
    case "clock": callback(get_clock_chip()); break;
    case "saved_circuit": saved_chip(callback); break;
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
  circuit.updateGates();
}

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
function add(to_add, is_subcircuit, subcircuit_type) {
  var new_chip = circuit.toJSON() // Save current chip
  var n = Object.keys(new_chip['devices']).length + 1 
  if (name_already_present(to_add.label)) return
  if (is_subcircuit) {
    new_chip['devices']['dev' + n] = {
      type: "Subcircuit",
      label: subcircuit_type + '_' + count(subcircuit_type),
      celltype: subcircuit_type,
    }
    new_chip['subcircuits'] = subcircuitfy(to_add, subcircuit_type)
  } else {
    new_chip['devices']['dev' + n] = to_add
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

//#endregion

// DEBUG FUNCTION (utility)
document.getElementById('debug').setAttribute('visible', false)
document.getElementById('debug').onclick = debug
function debug() {
  console.log(monitor.getWiresDesc())
}