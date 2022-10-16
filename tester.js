class Tester {
    constructor(model, container) {
        this.model = model
        this.container = container
        this.name = 'tests'
        this.tableModel = this._generateTableModel()
        this.render(Table(this.tableModel));
        this.model._graph.on('add', this.render)
        this.model._graph.on('add', this.render)
        // this.listenTo(this.model._graph, 'add', this._handleAdd);
        // this.listenTo(this.model._graph, 'remove', this._handleRemove);
        // this.listenTo(this.model, "display:add", () => { this.render() });
    }

    render(table) {
        console.log('TESTER RENDER')
        this.container.innerHTML = ''
        this.container.appendChild(table)
        this.container.appendChild(_button({id: 'add_test', onclick: 'add_test()'}, 'Add Test'))
    }

    _generateTableModel() {
        var inputs = this.model.getInputCells()
        var outputs = this.model.getOutputCells()

        var input_names = []
        for (var input of inputs) input_names.push( {
            colspan: 1,
            innerText: input.attributes.label
            } )

        var output_names = []
        for (var output of outputs) output_names.push( {
            colspan: 1,
            innerText: output.attributes.label
            } )

        return {
            name: this.name,
            head: [
                {
                    colspan: inputs.length+outputs.length+1,
                    innerText: 'Tests',
                },
                {
                    colspan: outputs.length*2,
                    innerText: 'Results'
                },
            ], 
            body: [
                [
                    {
                        colspan: 1,
                        rowspan: 2,
                        innerText: _button({id: 'run_all', onclick: 'run_all(event)'}, 'Run All')
                    },
                    {
                        colspan: inputs.length,
                        innerText: 'Inputs'
                    },
                    {
                        colspan: outputs.length,
                        innerText: 'Outputs'
                    },
                    {
                        colspan: outputs.length,
                        innerText: 'Values'
                    },
                    {
                        colspan: outputs.length,
                        innerText: 'Delay'
                    },
                ],
                [
                    ...input_names,
                    ...output_names,
                    ...output_names,
                    ...output_names
                ],
            ]
        }
    }

    addTest() {
        var inputs = this.model.getInputCells()
        var outputs = this.model.getOutputCells()

        var input_contents = []

        for (var input of inputs) input_contents.push( {
            colspan: 1,
            innerText: _input({id: 'checkbox_'+(this.tableModel.body.length-1)+'_'+input.attributes.label, type:'checkbox'})
            } )

        var output_contents = []
        var output_values = []
        var output_delays = []

        for (var output of outputs) {
            output_contents.push( {
                colspan: 1,
                innerText: _input({id: 'checkbox_'+(this.tableModel.body.length-1)+'_'+output.attributes.label, type:'checkbox'})
            } )
            output_values.push( {
                colspan: 1,
                innerText: 'x'
            } )
            output_delays.push( {
                colspan: 1,
                innerText: 'd'
            } )
        }

        this.tableModel.body.push([
            {
                colspan: 1,
                innerText: _button({id: 'run_test_'+(this.tableModel.body.length-1), onclick:'run_test(event)'}, 'Run Test')
            },
            ...input_contents,
            ...output_contents,
            ...output_values,
            ...output_delays
        ]
        )
        this.render(Table(this.tableModel))
    }

    runAll(event) {
        console.log('Run All Tests')
        for (var i=0; i<this.tableModel.body.length-2; i++) {
            this.runTest(_, i+1)
        }
    }

    runTest(event, n) {
        var inputs = this.model.getInputCells()
        var outputs = this.model.getOutputCells()
        if (n==undefined) n = parseInt(retrieve_id('run_test', event.target.id))
        console.log('Running Test: ' + n)
        var row = this.tableModel.body[n+1]

        // Stop the simulation
        // circuit[default_id].stop();
        document.getElementById('toggle_simulation_'+default_id).click()

        // Set the inputs
        for(var input of inputs) {
            var value_to_set = document.getElementById('checkbox_'+n+'_'+input.attributes.label).checked
            // console.log(value_to_set)
            // console.log(input.get('outputSignals').out.isHigh)
            circuit['sheas_container'].getInputCells()[inputs.indexOf(input)].setInput(circuit['sheas_container']._display3vl.read('bin', value_to_set ? '1' : '0', 1))
            // console.log(document.getElementById('checkbox_1_in_0').value)
        }

        // 100 Steps 
        for (var i=0; i<100; i++) {
            document.getElementById('step_'+default_id).click()
        }

        // Check output
        for (var output of outputs) {
            var value_to_check = document.getElementById('checkbox_'+n+'_'+output.attributes.label).checked
            var test_passed = circuit['sheas_container'].getOutputCells()[outputs.indexOf(output)].get('inputSignals').in.isHigh==value_to_check
            this.tableModel.body[n+1][inputs.length+outputs.length+outputs.indexOf(output)+1].background = test_passed ? 'green' : 'red'  
            this.tableModel.body[n+1][inputs.length+outputs.length+outputs.indexOf(output)+1].innerText = value_to_check ? '1' : '0'
        }

        console.log(this.tableModel)
        this.render(Table(this.tableModel))
    }
}

function test_all(event) {
    console.log('testing_all: ', event.target)
  }

function add_test() {
    tester[default_id].addTest()
}

function run_test(event) {
    tester[default_id].runTest(event)
}

function run_all(event) {
    tester[default_id].runAll(event)
}