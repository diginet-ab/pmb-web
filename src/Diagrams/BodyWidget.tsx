import { CanvasWidget } from '@projectstorm/react-canvas-core';
import { DiagramEngine } from '@projectstorm/react-diagrams-core';
import * as React from 'react';

export interface BodyWidgetProps {
	engine: DiagramEngine
	classes: any
	className?: string
}

export const BodyWidget = (props: BodyWidgetProps) => {
	return <CanvasWidget { ...props } />;
}
