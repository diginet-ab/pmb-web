import * as React from 'react'
import { TSCustomNodeModel } from './TSCustomNodeModel'
import { PlcIcon } from '../../PlcControl'
import CancelOnIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { Box } from '@material-ui/core'
import { useEffect, useState } from 'react'
import { DiagramEngine, PortWidget } from '@projectstorm/react-diagrams-core'

const useForceUpdate = () => {
    const [, setValue] = useState(0); // integer state
    return () => setValue(value => ++value); // update the state to force render
}

interface TSCustomNodeWidgetProps {
	node: TSCustomNodeModel
	engine: DiagramEngine
	classes: any
}

export const TSCustomNodeWidget = (props: TSCustomNodeWidgetProps) => {
	const [plcVar] = useState(props.node.plcPath)
	const forceUpdate = useForceUpdate()
	useEffect(() => {
		const customNodeListener = props.node.registerListener({
			editMode: (par) => {
				forceUpdate()
			}
		})
		return () => customNodeListener.deregister()
	}, [forceUpdate, props.node])
	return <Box className={ props.node.isSelected() ? props.classes.customNodeSelected : props.classes.customNode} display="flex" flexWrap="wrap" flexDirection="row" alignItems="center" justifyContent="spaceEvenly" >
			<PortWidget engine={props.engine} port={props.node.getPort('in')!}>
			{ props.node.edit ?	<div className={ props.classes.circlePort } /> : null }
			</PortWidget>
			<PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar={ plcVar }
							label={ props.node.plcPath.split('.').pop()! } inverted={false} colorFalse="red" colorTrue="green" style={{}} />
			<PortWidget engine={props.engine} port={props.node.getPort('out')!}> 
			{ props.node.edit ?	<div className={ props.classes.circlePort } /> : null }
			</PortWidget>
		</Box>
}
