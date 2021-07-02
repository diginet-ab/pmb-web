import * as React from 'react'
import { TSCustomNodeModel } from './TSCustomNodeModel'
import { TSCustomNodeWidget } from './TSCustomNodeWidget'
import { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { AbstractReactFactory, GenerateModelEvent } from '@projectstorm/react-canvas-core'

export class TSCustomNodeFactory extends AbstractReactFactory<TSCustomNodeModel, DiagramEngine> {
	constructor(protected classes: any) {
		super('ts-custom-node')
	}

	generateModel(event: GenerateModelEvent) {
		return new TSCustomNodeModel()
	}

	generateReactWidget(event: { model: TSCustomNodeModel }): JSX.Element {
		return <TSCustomNodeWidget classes={ this.classes } engine={this.engine as DiagramEngine} node={event.model} />
	}
}
