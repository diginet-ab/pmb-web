import React, { useRef, } from 'react'
import { TSCustomNodeFactory } from './custom-node-ts/TSCustomNodeFactory'
import { TSCustomNodeModel } from './custom-node-ts/TSCustomNodeModel'
import { BodyWidget } from './BodyWidget'
import { makeStyles } from '@material-ui/core'
import { PlcZoomCanvasAction } from './PlcZoomCanvasAction'
import { CanvasEngineOptions, SelectionBoxLayerFactory, InputType } from '@projectstorm/react-canvas-core'
import { DiagramEngine, NodeLayerFactory, LinkLayerFactory, DefaultDiagramState, DiagramModel } from '@projectstorm/react-diagrams-core'
import { DefaultLabelFactory, DefaultNodeFactory, DefaultLinkFactory, DefaultPortFactory, DefaultLinkModel } from '@projectstorm/react-diagrams-defaults'
import { PathFindingLinkFactory } from '@projectstorm/react-diagrams'
import { ValueNodeModel } from './value-node-ts/ValueNodeModel'
import { ValueNodeFactory } from './value-node-ts/ValueNodeFactory'

const useStyles = makeStyles({
    customNode: {
        //border: 'solid 2px gray',
        border: 'none',
        borderRadius: '5px',
        //width: '300px',
        height: '50px',
        //display: 'flex',
        //alignItems: 'flex-start',
        //justifyContent: 'space-between',
        position: 'relative',
    },
    customNodeSelected: {
        border: 'solid 3px black',
        borderRadius: '5px',
        //width: '300px',
        height: '50px',
        //display: 'flex',
        //alignItems: 'flex-start',
        //justifyContent: 'space-between',
        position: 'relative',
    },
    customNodeColor: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '20px',
        height: '20px',
        transform: 'translate(-50 %, -50 %)',
        borderRadius: '10px',
    },
    circlePort: {
        width: '12px',
        height: '12px',
        margin: '2px',
        borderRadius: '4px',
        background: 'darkgray',
        cursor: 'pointer',
        '&hover': {
            background: 'mediumpurple',
        }
    },
})

export interface PlcGridOffset {
    x: number;
    y: number;
}

class PlcDiagramEngine extends DiagramEngine {
    mouseMoveActions = [] as any[]
    mouseDownActions = [] as any[]
    constructor(options: CanvasEngineOptions = {}) {
        super(options)
        // register model factories
        this.getLayerFactories().registerFactory(new NodeLayerFactory() as any)
        this.getLayerFactories().registerFactory(new LinkLayerFactory() as any)
        this.getLayerFactories().registerFactory(new SelectionBoxLayerFactory())

        this.getLabelFactories().registerFactory(new DefaultLabelFactory())
        this.getNodeFactories().registerFactory(new DefaultNodeFactory()) // i cant figure out why
        this.getLinkFactories().registerFactory(new DefaultLinkFactory())
        this.getLinkFactories().registerFactory(new PathFindingLinkFactory())
        this.getPortFactories().registerFactory(new DefaultPortFactory())

        // register the default interaction behaviours
        this.getStateMachine().pushState(new DefaultDiagramState())

        let xx = this.eventBus.getActionsForType(InputType.MOUSE_WHEEL)
        for (const x of xx)
            this.eventBus.deregisterAction(x)

        this.eventBus.registerAction((new PlcZoomCanvasAction()) as any)
        this.saveActions()
    }
    setEdit(state: boolean) {
        if (!state) {
            this.removeActions()
        } else {
            this.restoreActions()
        }

    }
    protected saveActions() {
        this.mouseMoveActions = this.eventBus.getActionsForType(InputType.MOUSE_MOVE)
        this.mouseDownActions = this.eventBus.getActionsForType(InputType.MOUSE_DOWN)
    }
    protected removeActions() {
        for (const y of this.mouseMoveActions)
            this.eventBus.deregisterAction(y)
        for (const z of this.mouseDownActions)
            this.eventBus.deregisterAction(z)
    }
    protected restoreActions() {
        for (const y of this.mouseMoveActions)
            this.eventBus.registerAction(y)
        for (const z of this.mouseDownActions)
            this.eventBus.registerAction(z)
    }
}

export const useDiagramEngine = (edit: boolean, gridOffset: PlcGridOffset, setGridOffset: (value: PlcGridOffset) => void, gridSize: number, setGridSize: (value: number | null) => void, zoom: number, setZoom: (value: number | null) => void) => {

    const classes = useStyles()
    const ref = useRef<PlcDiagramEngine>(null as any as PlcDiagramEngine)
    //const ref = useRef<DiagramEngine>(null as any as DiagramEngine)

    if (!ref.current) {
        ref.current = new PlcDiagramEngine() // createEngine()
        ref.current.setEdit(edit)

        // register the factory
        ref.current.getNodeFactories().registerFactory(new TSCustomNodeFactory(classes))
        ref.current.getNodeFactories().registerFactory(new ValueNodeFactory(classes))

        // create a diagram model
        const model = new DiagramModel()

        model.setGridSize(gridSize)
        model.setZoomLevel(zoom * 100)
        model.registerListener({
            offsetUpdated: (e: any) => {
                if (setGridOffset)
                    setGridOffset({ x: e.offsetX, y: e.offsetY })
            },
            zoomUpdated: (e: any) => {
                if (setZoom)
                    setZoom(e.zoom / 100)
            },
            gridUpdated: (e: any) => {
                if (setGridSize)
                    setGridSize(e.size)
            },
        })


        //####################################################
        // now create two nodes of each type, and connect them
        
        const node1 = new TSCustomNodeModel({ plcPath: '$(GM_BASE).IO.DOut.T_QM3', color: 'rgb(192,255,0)' })
        node1.setPosition(50, 50)

        const node2 = new TSCustomNodeModel({ plcPath: '$(GM_BASE).IO.DOut.F_QM1', color: 'rgb(0,192,255)' })
        node2.setPosition(200, 50)

        const link1 = new DefaultLinkModel()
        link1.setSourcePort(node1.getPort('out')!)
        link1.setTargetPort(node2.getPort('in')!)

        const node3 = new ValueNodeModel({ plcPath: '$(GM_BASE).Regulation.Temperature.Control.PV' })
        node3.setPosition(300, 75)

        model.addAll(node1, node2, link1, node3)
        

        // install the model into the engine
        ref.current.setModel(model)
    }
    const setEdit = (edit: boolean) => {
        ref.current?.setEdit(edit)
    }

    return [ref.current, setEdit] as const
}

interface DiagramProps {
    engine: DiagramEngine
    classes: any
    className?: string
    height: number
}

export const PlcDiagram = (props: DiagramProps) => {
    return <div style={{ height: props.height }} >
        <BodyWidget classes={props.classes} className={props.classes.diagramContainer} engine={props.engine} />
    </div>
}
