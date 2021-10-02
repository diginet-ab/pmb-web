import * as React from 'react'
import { ValueNodeModel } from './ValueNodeModel'
import { ValueNodeWidget } from './ValueNodeWidget'
import { DiagramEngine } from '@projectstorm/react-diagrams-core'
import { AbstractReactFactory, GenerateModelEvent } from '@projectstorm/react-canvas-core'

export class ValueNodeFactory extends AbstractReactFactory<ValueNodeModel, DiagramEngine> {
	constructor(protected classes: any) {
		super('ts-value-node')
	}

	generateModel(event: GenerateModelEvent) {
		return new ValueNodeModel()
	}

	generateReactWidget(event: { model: ValueNodeModel }): JSX.Element {
		return <ValueNodeWidget classes={ this.classes } engine={this.engine as DiagramEngine} node={event.model} />
	}
}
