function AddOrLoadRow() {
    return Div({id: 'add_or_load_line'},
        [
            Label({for: 'components'}, 'Choose a component'),
            Select({id: 'components', name: 'components'},
                [
                    Option({value: 'saved_circuit'},'Saved Circuit'),                    
                    Option({value: 'clipboard_circuit'},'Circuit from Clipboard'),
                    Optgroup({label: 'I/O Components'},
                        [
                            Option({value: 'in'},'Input Button'),
                            Option({value: 'out'},'Output Lamp'),
                            Option({value: 'clock'},'Clock'),
                            Option({value: 'constant'},'Constant (not implemented)'),
                            Option({value: '7segment'},'7 Segment Display (not implemented)')
                        ]
                    ),
                    Optgroup({label: 'Universal Gates'},
                        [
                            Option({value: 'nand'},'Nand'),
                            Option({value: 'nor'},'Nor')
                        ]
                    ),
                    Optgroup({label: 'Basic Combinatorial Gates'},
                        [
                            Option({value: 'not'},'Not (not implemented)'),
                            Option({value: 'and'},'And (not implemented)'),
                            Option({value: 'or'},'Or (not implemented)')
                        ]
                    ),
                    Optgroup({label: 'Sequential Circuits'},
                        [
                            Option({value: 'd_latch'},'D-Latch (not implemented)'),
                            Option({value: 'dff'},'Register (D-Flip-Flop)'),
                            Option({value: 'memory'},'Memory')
                        ]
                    ),
                    Optgroup({label: 'Other Combinatorial Gates'},
                        [
                            Option({value: 'repeater'},'Repeater (not implemented)'),
                            Option({value: 'nor'},'Nor (not implemented)'),
                            Option({value: 'xor'},'Xor (not implemented)'),
                            Option({value: 'shiftL'},'Shift Left (not implemented)'),
                            Option({value: 'shiftR'},'Shift Right (not implemented)'),
                            Option({value: 'eq'},'Equal (not implemented)'),
                            Option({value: 'ne'},'Not Equal (not implemented)'),
                            Option({value: 'lt'},'Less Than (not implemented)'),
                            Option({value: 'le'},'Less or Equal (not implemented)'),
                            Option({value: 'gt'},'Greater Than (not implemented)'),
                            Option({value: 'ge'},'Greater or Equal (not implemented)'),
                            Option({value: 'neg'},'Negation (not implemented)'),
                            Option({value: 'una'},'Unary Plus (not implemented)')
                        ]
                    ),
                    Optgroup({label: 'Buses'},
                        [
                            Option({value: 'group'},'Bus Group'), 
                            Option({value: 'ungroup'},'Bus Ungroup')
                        ]
                    ),
                    Optgroup({label: 'Cores'},
                        [
                            Option({value: 'single_cycle'},'Single Cycle (Core only)'), 
                            Option({value: 'pipeline'},'Pipeline (Core only)') 
                        ]
                    )                    
                ]
            ),
            Div({id: 'additional_settings', style: 'display: inline-block;'}),
            'and',
            Button({id: 'add'},'Add'),
            'it to the visualization or',
            Button({id: 'load'},'Load'),
            'it ex novo.'
        ]
    )
}

function RemoveRow() {
    return Div({id: 'remove_line'},
        [
            Input({type: 'text', name: 'to_remove', id: 'to_remove', placeholder: 'Name the Component'},),
            'to', 
            Button({id: 'remove'},'Remove')
        ]
    )
}

function RenameRow() {
    return Div({id: 'rename_line'},
        [
            Button({id: 'rename'},'Rename'),
            Input({type: 'text', name: 'to_rename', id: 'to_rename', placeholder: 'Component to Rename'},),
            'to',
            Input({type: 'text', name: 'new_rename', id: 'new_name', placeholder: 'New Name'},),
        ]
    )
}

function VisualizationControls() {
    return Div({id: 'visualization_controls'},
        [
            Button({id: 'reload'}, 'Reload'), ',',
            Button({id: 'reset'}, 'Reset'), ',',
            Button({id: 'save'}, 'Save'), ',',
            Button({id: 'share_chip'}, 'Share only the chip'), 'or',
            Button({id: 'share_link'}, 'Share circuit as link'), '.',
            Button({id: 'debug', style: 'visibility: hidden;'}, 'Debug'),
        ]
    )
}

function Paper() {
    return Div( {style: 'height:500px; width:100%; overflow: scroll; border-style: inset; pointer-events:painted;'}, Div({id: 'paper'}) )
}

function SimulationControls() {
 return Div({id: 'simulation_controls'},
    [
        Button({id: 'toggle_simulation'}, 'Pause'), 'or',
        Button({id: 'step'}, 'Step'), ' the simulation',
        Br(), Br()
    ]
 )
}

function MonitorControls() {
    return Div({id: 'monitor_controls'},
        [
            'Click on the blue looking glass that pops up hovering wires to track them below.',
            Br(), 'Monitor',
            Button({id: 'ppt_up'}, 'Zoom In'),
            Button({id: 'ppt_down'}, 'Zoom Out'),
            Button({id: 'left'}, 'Move Left'),
            Button({id: 'right'}, 'Move Right'),
        ]
    )
}

function Monitor() {
    return Div({style: 'height:500px; width:100%; pointer-events:painted;'},Div({id: 'monitor'}))
}

function IOPanel() {
    return Div({id: 'iopanel'})
}

function BuildSHEAS(sheas_container) {
    sheas_container.appendChild( Div({id: 'sheas'},
        [
            AddOrLoadRow(),
            RemoveRow(),
            RenameRow(),
            VisualizationControls(),
            Paper(),
            SimulationControls(),
            MonitorControls(),
            Monitor(),
            IOPanel()
        ]
    ))
}