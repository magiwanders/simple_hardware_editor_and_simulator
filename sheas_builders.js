const version = 'v1.2'
var build_id = ''

function Title() {
    return _div({id:'title_'+build_id},
        [
            _h1({style: 'display: inline-block;'}, 'Simple Hardware Editor And Simulator'),
            version
        ]
    )
}

function AddOrLoadRow() {
    return _div({id: 'add_or_load_line_'+build_id},
        [
            _label({for: 'components'}, 'Choose a component'),
            _select({id: 'components_'+build_id, name: 'components', onchange: 'display_additional_settings()'},
                [
                    _option({value: 'saved_circuit'},'Saved Circuit'),
                    _option({value: 'clipboard_circuit'},'Circuit from Clipboard'),
                    _optgroup({label: 'I/O Components'},
                        [
                            _option({value: 'in'},'Input Button'),
                            _option({value: 'out'},'Output Lamp'),
                            _option({value: 'clock'},'Clock'),
                            _option({value: 'constant'},'Constant (not implemented)'),
                            _option({value: '7segment'},'7 Segment Display (not implemented)')
                        ]
                    ),
                    _optgroup({label: 'Universal Gates'},
                        [
                            _option({value: 'nand'},'Nand'),
                            _option({value: 'nor'},'Nor')
                        ]
                    ),
                    _optgroup({label: 'Basic Combinatorial Gates'},
                        [
                            _option({value: 'not'},'Not (not implemented)'),
                            _option({value: 'and'},'And (not implemented)'),
                            _option({value: 'or'},'Or (not implemented)')
                        ]
                    ),
                    _optgroup({label: 'Sequential Circuits'},
                        [
                            _option({value: 'd_latch'},'D-Latch (not implemented)'),
                            _option({value: 'dff'},'Register (D-Flip-Flop)'),
                            _option({value: 'memory'},'Memory')
                        ]
                    ),
                    _optgroup({label: 'Other Combinatorial Gates'},
                        [
                            _option({value: 'repeater'},'Repeater (not implemented)'),
                            _option({value: 'nor'},'Nor (not implemented)'),
                            _option({value: 'xor'},'Xor (not implemented)'),
                            _option({value: 'shiftL'},'Shift Left (not implemented)'),
                            _option({value: 'shiftR'},'Shift Right (not implemented)'),
                            _option({value: 'eq'},'Equal (not implemented)'),
                            _option({value: 'ne'},'Not Equal (not implemented)'),
                            _option({value: 'lt'},'Less Than (not implemented)'),
                            _option({value: 'le'},'Less or Equal (not implemented)'),
                            _option({value: 'gt'},'Greater Than (not implemented)'),
                            _option({value: 'ge'},'Greater or Equal (not implemented)'),
                            _option({value: 'neg'},'Negation (not implemented)'),
                            _option({value: 'una'},'Unary Plus (not implemented)')
                        ]
                    ),
                    _optgroup({label: 'Buses'},
                        [
                            _option({value: 'group'},'Bus Group'),
                            _option({value: 'ungroup'},'Bus Ungroup')
                        ]
                    ),
                    _optgroup({label: 'Cores'},
                        [
                            _option({value: 'single_cycle'},'Single Cycle (Core only)'),
                            _option({value: 'pipeline'},'Pipeline (Core only)')
                        ]
                    )
                ]
            ),
            _div({id: 'additional_settings_'+build_id, style: 'display: inline-block;'}),
            ' and ',
            _button({id: 'add_'+build_id, onclick: 'selected_chip(add)'},'Add'),
            ' it to the visualization or ',
            _button({id: 'load_'+build_id, onclick: 'selected_chip(load)'},'Load'),
            ' it ex novo.'
        ]
    )
}

function RemoveRow() {
    return _div({id: 'remove_line_'+build_id},
        [
            _input({type: 'text', name: 'to_remove_'+build_id, id: 'to_remove_'+build_id, placeholder: 'Name the Component'},),
            'to',
            _button({id: 'remove_'+build_id, onclick: 'remove_chip()'},'Remove')
        ]
    )
}

function RenameRow() {
    return _div({id: 'rename_line_'+build_id},
        [
            _button({id: 'rename', onclick: 'rename_chip()'},'Rename'),
            _input({type: 'text', name: 'to_rename', id: 'to_rename_'+build_id, placeholder: 'Component to Rename'},),
            'to',
            _input({type: 'text', name: 'new_rename', id: 'new_name_'+build_id, placeholder: 'New Name'},),
        ]
    )
}

function VisualizationControls() {
    return _div({id: 'visualization_controls_'+build_id, style: 'display: flex;'},
        [
            _button({id: 'reload_'+build_id, onclick: 'reload()'}, 'Reload'), ',',
            _button({id: 'reset_'+build_id, onclick: 'reset()'}, 'Reset'), ',',
            _button({id: 'save_'+build_id, onclick: 'save()'}, 'Save'), ',',
            ShareButtons(),
            _button({id: 'debug_'+build_id, onclick: 'debug()', style: 'visibility: hidden;'}, 'Debug')
        ]
    )
}

function ShareButtons() {
    return _div({id: 'share_buttons_'+build_id},
        [
            _button({id: 'share_chip_'+build_id, onclick: 'share_chip(event)'}, 'Share only the chip'), 'or',
            _button({id: 'share_link_'+build_id, onclick: 'share_link(event)'}, 'Share circuit as link'), '.'
        ]
    )
}

function Paper() {
    return _div( {style: 'max-height:500px; width:100%; overflow: scroll; pointer-events:painted; scrollbar-color: white'}, _div({id: 'paper_'+build_id}) )
}

function SimulationControls() {
 return _div({id: 'simulation_controls_'+build_id},
    [
        _button({id: 'toggle_simulation_'+build_id, onclick: 'toggle_simulation(event)'}, 'Pause'), 'or',
        _button({id: 'step_'+build_id, onclick: 'step(event)'}, 'Step'), ' the simulation',
        _br(), _br()
    ]
 )
}

function MonitorOrTesterControls() {
    return _div({id: 'monitor_or_tester_controls_'+build_id},
        [
            _button({id: 'show_monitor_'+build_id, onclick: 'monitor_or_tester("monitor")'}, 'Monitor Tab'),
            _button({id: 'show_tester_'+build_id, onclick: 'monitor_or_tester("tester")'}, 'Tester Tab <todo>')
        ]
    )
}

function MonitorControls(title=true) {
    return _div({id: 'monitor_controls_'+build_id},
        [
            title ? _h3({id: 'monitor_title_'+build_id}, 'Monitor') : _div(),
            'Click on the blue looking glass that pops up hovering wires to track them below.',
            _br(), 'Monitor',
            _button({id: 'zoom_in_'+build_id, onclick: 'zoom_in(event)'}, 'Zoom In'),
            _button({id: 'zoom_out_'+build_id, onclick: 'zoom_out(event)'}, 'Zoom Out'),
            _button({id: 'move_left_'+build_id, onclick: 'move_left(event)'}, 'Move Left'),
            _button({id: 'move_right_'+build_id, onclick: 'move_right(event)'}, 'Move Right'),
        ]
    )
}

function Monitor() {
    return _div({style: 'width:100%; pointer-events:painted;'},_div({id: 'monitor_'+build_id}))
}

function MonitorDiv() {
    return _div({id: 'monitor_div_'+build_id, style: 'display: block;'},
        [
            MonitorControls(),
            Monitor(),
        ]
    )
}

function TesterControls() {
    return _div({id: 'tester_controls'},
        [
            _h3({id: 'tester_title'}, 'Tester'),
            '(this is the digitaljs IOPanel, it will be substituted by a more advanced tester.)',
            _br(), _br()
        ]
    )
}

function Tester() {
    return _div({id: 'iopanel_'+build_id})
}

function TesterDiv() {
    return _div({id: 'tester_div_'+build_id, style: 'display: none;'},
            [
                TesterControls(),
                Tester()
            ]
    )
}

function CompleteSHEAS() {
    return _div({id: 'sheas_'+build_id},
        [
            Title(),
            AddOrLoadRow(),
            RemoveRow(),
            RenameRow(),
            VisualizationControls(),
            Paper(),
            SimulationControls(),
            MonitorOrTesterControls(),
            MonitorDiv(),
            TesterDiv()
        ]
    )
}

function EmbeddedSHEAS() {
    return _div({id: 'sheas_'+build_id},
        [
            ShareButtons(),
            Paper(),
            SimulationControls(),
            MonitorControls(false),
            Monitor()
        ]
    )
}

function buildSHEAS(embedding_type, sheas_container, compressed_chip) {
    window.onbeforeunload = shutdown
    sheas_container.innerHTML = ''
    build_id = sheas_container.id
    var sheas
    switch (embedding_type) {
        case 'complete': sheas = CompleteSHEAS(); break;
        case 'embedded': sheas = EmbeddedSHEAS(); break;
        default: break;
    }
    sheas_container.appendChild(sheas)
    sheas_container.style['background-color'] = 'white'
    sheas_container.style['color'] = 'black'
    sheas_container.style['border-style'] = 'solid'
    if (compressed_chip == undefined) {
        setup()
    } else {
        load(JSON.parse(LZString.decompressFromBase64(compressed_chip)), false, build_id)
    }
}
