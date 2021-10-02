import * as React from 'react'
import { ValueNodeModel } from './ValueNodeModel'
import { PlcIcon, PlcNumberField } from '../../PlcControl'
import CancelOnIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { Box } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'
import { useTranslate } from 'react-admin'

const useForceUpdate = () => {
    const [, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}

interface ValueNodeWidgetProps {
	node: ValueNodeModel
	engine: DiagramEngine
	classes: any
}

export const ValueNodeWidget = (props: ValueNodeWidgetProps) => {
	const [plcVar] = useState(props.node.plcPath)
	const forceUpdate = useForceUpdate()
    const translate = useTranslate()
	useEffect(() => {
		const customNodeListener = props.node.registerListener({
			editMode: (par) => {
				forceUpdate()
			}
		})
		return () => customNodeListener.deregister()
	}, [forceUpdate, props.node])
	return <Box className={ props.node.isSelected() ? props.classes.customNodeSelected : props.classes.customNode} style={{ height: "100px" }} display="flex" flexWrap="wrap" flexDirection="row" alignItems="center" justifyContent="spaceEvenly" >
			<PortWidget engine={props.engine} port={props.node.getPort('in')!}>
			{ props.node.edit ?	<div className={ props.classes.circlePort } /> : null }
			</PortWidget>
			<PlcNumberField plcVar={ plcVar } label={translate("custom.temperaturePV")} template={ '{0} °C' } />
			<PortWidget engine={props.engine} port={props.node.getPort('out')!}> 
			{ props.node.edit ?	<div className={ props.classes.circlePort } /> : null }
			</PortWidget>
		</Box>
}
