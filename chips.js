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
                var to_callback = JSON.parse(rawFile.responseText);
                if (callback.name=='add') {
                    if ( (count('Button', to_callback)==0 && count('NumEntry', to_callback)==0) || (count('Lamp', to_callback)==0 && count('NumDisplay', to_callback)==0) ) {
                        alert('The chip you are trying to load should have at least one input (button) AND one output (lamp). Your chip does not.')
                        return;
                    } else {
                        callback(to_callback, is_subcircuit=true, name, as_component=false)
                    }
                } else if (callback.name=='load') {
                    callback(to_callback, true, default_id)
                }
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

function get_debug_chip() {
    return {
        type: "Clock",
        label: "clock_debug",
        net: "clock_debug",
        bits:1
    }
    }

// Retrieves the saved chip that the user wants to <callback>.
// <callback> can be either add to or load into the simulation
function saved_chip(callback, default_id) {
    var last_read_file = undefined
    var input = document.createElement('input'); 
    input.type = 'file';
    input.onchange = e => {
      last_read_file = e.target.files[0];
      var reader = new FileReader();
      reader.readAsText(last_read_file,'UTF-8');
      reader.onload = readerEvent => {
        var loaded_chip = JSON.parse(readerEvent.target.result);
        // console.log('Loaded chip from file: ' + last_read_file.name.split('.')[0])
        if (callback.name == 'add') {
            callback(loaded_chip, true, last_read_file.name.split('.')[0], false)
        } else if (callback.name == 'load') {
            callback(loaded_chip, true, default_id)
        }
      }
      e.target.value = null
    }
    input.click();
  }
  
function clipboard_chip(callback) {
    navigator.clipboard.readText()
        .then(content => {
            var to_callback = JSON.parse(LZString.decompressFromBase64(content))
            if (callback.name=='add') {
                if ( (count('Button', to_callback)==0 && count('NumEntry', to_callback)==0) || (count('Lamp', to_callback)==0 && count('NumDisplay', to_callback)==0) ) {
                    alert('The chip you are trying to load should have at least one input (button) AND one output (lamp). Your chip does not.')
                    return;
                } else {
                    callback(to_callback, is_subcircuit=true, as_component=false)
                }
            } else if (callback.name=='load') {
                callback(to_callback, true, default_id)
            }
        })
}

function singlecycle_chip(callback) {
    read_remote_file("https://raw.githubusercontent.com/magiwanders/simple_hardware_editor_and_simulator/master/chips/single_cycle.json", callback, 'single_cycle')
}

function pipelined_chip(callback) {
    read_remote_file("https://raw.githubusercontent.com/magiwanders/simple_hardware_editor_and_simulator/master/chips/pipeline.json", callback, 'pipeline')
}
