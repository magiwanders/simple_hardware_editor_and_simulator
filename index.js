console.log("Simple Hardware Editor!")

///////////////////////////////////////////////////
var url = new URLSearchParams(window.location.search)
var chip = null//JSON.parse(LZString.decompress(url.get('chip')))
if (LZString.decompressFromBase64(url.get('chip'))==null) {
  chip = get_empty_chip() 
} else {
  chip = JSON.parse(LZString.decompressFromBase64(url.get('chip')))
}
load(chip)
///////////////////////////////////////////////////

function count(device_name) {
  var n = 0
  for (var key in chip['devices']) {
    if (chip['devices'][key].type == device_name || chip['devices'][key].celltype == device_name) {
      n+=1
    }
  }
  return n
}

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
    net: "out", 
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
    bits:1
  }
}

function saved_chip(callback) {
  global_callback = callback
  input.click();
}

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

function reset() {
  console.log('Canvas reset')
  chip = get_empty_chip()
  load(chip)
  set_url(JSON.stringify(get_empty_chip()))
  // console.log(chip)
}

function reload() {
  console.log('Canvas reloaded')
  chip = circuit.toJSON()
  load(chip)
  update_url()
  location.reload()
}

function save() {
  if (count('Clock')>0) {
    alert('Clocks are only for live demonstration, cannot save a circuit with clock!')
  } else {
    var filename = 'chip.json'
    var textInput = JSON.stringify(circuit.toJSON())
    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
  }
}

function remove() {
  chip = circuit.toJSON()
  var to_remove = document.getElementById("to_remove").value
  var key_to_remove = undefined
  for (var key in chip['devices']) {
    if (chip['devices'][key].label == to_remove) {
      key_to_remove = key
      delete chip['devices'][key]
    }
  }

  var i = 0
  var keys = chip['devices']
  chip['devices'] = {}
  for (var old_key in keys) {
    i += 1
    var new_key = 'dev' + i 
    chip['devices'][new_key] = keys[old_key]
    for (var connection in chip['connectors']) {
      if(chip['connectors'][connection]['from'].id == old_key) {
        chip['connectors'][connection]['from'].id = new_key
      }
      if(chip['connectors'][connection]['to'].id == old_key) {
        chip['connectors'][connection]['to'].id = new_key
      }
    }
  }

  for (var connection in chip['connectors']) {
    if (chip['connectors'][connection].from.id == key_to_remove || chip['connectors'][connection].to.id == key_to_remove) {
      delete chip['connectors'][connection]
    }
  }

  var i = 0
  var connections = chip['connectors']
  chip['connectors'] = []
  for (var connection in connections) {
    chip['connectors'][i] = connections[connection]
    i += 1
  }
  load(chip)
}

function rename() {
  chip = circuit.toJSON()
  var to_rename = document.getElementById("to_rename").value
  var new_name = document.getElementById("new_name").value
  for (var key in chip['devices']) {
    if (chip['devices'][key].label == new_name ) {
      return
    } 
  }
  for (var key in chip['devices']) {
    if (chip['devices'][key].label == to_rename ) {
      chip['devices'][key].label = new_name
      chip['devices'][key].net = new_name
    } 
  }
    load(chip)
}

function load(chip) {
  console.log('LOAD')
  console.log(chip)
  if (chip['devices']==null) {
    var component = chip
    chip = get_empty_chip()
    chip['devices']['dev0'] = component
  }
  circuit = new digitaljs.Circuit(chip)
  circuit.displayOn($('#paper'));
  circuit.start();
  update_url()
}

function share() {
  update_url()
  if (url.get('chip').length >= 30000) {
    alert('Circuit too big to be shared.')
  }
}

function update_url() {
  document.getElementById('paper').setAttribute('pointer-events', 'all')
  document.getElementById('paper').setAttribute('pointer-events', 'painted')
  set_url(LZString.compressToBase64(JSON.stringify(circuit.toJSON()))) 
}

function set_url(new_url) {
  url.set("chip", new_url)
  var nextURL = '?' + url.toString()
  var nextTitle = document.title;
  var nextState = { additionalInformation: 'Updated the URL with JS' };
  window.history.replaceState(nextState, nextTitle, nextURL);
}

function add(to_add, is_subcircuit, subcircuit_type) {
  chip = circuit.toJSON()
  var n = Object.keys(chip['devices']).length + 1
  if (is_subcircuit) {
    chip['devices']['dev' + n] = {
      type: "Subcircuit",
      label: subcircuit_type + '_' + count(subcircuit_type),
      celltype: subcircuit_type,
    }
    chip['subcircuits'] = subcircuitfy(to_add, subcircuit_type)
  } else {
    chip['devices']['dev' + n] = to_add
  }
  load(chip)
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

document.getElementById('add').onclick = function(){
  selected_chip(add)
  
}
document.getElementById('load').onclick = function(){
  selected_chip(load)
}
document.getElementById('reset').onclick = reset
document.getElementById('reload').onclick = reload
document.getElementById('save').onclick = save
document.getElementById('remove').onclick = remove
document.getElementById('rename').onclick = rename
document.getElementById('share').onclick = share


var global_callback = undefined
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
    global_callback(loaded_chip, true, last_read_file.name.split('.')[0])
  }
  e.target.value = null
}
 
// setInterval(update_url, 5000);

window.onbeforeunload = update_url