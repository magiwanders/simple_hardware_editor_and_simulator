var url, chip={}, circuit={}, monitor={}, monitorview={}, iopanel={}, paper={};

var default_id = 'sheas_container'
chip[default_id] = {
  devices: {},
  connectors: [],
  subcircuits: {}
}

//#region PAGE-WIDE FUNCTIONS

function setup() {
  console.log('SETUP')
  url = new URLSearchParams(window.location.search)
  saved_chip_state = localStorage.getItem('chip_'+default_id)
  // Check if the URL actually contains some chip to load, if not check for chip saved in local memory, if empty load empty chip
  if (url.get('chip')==null || url.get('chip')=='') {
    if (saved_chip_state==null || saved_chip_state=='' || saved_chip_state==undefined) {
      load(get_empty_chip(), false, default_id)
    } else {
      load(JSON.parse(LZString.decompressFromBase64(saved_chip_state)), false, default_id)
    }
  } else {
    load(JSON.parse(LZString.decompressFromBase64(url.get('chip'))), false, default_id)
    set_url('chip', '')
  }
  document.getElementById('components_'+default_id).value = url.get('select')
  display_additional_settings()
  if (url.get('bits')!=undefined && url.get('bits')!=null && url.get('bits')!='' && document.getElementById('bits')!=null) document.getElementById('bits').value = url.get('bits')
  save_state()
}

  function shutdown() {
    save_state()
    monitorview[default_id].shutdown()
    iopanel[default_id].shutdown()
    circuit[default_id].stop()
    // monitor.shutdown()
  }

  function reset() {
    console.log('Canvas reset...')
    load(get_empty_chip(), true, default_id)
  }

  function reload() {
    console.log('Canvas reloaded')
    load(circuit[default_id].toJSON(), false, default_id)
    location.reload()
  }

  function save() {
    var filename = 'chip.json'
    var textInput = JSON.stringify(circuit[default_id].toJSON())
    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
  }

  function share_chip(event) {
    var id = retrieve_id('share_chip', event.target.id)
    var compressed_circuit = LZString.compressToBase64(JSON.stringify(circuit[id].toJSON()))
    document.getElementById('share_chip_'+id).innerHTML = 'Copied to clipboard ✓. Load in another SHEAS window with the "Circuit in Clipboard" option.'
    navigator.clipboard.writeText(compressed_circuit);
    setTimeout(() => {document.getElementById('share_chip_'+id).innerHTML = 'Share the chip'}, 3000);
  }

  function share_link(event) {
    var id = retrieve_id('share_link', event.target.id)
    var compressed_circuit = LZString.compressToBase64(JSON.stringify(circuit[id].toJSON()))
    document.getElementById('share_link_'+id).innerHTML = 'Copied to clipboard ✓. Paste in another browser window.'
    if (compressed_circuit.length > 30000) {
      alert('Circuit too big to be shared by URL. Use the "Share the chip" button and load it in another SHEAS window with the "Circuit in Clipboard" option, while still holding the chip in the clipboard.')
    } else {
      compressed_circuit = save_state(id)
      var url_params = new URLSearchParams()
      url_params.set('chip', compressed_circuit)
      navigator.clipboard.writeText('https://sheas.magiwanders.com/?' + url_params.toString());
    }
    setTimeout(() => {document.getElementById('share_link_'+id).innerHTML = 'Share as link'}, 3000);
  }

  function save_state(id) {
    if (id==undefined) id=default_id
    var compressed_circuit = LZString.compressToBase64(JSON.stringify(circuit[id].toJSON()))
    localStorage.setItem("chip_"+default_id, compressed_circuit);
    if (document.getElementById('components_'+default_id)!=null) set_url('select', document.getElementById('components_'+default_id).value)
    if (document.getElementById('bits')) set_url('bits', document.getElementById('bits').value)
    return compressed_circuit
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

  // Counts number of currently displayed devices
  function count(device_name, chip_to_research) {
    if (chip_to_research==undefined) chip_to_research = chip[default_id]
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
    for (var key in chip[default_id]['devices']) {
      if (chip[default_id]['devices'][key].label == name ) {
        alert('Chip with same name ('+ name + ') already present.')
        return true
      }
    }
    return false
  }

  function display_additional_settings() {
    var selected = document.getElementById('components_'+default_id).value
    console.log('Setup additional settings for component ' + selected)
    document.getElementById('additional_settings_'+build_id).innerHTML = ''
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
    var additional_settings = document.getElementById('additional_settings_'+default_id)
    additional_settings.appendChild(bits)
    additional_settings.innerHTML = 'of ' + additional_settings.innerHTML + ' bits '
    if (url.get('bits')==null || url.get('bits')=='') {
      additional_settings.getElementsByTagName('input')[0].value = 1
    } else {
      additional_settings.getElementsByTagName('input')[0].value = parseInt(url.get('bits'))
    }
  }

  function add_memory_options() {
    var mem_bits = document.createElement("INPUT");
    mem_bits.setAttribute("type", "number");
    mem_bits.min = 1
    mem_bits.max = 64
    mem_bits.id = 'bits'
    document.getElementById('additional_settings_'+default_id).appendChild(mem_bits)
    document.getElementById('additional_settings_'+default_id).innerHTML = 'that is addressed with ' + document.getElementById('additional_settings_'+default_id).innerHTML + ' bits '
    document.getElementById('additional_settings_'+default_id).getElementsByTagName('input')[0].value = 1
  }

  function monitor_or_tester(which) {
    document.getElementById('monitor_div_'+default_id).style.display = which=='monitor' ? 'block' : 'none';
    document.getElementById('tester_div_'+default_id).style.display = which=='tester' ? 'block' : 'none';
  }

  function zoom_in(event) {
    var id = retrieve_id('zoom_in', event.target.id)
    monitorview[id].pixelsPerTick *= 2;
  }

  function zoom_out(event) {
    var id = retrieve_id('zoom_out', event.target.id)
    monitorview[id].pixelsPerTick /= 2;
  }

  function move_left(event) {
    var id = retrieve_id('move_left', event.target.id)
    monitorview[id].start -= monitorview[id]._width / monitorview[id].pixelsPerTick / 4;
  }

  function move_right(event) {
    var id = retrieve_id('move_right', event.target.id)
    monitorview[id].start += monitorview[id]._width / monitorview[id].pixelsPerTick / 4;
  }



  // Retrieves the chip selected in the curtain input by the user to <callback>.
  // <callback> can be either add to or load into the simulation
  // If a saved chip is requested, the callback gets passed to the saved chip selector.
  function selected_chip(callback) {
    var selected = document.getElementById('components_'+default_id).value
    switch (selected) {
      case "nand": callback(get_nand_chip()); break;
      case "nor": callback(get_nor_chip()); break;
      case "in": callback(get_input_chip()); break;
      case "out": callback(get_output_chip()); break;
      case "dff": callback(get_dff_chip()); break;
      case "clock": callback(get_clock_chip()); break;
      case "memory": callback(get_memory_chip()); break;
      case "saved_circuit": saved_chip(callback, default_id); break;
      case "clipboard_circuit": clipboard_chip(callback, default_id); break;
      case "group": callback(get_group_chip()); break;
      case "ungroup": callback(get_ungroup_chip()); break;
      case "single_cycle": singlecycle_chip(callback); break;
      case "pipeline": pipelined_chip(callback); break;
      default: console.log("FUNCTION NOT YET IMPLEMENTED"); break;
    }
  }

  function toggle_simulation(event) {
    var id = retrieve_id('toggle_simulation', event.target.id)
    if (event.target.innerHTML=='Pause') {
      event.target.innerHTML='Play'
      circuit[id].stop();
    } else {
      event.target.innerHTML='Pause'
      circuit[id].start();
    }
  }

  function step(event) {
    var id = retrieve_id('step', event.target.id)
    circuit[id].updateGates()
  }

  function remove_chip() {
    var new_chip = circuit[default_id].toJSON()
    var to_remove = document.getElementById("to_remove_"+default_id).value

    // Remove the chip
    var key_to_remove = undefined
    for (var key in new_chip['devices']) {
      if (new_chip['devices'][key].label == to_remove) {
        key_to_remove = key
        delete new_chip['devices'][key]
      }
    }

    // Remove connection to and from that chip
    for (var connection in new_chip['connectors']) {
      if (new_chip['connectors'][connection].from.id == key_to_remove || new_chip['connectors'][connection].to.id == key_to_remove) {
        delete new_chip['connectors'][connection]
      }
    }

    // Rename devN name of chip to let them be in order
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

    // Rename connections to let them be in order
    var i = 0
    var connections = new_chip['connectors']
    new_chip['connectors'] = []
    for (var connection in connections) {
      new_chip['connectors'][i] = connections[connection]
      i += 1
    }

    load(new_chip, true, default_id)
  }

  function rename_chip() {
    var new_chip = circuit[default_id].toJSON()
    var to_rename = document.getElementById("to_rename_"+default_id).value
    var new_name = document.getElementById("new_name_"+default_id).value
    if (name_already_present(new_name)) return
    for (var key in new_chip['devices']) {
      if (new_chip['devices'][key].label == to_rename ) {
        new_chip['devices'][key].label = new_name
        new_chip['devices'][key].net = new_name
      }
    }
      load(new_chip, true, default_id)
  }

  // Add either component or saved subcircuit to simulation
  function add(to_add, is_subcircuit, subcircuit_type, as_component) {
    var new_chip = circuit[default_id].toJSON() // Save current chip
    var n_dev = Object.keys(new_chip['devices']).length + 1
    var n_sub = Object.keys(new_chip['subcircuits']).length + 1
    if (name_already_present(to_add.label)) return
    if (is_subcircuit==true) {
      if(as_component==true) {
        // In case a subcircuit has to be added just as component (subcircuit to subcircuit) -> this is for when a circuit is copied to clipboard and then added
        console.log('[Add] Subcircuit to subcircuit:')
        console.log(to_add)
        new_chip['devices']['dev' + n_dev] = to_add.devices.dev1
        for (var subsub in to_add['subcircuits']) {
          new_chip['subcircuits'][subsub] = to_add['subcircuits'][subsub]
        }
      } else {
        // Normal subcircuit (circuit to subcircuit)
        console.log('[Add] Circuit to subcircuit:')
        console.log(to_add)
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
    load(new_chip, true, default_id)
  }

  // Make a chip added as subcircuit into subcircuit form.
  function subcircuitfy(subcircuit, subcircuit_type) {
    var to_return = chip[default_id]['subcircuits']
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

  function load(chip_to_load, reload=true, id=default_id) {
    console.log('[' + id + '] LOAD:')
    console.log(chip_to_load)
    chip[id] = chip_to_load

    // This happens when loading a component into the canvas not as blackbox but showing internals
    if (chip_to_load['devices']==null) {
      var component = chip_to_load
      chip[id] = get_empty_chip()
      chip[id]['devices']['dev0'] = component
    }

    // Reinstantiate circuit
    // var old_paper = document.getElementById("paper") // This solution theoretically solves the problem of reloading but not that of monitors halting
    // var new_paper = document.createElement("div");
    // new_paper.id = "paper"
    // old_paper.replaceWith(new_paper)
    if (circuit[id]) circuit[id].stop()
    if (monitorview[id]) monitorview[id].shutdown() 
    if (iopanel[id]) iopanel[id].shutdown()
    delete(paper[id])
    delete(monitor[id])
    circuit[id] = new digitaljs.Circuit(chip[id]);
    monitor[id] = new digitaljs.Monitor(circuit[id]);
    monitorview[id] = new digitaljs.MonitorView({model: monitor[id], el: $('#monitor_'+id) });
    iopanel[id] = new digitaljs.IOPanelView({model: circuit[id], el: $('#iopanel_'+id) });
    paper[id] = circuit[id].displayOn($('#paper_'+id));

    // Reinstate simulation
    if (document.getElementById('toggle_simulation_'+id).innerHTML=='Play') {
      circuit[id].stop();
    } else {
      circuit[id].start();
    }
    monitorview[id].live = true

    monitor[id].on('add', () => {
      var keys = Object.keys(monitorview)
      for(var i=0; i<keys.length; i++) monitorview[keys[i]]._drawAll()
    });

    monitorview[id].on('change', (event) => {
      var keys = Object.keys(monitorview)
      for(var i=0; i<keys.length; i++) monitorview[keys[i]]._drawAll()
    })
    
    document.getElementById('paper_'+id).setAttribute('pointer-events', 'all')
    document.getElementById('paper_'+id).setAttribute('pointer-events', 'painted')

    // Reload
    if (reload) {
      save_state()
      location.reload()
    }
  }

  function retrieve_id(prefix, complete_id) {
     return complete_id.substring(prefix.length+1, complete_id.length)
  }

  //#endregion

  // DEBUG FUNCTION (utility)
  function debug() {
    chip[default_id] = get_empty_chip()
    chip[default_id].devices.dev1 = get_bus_ungroup()
    load(chip[default_id], true, default_id)
  }
