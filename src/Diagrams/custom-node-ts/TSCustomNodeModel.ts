import { BaseModelOptions, DeserializeEvent } from "@projectstorm/react-canvas-core";
import { NodeModel } from "@projectstorm/react-diagrams-core";
import { DefaultPortModel } from '@projectstorm/react-diagrams-defaults'

export interface TSCustomNodeModelOptions extends BaseModelOptions {
	color?: string
	plcPath?: string
}

export class TSCustomNodeModel extends NodeModel {
	color: string
	plcPath: string
	edit: boolean = true

	constructor(options: TSCustomNodeModelOptions = {}) {
		super({
			...options,
			type: 'ts-custom-node'
		})
		this.color = options.color || 'red';
		this.plcPath = options.plcPath || ''

		// setup an in and out port
		this.addPort(
			new DefaultPortModel({
				in: true,
				name: 'in'
			})
		);
		this.addPort(
			new DefaultPortModel({
				in: false,
				name: 'out'
			})
		)
	}

	setEdit(edit: boolean) {
		this.edit = edit
		this.fireEvent({ edit }, 'editMode')
	}

	serialize() {
		return {
			...super.serialize(),
			color: this.color,
		};
	}

	deserialize(event: DeserializeEvent<this>): void {
		super.deserialize(event);
		this.color = event.data.color;
	}
}
