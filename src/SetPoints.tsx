import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import SetPointIcon from '@material-ui/icons/BrightnessAuto';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { useTranslate, Title, } from "react-admin";
import { Card, CardContent, CardHeader, FormControl, InputLabel, MenuItem, Select, TextField, } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import { PlcNumberEdit, useParameter } from './PlcControl';
import { appInfo } from './App';
import { useRefresh } from 'react-admin';

const useStyles = makeStyles((theme) => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
            width: 'auto',
            marginLeft: 'auto',
            marginRight: 'auto',
        },
    },
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `${theme.spacing(2)}px ${theme.spacing(3)}px ${theme.spacing(3)}px`,
    } as any,
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
}));

const Collapse = ({ label, collapsed, children }: any) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);
    const translate = useTranslate()

    return (
        <>
            <button style={{ display: "block", width: "100%" }}
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                {isCollapsed ? translate('Show') : translate('Hide')} {label}
            </button>
            <div style={{ display: isCollapsed ? "none" : "block" }}>
                {children}
            </div>
        </>
    );
};

const EditSetPointAdjustment = (props: { plcPath: string }) => {
    const translate = useTranslate()
    const [open, setOpen] = useState(true)
    return <Collapse collapsed={true} label={translate("Set Point Adjustment")}><Card>
        <CardContent>
            <Box display="flex" flexDirection="row" >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) =>
                    <Box display="flex" flexDirection="column" >
                        <PlcNumberEdit
                            plcVar={props.plcPath + ".Y" + value}
                            label={"Y" + value}
                            decimals={1}
                            unit="°C"
                            step={0.1}
                            writeOnChange={true} />
                        <PlcNumberEdit
                            plcVar={props.plcPath + ".X" + value}
                            label={"X" + value}
                            decimals={1}
                            unit="°C"
                            step={0.1}
                            writeOnChange={true} />
                    </Box>
                )
                }
            </Box>
        </CardContent>
    </Card></Collapse>
}

export const useAirUnit = (kind: 'Supply' | 'Extract') => {
    const [controlModeAir] = useParameter(`$(GM_BASE).Regulation.${kind}Air.ControlMode`, '')
    const [unitAir, setUnitAir] = useState('')
    const [decimals, setDecimals] = useState(1)
    useEffect(() => {
        if (controlModeAir === 'Pressure') {
            setUnitAir('Pa')
            setDecimals(0)
        }
        if (controlModeAir === 'Flow' || controlModeAir === 'SlaveFlow')
            setUnitAir('m³/h')
        if (controlModeAir === 'Const')
            setUnitAir('V')
    }, [controlModeAir, setUnitAir])
    return [unitAir, decimals] as const
}

export default (props: { classes: any; translate?: any; }) => {

    const classes = useStyles()
    const translate = useTranslate()
    const refresh = useRefresh()
    const [controlModeSupplyAir, setControlModeSupplyAir] = useParameter('$(GM_BASE).Regulation.SupplyAir.ControlMode', '')
    const [controlModeExtractAir, setControlModeExtractAir] = useParameter('$(GM_BASE).Regulation.ExtractAir.ControlMode', '')
    const [unitSupplyAir, supplyAirDecimals] = useAirUnit('Supply')
    const [unitExtractAir, extractAirDecimals] = useAirUnit('Extract')

    useEffect(() => {
        refresh()
    }, [refresh])
    return (
        <main className={classes.main}>
            <Title title={translate('custom.title') + ' ' + appInfo.hostName + " / " + translate('custom.setPoint', 2)} />
            <CssBaseline />
            <Paper className={classes.paper}>
                <Avatar className={classes.avatar}>
                    <SetPointIcon />
                </Avatar>
                <Box display="flex" flexDirection="column" >
                    <Card>
                        <CardContent>
                            <CardHeader title={translate("custom.setPoint", 2)} />
                            <Box display="flex" flexDirection="column" >
                                <PlcNumberEdit
                                    plcVar="$(GM_BASE).Regulation.Temperature.Control.SP"
                                    label={translate("custom.temperatureSetPoint")}
                                    decimals={1}
                                    unit="°C"
                                    step={0.5}
                                    writeOnChange={true} />
                                <EditSetPointAdjustment plcPath={"$(GM_BASE).Regulation.Temperature.SetPointAdjustment.Curve"} />
                                <p />
                                <Box display="flex" flexDirection="row">
                                    <Box display="flex" flexDirection="column">
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP"
                                            label={translate("custom.supplySP")}
                                            decimals={supplyAirDecimals}
                                            min={0}
                                            unit={unitSupplyAir}
                                            writeOnChange={true} />
                                        <EditSetPointAdjustment plcPath={"$(GM_BASE).Regulation.SupplyAir.SetPointAdjustment.Curve"} />
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP"
                                            label={translate("custom.extractSP")}
                                            decimals={extractAirDecimals}
                                            min={0}
                                            unit={unitExtractAir}
                                            writeOnChange={true} />
                                        <EditSetPointAdjustment plcPath={"$(GM_BASE).Regulation.ExtractAir.SetPointAdjustment.Curve"} />
                                    </Box>
                                    <Box display="flex" flexDirection="column">
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP_HighSpeed"
                                            label={translate("custom.supplySP_HighSpeed")}
                                            decimals={supplyAirDecimals}
                                            min={0}
                                            unit={unitSupplyAir}
                                            writeOnChange={true} />
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP_HighSpeed"
                                            label={translate("custom.extractSP_HighSpeed")}
                                            decimals={extractAirDecimals}
                                            min={0}
                                            unit={unitExtractAir}
                                            writeOnChange={true} />
                                    </Box>
                                </Box>
                            </Box>
                            <p></p>
                            <Box display="flex" flexDirection="row" >
                                <FormControl variant="outlined" /*className={classes.formControl}*/ style={{ width: 175, margin: '1em', }}  >
                                    <InputLabel>{translate("custom.controlModeSupplyAir")}</InputLabel>
                                    <Select
                                        value={controlModeSupplyAir}
                                        onChange={async ev => {
                                            setControlModeSupplyAir(ev.target.value as string)
                                            await new Promise(resolve => setTimeout(resolve, 1000))
                                            refresh()
                                        }}
                                        label={translate("custom.controlModeSupplyAir")}
                                    >
                                        <MenuItem value={'Pressure'}>Pressure</MenuItem>
                                        <MenuItem value={'Flow'}>Flow</MenuItem>
                                        <MenuItem value={'SlaveFlow'}>Slave flow</MenuItem>
                                        <MenuItem value={'Const'}>Constant</MenuItem>
                                    </Select>
                                </FormControl>
                                <p></p>
                                <FormControl variant="outlined" /*className={classes.formControl}*/ style={{ width: 175, margin: '1em', }}  >
                                    <InputLabel>{translate("custom.controlModeExtractAir")}</InputLabel>
                                    <Select
                                        value={controlModeExtractAir}
                                        onChange={async ev => {
                                            setControlModeExtractAir(ev.target.value as string)
                                            await new Promise(resolve => setTimeout(resolve, 1000))
                                            refresh()
                                        }}
                                        label={translate("custom.controlModeExtractAir")}
                                    >
                                        <MenuItem value={'Pressure'}>Pressure</MenuItem>
                                        <MenuItem value={'Flow'}>Flow</MenuItem>
                                        <MenuItem value={'SlaveFlow'}>Slave flow</MenuItem>
                                        <MenuItem value={'Const'}>Constant</MenuItem>
                                    </Select>
                                </FormControl>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>
        </main >
    );
}
