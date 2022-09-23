const version = 'v1.1'

function Title() {
    return _div({id:'title'},
        [
            _h1({style: 'display: inline-block;'}, 'Simple Hardware Editor And Simulator'),
            version
        ]
    )
}

function AddOrLoadRow() {
    return _div({id: 'add_or_load_line'},
        [
            _label({for: 'components'}, 'Choose a component'),
            _select({id: 'components', name: 'components', onchange: 'display_additional_settings()'},
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
            _div({id: 'additional_settings', style: 'display: inline-block;'}),
            'and',
            _button({id: 'add', onclick: 'selected_chip(add)'},'Add'),
            'it to the visualization or',
            _button({id: 'load', onclick: 'selected_chip(load)'},'Load'),
            'it ex novo.'
        ]
    )
}

function RemoveRow() {
    return _div({id: 'remove_line'},
        [
            _input({type: 'text', name: 'to_remove', id: 'to_remove', placeholder: 'Name the Component'},),
            'to',
            _button({id: 'remove', onclick: 'remove_chip()'},'Remove')
        ]
    )
}

function RenameRow() {
    return _div({id: 'rename_line'},
        [
            _button({id: 'rename', onclick: 'rename_chip()'},'Rename'),
            _input({type: 'text', name: 'to_rename', id: 'to_rename', placeholder: 'Component to Rename'},),
            'to',
            _input({type: 'text', name: 'new_rename', id: 'new_name', placeholder: 'New Name'},),
        ]
    )
}

function VisualizationControls() {
    return _div({id: 'visualization_controls'},
        [
            _button({id: 'reload', onclick: 'reload()'}, 'Reload'), ',',
            _button({id: 'reset', onclick: 'reset()'}, 'Reset'), ',',
            _button({id: 'save', onclick: 'save()'}, 'Save'), ',',
            _button({id: 'share_chip', onclick: 'share_chip()'}, 'Share only the chip'), 'or',
            _button({id: 'share_link', onclick: 'share_link()'}, 'Share circuit as link'), '.',
            _button({id: 'debug', onclick: 'debug()', style: 'visibility: hidden;'}, 'Debug'),
        ]
    )
}

function Paper() {
    return _div( {style: 'max-height:500px; width:100%; overflow: scroll; pointer-events:painted; scrollbar-color: white'}, _div({id: 'paper'}) )
}

function SimulationControls() {
 return _div({id: 'simulation_controls'},
    [
        _button({id: 'toggle_simulation', onclick: 'toggle_simulation()'}, 'Pause'), 'or',
        _button({id: 'step', onclick: 'step()'}, 'Step'), ' the simulation',
        _br(), _br()
    ]
 )
}

function MonitorOrTesterControls() {
    return _div({id: 'monitor_or_tester_controls'},
        [
            _button({id: 'show_monitor', onclick: 'monitor_or_tester("monitor")'}, 'Monitor Tab'),
            _button({id: 'show_tester', onclick: 'monitor_or_tester("tester")'}, 'Tester Tab')
        ]
    )
}

function MonitorControls(title=true) {
    console.log('Title for monitor: ', title)
    return _div({id: 'monitor_controls'},
        [
            title ? _h3({id: 'monitor_title'}, 'Monitor') : _div(),
            'Click on the blue looking glass that pops up hovering wires to track them below.',
            _br(), 'Monitor',
            _button({id: 'zoom_in', onclick: 'zoom_in()'}, 'Zoom In'),
            _button({id: 'zoom_out', onclick: 'zoom_out()'}, 'Zoom Out'),
            _button({id: 'move_left', onclick: 'move_left()'}, 'Move Left'),
            _button({id: 'move_right', onclick: 'move_right()'}, 'Move Right'),
        ]
    )
}

function Monitor() {
    return _div({style: 'width:100%; pointer-events:painted;'},_div({id: 'monitor'}))
}

function MonitorDiv() {
    return _div({id: 'monitor_div', style: 'display: block;'},
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
    return _div({id: 'iopanel'})
}

function TesterDiv() {
    return _div({id: 'tester_div', style: 'display: none;'},
            [
                TesterControls(),
                Tester()
            ]
    )
}

function BuildSHEAS(sheas_container) {
    window.onbeforeunload = shutdown
    sheas_container.appendChild( _div({id: 'sheas'},
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
    ))
    sheas_container.style['background-color'] = 'white'
}

function BuildEmbeddedSHEAS(sheas_container, compressed_chip) {
    window.onbeforeunload = shutdown
    sheas_container.appendChild( _div({id: 'sheas'},
        [
            Paper(),
            SimulationControls(),
            MonitorControls(false),
            Monitor()
        ]
    ))
    sheas_container.style['background-color'] = 'white'
    sheas_container.style['color'] = 'black'
    sheas_container.style['border-style'] = 'solid'
    load(JSON.parse(LZString.decompressFromBase64(compressed_chip)))
}
