import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    IconButton,
    makeStyles,
    TextField,
    Tooltip,
} from "@material-ui/core";
import { PlcDiagram, PlcGridOffset, useDiagramEngine } from "../Diagrams/PlcDiagram";
import { TSCustomNodeModel } from "./custom-node-ts/TSCustomNodeModel";
import { MyCheckBox } from "../dashboard/Dashboard";
import CloseIcon from "@material-ui/icons/Close";
import EditIcon from "@material-ui/icons/Edit";
//import { useParameter } from "../PlcControl";
import { DiagramModel } from "@projectstorm/react-diagrams-core";
//import NumberFormat from 'react-number-format'

interface stylesProps {
    gridOffset: PlcGridOffset
    showGrid: boolean
    gridSize: number
    zoom: number
    edit: boolean
}

const backgroundBars =
    "linear-gradient(to right, lightgray 0%, transparent 1px, transparent 100% ), linear-gradient( to bottom, lightgray 0%, transparent 1px, transparent 100%)";

const useStyles = makeStyles((theme) => ({
    toolBar: {
        backgroundColor: "white", // theme.palette.primary.main
        borderColor: "gray",
        borderStyle: "solid",
        borderWidth: "3px 3px 0 3px",
        borderRadius: "5px 5px 0px 0px",
    },
    diagramContainer: {
        backgroundColor: "white",
        backgroundImage: (props: stylesProps) => {
            //console.log(props)
            return props.showGrid ? backgroundBars : ""
        },
        //backgroundSize: "25px 100%, 100% 25px",
        backgroundSize: (props: stylesProps) => {
            const size = props.gridSize * props.zoom
            return `${size}px 100%, 100% ${size}px`
        },
        backgroundPosition: (props: stylesProps) => {
            let x = props.gridOffset.x % (props.gridSize * props.zoom)
            let y = props.gridOffset.y % (props.gridSize * props.zoom)

            return `${x}px 0, 0 ${y}px`
        },
        backgroundRepeat: "repeat",
        width: "100%",
        height: "100%",
        border: "solid 3px gray",
        borderRadius: (props: stylesProps) => `${ props.edit ? "0" : "5"}px 5px 5px 5px`,
    },
}))

export const PlcDiagramEditor = (props: { height: number }) => {
    const [gridOffset, setGridOffset] = useState({
        x: 0,
        y: 0,
    } as PlcGridOffset)
    const [gridSize, setGridSize] = useState(25)
    const [showGrid, setShowGrid] = useState(false)
    const [editShowGrid, setEditShowGrid] = useState(true)
    const [snapToGrid, setSnapToGrid] = useState(true)
    const [zoom, setZoom] = useState(1)
    const [lastZoom, setLastZoom] = useState(zoom)
    const [edit, setEdit] = useState(false);

    //const [plcDiagram, setPlcDiagram] = useParameter('$(GM_BASE).System.Diagram', '')
    const [plcDiagram, setPlcDiagram] = useState('')

    const [, setEngineGridOffset] = useState({ 
        x: gridOffset.x, 
        y: gridOffset.y, 
    })
    const [engineGridSize, setEngineGridSize] = useState(null as number | null)
    const [engineZoom, setEngineZoom] = useState(null as number | null)

    const setNewEngineGridOffset = (value: PlcGridOffset)  => {
        setEngineGridOffset(value)
        setGridOffset(value)
    }

    const setNewEngineGridSize = (value: number | null)  => {
        setEngineGridSize(value)
        if (value && value > 1)
            setGridSize(value)
    }

    const setNewEngineZoom = (value: number | null)  => {
        setEngineZoom(value)
        if (value)
            setZoom(value)
    }

    const [engine, setDiagramEdit] = useDiagramEngine(edit, gridOffset, setNewEngineGridOffset, gridSize, setNewEngineGridSize, zoom, setNewEngineZoom)

    const classes = useStyles({ gridOffset, gridSize, showGrid, edit, zoom });
/*
    useEffect(() => {
        if (plcDiagram) {
            let parsedModel: any
            try {
                parsedModel = JSON.parse(plcDiagram)
            } catch (e) {
            }
            if (parsedModel) {
                engine.getModel().deserializeModel(parsedModel, engine)
                engine.repaintCanvas()
                engine.zoomToFit()
            }
        } else {
            engine.setModel(new DiagramModel())
            engine.repaintCanvas()
        }
    }, [plcDiagram, engine])
*/    
    useEffect(() => {
        let useGridSize = snapToGrid ? gridSize : 1
        if (useGridSize !== engineGridSize) {
            engine.getModel().setGridSize(useGridSize)
        }
    }, [engine, gridSize, snapToGrid, engineGridSize])
    useEffect(() => {
        if (edit && editShowGrid)
            setShowGrid(true)
        else
            setShowGrid(false)
    }, [engine, showGrid, edit, editShowGrid])
    useEffect(() => {
        if (zoom !== lastZoom) {
            setLastZoom(zoom)
            if (zoom !== engineZoom)
                engine.getModel().setZoomLevel(zoom * 100)
        }
    }, [engine, zoom, lastZoom, engineZoom])
    useEffect(() => {
        setDiagramEdit(edit)
        engine.getModel().setLocked(!edit)
        for (let node of engine.getModel().getNodes()) {
            if (node instanceof TSCustomNodeModel) {
                node.setEdit(edit)
            }
        }
    }, [engine, edit, setDiagramEdit])
    return (
        <div>
            {edit ? (
                <Box
                    display="flex"
                    flexDirection="row"
                    justifyContent="space-evenly"
                    alignContent="flex-end"
                    width="75%"
                    className={classes.toolBar}
                >
                    <Tooltip title="Close toolbar" >
                        <IconButton
                            size="small"
                            onClick={(ev) => setEdit(false)}
                            {...props}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Tooltip>
                    <Button
                        color="primary"
                        onClick={() => {
                                for (let node of engine.getModel().getNodes()) {
                                    if (node instanceof TSCustomNodeModel) {
                                        node.setEdit(false)
                                    }
                                }
                                let sModel = JSON.stringify(
                                engine.getModel().serialize())
                                for (let node of engine.getModel().getNodes()) {
                                    if (node instanceof TSCustomNodeModel) {
                                        node.setEdit(edit)
                                    }
                                }
                            //localStorage.setItem("plcDiagram", sModel);
                            setPlcDiagram(sModel)
                        }}
                    >
                        Save
                    </Button>
                    <Button
                        color="primary"
                        onClick={async () => {
                            engine
                                .getModel()
                                .deserializeModel(
                                    JSON.parse(plcDiagram),
                                    engine
                                );
                            engine.repaintCanvas();
                            //engine.zoomToFit();
                        }}
                    >
                        Load
                    </Button>
                    <Button
                        color="primary"
                        onClick={async () => {
                            engine.setModel(new DiagramModel())
                            engine.repaintCanvas();
                            //engine.zoomToFit();
                        }}
                    >
                        Clear
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            const node1 = new TSCustomNodeModel({
                                plcPath: '$(GM_BASE).IO.DOut.T_QM3',
                                color: "rgb(192,255,255)",
                            });
                            node1.setPosition(150, 150);
                            engine.getModel().addAll(node1);
                            engine.repaintCanvas();
                        }}
                    >
                        Add
                    </Button>
                    <Button
                        color="primary"
                        onClick={() => {
                            engine.getModel().setOffset(0, 0);
                            engine.getModel().setZoomLevel(100);
                            engine.repaintCanvas();
                        }}
                    >
                        Center
                    </Button>
                    <MyCheckBox
                        color="primary"
                        checked={editShowGrid}
                        setChecked={(checked) =>
                            setEditShowGrid(checked)
                        }
                        label="Show grid"
                    />
                    <MyCheckBox
                        color="primary"
                        checked={snapToGrid}
                        setChecked={(checked) =>
                            setSnapToGrid(checked)
                        }
                        label="Snap to grid"
                    />
                    <TextField
                        label="Grid size"
                        type="number"
                        value={gridSize.toString()}
                        onChange={(event) => {
                            const value = parseInt(event?.target?.value);
                            setGridSize(value)
                        }}
                        placeholder="Grid size"
                        margin="normal"
                        InputProps={{ disableUnderline: true }}
                        inputProps={{
                            min: 5, max: 100,
                            style: {
                                border: "solid 1px black",
                                borderRadius: "5px",
                                width: "75px",
                                padding: "1px 1px 1px 3px",
                            },
                        }}
                    />
                    <TextField
                        label="Zoom"
                        type="number"
                        value={(zoom * 100).toFixed(0)}
                        onChange={(event) => {
                            const value = parseInt(event?.target?.value) / 100;
                            setZoom(value)
                        }}
                        placeholder="Zoom level"
                        margin="normal"
                        InputProps={{ disableUnderline: true }}
                        inputProps={{
                            min: 10, max: 1000,
                            style: {
                                border: "solid 1px black",
                                borderRadius: "5px",
                                width: "75px",
                                padding: "1px 1px 1px 3px",
                            },
                        }}
                    />
                </Box>
            ) : (
                    <Tooltip title="Edit diagram">
                        <IconButton
                            size="small"
                            onClick={(ev) => setEdit(true)}
                            {...props}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                )}
            <PlcDiagram classes={classes} engine={engine} height={props.height} />
        </div>
    );
};
