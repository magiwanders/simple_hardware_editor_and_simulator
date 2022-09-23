function read_remote_file(file, callback, name)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = JSON.parse(rawFile.responseText);
                callback(allText, true, name, false);
            }
        }
    }
    rawFile.send(null);
}

function get_empty_chip() {
return {
    devices: {},
    connectors: [],
    subcircuits: {}
}
}

function get_input_chip() {
var bits = parseInt(document.getElementById('bits').value)
var n_inputs = count('Button') + count('NumEntry')
if (bits==1 || isNaN(bits)) {
    return { 
    type: "Button", 
    label: "in_"+n_inputs,
    net: "in_"+n_inputs,
    order: 0, 
    bits: 1,
    position: {
        x:0,
        y:0
    }
    }
} else {
    return { 
    type: "NumEntry", 
    label: "in_"+n_inputs,
    net: "in_"+n_inputs,
    bits: bits,
    numbase: 'hex',
    position: {
        x:0,
        y:0
    }
    }
}
}

function get_output_chip() {
var bits = parseInt(document.getElementById('bits').value)
var n_outputs = count('Lamp') + count('NumDisplay')
if (bits==1 || isNaN(bits)) {
    return { 
    type: "Lamp", 
    label: "out_"+n_outputs, 
    net: "out_"+n_outputs, 
    order: 0, 
    bits: 1,
    position: {
        x:0,
        y:0
    }
    }
} else {
    return { 
    type: "NumDisplay", 
    label: "out_"+n_outputs,
    net: "out_"+n_outputs,
    bits: bits,
    numbase: 'hex',
    position: {
        x:0,
        y:0
    }
    }
}

}

function get_nand_chip() {
return {
    type: "Nand",
    label: "nand_"+count('Nand'),
    net: "nand_"+count('Nand'),
    bits: parseInt(document.getElementById('bits').value),
}
}

function get_group_chip() {
    var width = parseInt(document.getElementById('bits').value)
    var groups = Array(width).fill(1);
    return {
      type: "BusGroup",
      label: "busgroup_"+count('BusGroup'),
      groups: groups,
  }
}

function get_ungroup_chip() {
    var width = parseInt(document.getElementById('bits').value)
    var groups = Array(width).fill(1);
    return {
      type: "BusUngroup",
      label: "busungroup_"+count('BusUngroup'),
      groups: groups,
    }
  }

function get_nor_chip() {
return {
    type: "Nor",
    label: "nor_"+count('Nor'),
    net: "nor_"+count('Nor'),
    bits: parseInt(document.getElementById('bits').value),
}
}

function get_dff_chip() {
return {
    type: "Dff",
    label: "dff_"+count('Dff'),
    net: "dff_"+count('Dff'),
    bits:parseInt(document.getElementById('bits').value),
    polarity: {
    clock: true,
    enable: true,
    },
}
}

function get_memory_chip() {
var mem_bits = parseInt(document.getElementById('bits').value)
var mem_length = parseInt(Math.pow(2, mem_bits))
return {
    type: "Memory",
    label: "memory_"+count('Memory'),
    bits: 8,   // Word Width
    abits: mem_bits,  // Address Bits
    words: mem_length,  // Number of Words
    offset: 0,
    position: {
    x:0,
    y:0
    },
    rdports: [{transparent: true}],
    wrports: [{clock_polarity: true}],
    memdata: [mem_length, '00000000']
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
  
function clipboard_chip(callback) {
    navigator.clipboard.readText()
        .then(content => {
            callback(JSON.parse(LZString.decompressFromBase64(content)),  is_subcircuit=true, as_component=true)
        })
}

function singlecycle_chip(callback) {
    read_remote_file("https://raw.githubusercontent.com/magiwanders/simple_hardware_editor_and_simulator/master/chips/single_cycle.json", callback, 'single_cycle')
}

function pipelined_chip(callback) {
    read_remote_file("https://raw.githubusercontent.com/magiwanders/simple_hardware_editor_and_simulator/master/chips/pipeline.json", callback, 'pipeline')
}
