import React, { useEffect, useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import SetPointIcon from '@material-ui/icons/PermDataSetting';
import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import { useTranslate, Title, } from "react-admin";
import { Button, Card, CardContent, CardHeader, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

const EditSetPointAdjustmentDialog = (props: { kind: string, plcPath: string }) => {
    const translate = useTranslate()
    const [open, setOpen] = React.useState(false);
    return <>
        <Button onClick={ev => setOpen(true)} style={{ maxHeight: '30px', minHeight: '30px' }}>
            {translate("Set Point Adjustment")}
        </Button>
        <Dialog
            open={open}
            onClose={() => setOpen(false)}>
            <DialogTitle>
                {translate("custom.dialogEditCurve") + ` ${props.kind}`}
            </DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <EditSetPointAdjustment plcPath={props.plcPath} />
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={async () => {
                    setOpen(false)
                }} autoFocus>
                    {translate("custom.close")}
                </Button>
            </DialogActions>
        </Dialog>
    </>
}

const EditSetPointAdjustment = (props: { plcPath: string }) => {
    const [unitAir, airDecimals] = useAirUnit((props.plcPath.indexOf('Temperature') >= 0) ? 'Temperature' : (props.plcPath.indexOf('Supply') >= 0) ? 'Supply' : 'Extract', true)
    return <Card>
        <CardContent>
            <Box display="flex" flexDirection="column" >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) =>
                    <Box display="flex" flexDirection="row" >
                        <PlcNumberEdit
                            plcVar={props.plcPath + ".X" + value}
                            label={`X${ value }`}
                            decimals={1}
                            unit='°C'
                            step={0.1}
                            writeOnChange={true} />
                        <PlcNumberEdit
                            plcVar={props.plcPath + ".Y" + value}
                            label={"Y" + value}
                            decimals={airDecimals}
                            unit={unitAir}
                            step={0.1}
                            writeOnChange={true} />
                    </Box>
                )
                }
            </Box>
        </CardContent>
    </Card>
}

export const useAirUnit = (kind: 'Supply' | 'Extract' | 'Temperature', isSetPoint: boolean) => {
    const [controlModeAir] = useParameter((kind !== 'Temperature') ? `$(GM_BASE).Regulation.${kind}Air.ControlMode` : `$(GM_BASE).Regulation.SupplyAir.ControlMode`, '')
    const [unitAir, setUnitAir] = useState('')
    const [decimals, setDecimals] = useState(1)
    useEffect(() => {
        if (kind === 'Temperature') {
            setUnitAir('°C')
            setDecimals(1)
        } else {
            if (controlModeAir === 'Pressure') {
                setUnitAir('Pa')
                setDecimals(0)
            }
            if (controlModeAir === 'Flow' || controlModeAir === 'SlaveFlow') {
                setUnitAir('l/s')
                setDecimals(0)
            }
            if (controlModeAir === 'Const') {
                setUnitAir(isSetPoint ? '%' : 'l/s')
                setDecimals(0)
            }
        }
    }, [controlModeAir, setUnitAir, kind, isSetPoint])
    return [unitAir, decimals] as const
}

export default (props: { classes: any; translate?: any; }) => {

    const classes = useStyles()
    const translate = useTranslate()
    const refresh = useRefresh()
    const [controlModeSupplyAir, setControlModeSupplyAir] = useParameter('$(GM_BASE).Regulation.SupplyAir.ControlMode', '')
    const [controlModeExtractAir, setControlModeExtractAir] = useParameter('$(GM_BASE).Regulation.ExtractAir.ControlMode', '')
    const [unitSupplyAir, supplyAirDecimals] = useAirUnit('Supply', true)
    const [unitExtractAir, extractAirDecimals] = useAirUnit('Extract', true)
    const [applyAbsoluteSetPointCurves, setApplyAbsoluteSetPointCurves] = useParameter('$(GM_BASE).Regulation.ApplyAbsoluteSetPointCurves', '')
    const [open, setOpen] = React.useState(false);

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
                            <CardHeader title={translate("custom.setPointAndControlModes", 2)} />
                            <Box display="flex" flexDirection="column">
                                <Box display="flex" flexDirection="row" border={1} borderColor="lightgray" borderRadius={10} alignItems="center" padding={0.5}>
                                    <PlcNumberEdit
                                        plcVar="$(GM_BASE).Regulation.Temperature.Control.SP"
                                        label={translate("custom.temperatureSetPoint")}
                                        decimals={1}
                                        unit="°C"
                                        step={0.5}
                                        writeOnChange={true} />
                                    <EditSetPointAdjustmentDialog kind={translate("custom.temperature")} plcPath={"$(GM_BASE).Regulation.Temperature.SetPointAdjustment.Curve"} />
                                </Box>
                                <p />
                                <Box display="flex" flexDirection="column">
                                    <Box display="flex" flexDirection="row" border={1} borderColor="lightgray" borderRadius={10} alignItems="center" padding={0.5}>
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP"
                                            label={translate("custom.supplySP")}
                                            decimals={supplyAirDecimals}
                                            min={0}
                                            unit={unitSupplyAir}
                                            writeOnChange={true} />
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP_HighSpeed"
                                            label={translate("custom.supplySP_HighSpeed")}
                                            decimals={supplyAirDecimals}
                                            min={0}
                                            unit={unitSupplyAir}
                                            writeOnChange={true} />
                                        <EditSetPointAdjustmentDialog kind={translate("custom.supplyAir")} plcPath={"$(GM_BASE).Regulation.SupplyAir.SetPointAdjustment.Curve"} />
                                    </Box>
                                    <p />
                                    <Box display="flex" flexDirection="row" border={1} borderColor="lightgray" borderRadius={10} alignItems="center" padding={0.5}>
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP"
                                            label={translate("custom.extractSP")}
                                            decimals={extractAirDecimals}
                                            min={0}
                                            unit={unitExtractAir}
                                            writeOnChange={true} />
                                        <PlcNumberEdit
                                            plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP_HighSpeed"
                                            label={translate("custom.extractSP_HighSpeed")}
                                            decimals={extractAirDecimals}
                                            min={0}
                                            unit={unitExtractAir}
                                            writeOnChange={true} />
                                        <EditSetPointAdjustmentDialog kind={translate("custom.extractAir")} plcPath={"$(GM_BASE).Regulation.ExtractAir.SetPointAdjustment.Curve"} />
                                    </Box>
                                </Box>
                            </Box>
                            <p></p>
                            <Box display="flex" flexDirection="row" justifyContent="space-between">
                                <Box display="flex" flexDirection="row" border={1} borderColor="lightgray" borderRadius={10} alignItems="center" padding={0.5}>
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
                                <Button onClick={() => setOpen(true)}>{translate('custom.applyAbsoluteAdjustment')}</Button>
                                <Dialog
                                    open={open}
                                    onClose={() => setOpen(false)}>
                                    <DialogTitle>
                                        {translate("custom.askMakeAbsolute")}
                                    </DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            {translate("custom.makeAbsoluteDescription")}
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={() => setOpen(false)}>{translate("custom.no")}</Button>
                                        <Button onClick={async () => {
                                            setApplyAbsoluteSetPointCurves(applyAbsoluteSetPointCurves + 1)
                                            setOpen(false)
                                            await new Promise(res => setTimeout(res, 2000))
                                            refresh()
                                        }} autoFocus>
                                            {translate("custom.yes")}
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Paper>
        </main >
    );
}
