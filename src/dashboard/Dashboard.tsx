import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslate, Title } from 'react-admin'
import { PlcNumberField, PlcIcon, PlcTextField, usePlcState, AdsState, useParameter, useParameterObject, usePlcStateString } from '../PlcControl'
//import { setIntervalAsync } from 'set-interval-async/fixed'
//import { clearIntervalAsync } from 'set-interval-async'
import CancelOnIcon from '@material-ui/icons/Cancel'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import { Box, Chip, makeStyles, Tooltip } from '@material-ui/core'
import { useNotify, useVersion } from 'react-admin'
import { appInfo } from '../App'
import { PlcDiagramEditor } from '../Diagrams/PlcDiagramEditor'
import humanizeDuration from 'humanize-duration'
import { useLocale } from 'react-admin'
import { useAirUnit } from '../SetPoints'
import { useRefresh } from 'react-admin'
//import ReactJson from "react-json-view"

interface MyCheckBoxProps {
    checked: boolean
    setChecked: (checked: boolean) => void
    label: string
    color: "primary" | "secondary" | "default" | undefined
}

const AlarmIndicator = ({ path, state }: any) => {
    return <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly" alignItems="center" style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
        <CheckCircleIcon style={{ color: state ? "red" : "green" }} />
        <p style={{ marginLeft: "0.5em", fontSize: "75% " }} >{path}</p>
    </Box>
}

export const MyCheckBox = (props: MyCheckBoxProps) => {
    return <FormControlLabel
        control={
            <Checkbox
                checked={props.checked}
                onChange={event => props.setChecked(event.target.checked)}
                color={props.color ? props.color : "secondary"}
            />
        }
        label={props.label}
    />
}
/*
export const CheckBoxStyleColor = ({ checked, setChecked, label, color, style }: any) => {
    return <FormControlLabel
        control={
            <Checkbox
                checked={checked}
                onChange={event => setChecked(event.target.checked)}
                style={{ ...style, color }}
            />
        }
        label={label}
    />
}
*/
export class CheckBoxStyleColor extends React.Component<{ checked: any, setChecked: any, label: any, color: any, style?: any }>{
    render() {
        return <FormControlLabel
            control={
                <Checkbox
                    checked={this.props.checked}
                    onChange={event => this.props.setChecked(event.target.checked)}
                    style={{ ...this.props.style, color: this.props.color }}
                />
            }
            label={this.props.label}
        />
    }
}

const useStyles = makeStyles({
    root: {
        //background: '#fcfeff',
        border: 0,
        borderRadius: 3,
        //boxShadow: '0 3px 5px 2px darkgray',
        //color: 'white',
        //height: 48,
        padding: '0 30px',
    },
})

export default () => {
    let [aInErrors, setAInErrors] = useState([] as string[])
    const [dInObject,] = useParameterObject('$(GM_BASE).IO.DIn', {} as { [key: string]: boolean})
    const [dOutObject,] = useParameterObject('$(GM_BASE).IO.DOut', {} as { [key: string]: boolean})
    const [aInObject,] = useParameterObject('$(GM_BASE).IO.AIn', {} as { [key: string]: number})
    const [aOutObject,] = useParameterObject('$(GM_BASE).IO.AOut', {} as { [key: string]: number})
    const classes = useStyles()
    const translate = useTranslate()
    const [plcState] = usePlcState()
    const plcStateString = usePlcStateString()
    const notify = useNotify()
    const version = useVersion()
    const refresh = useRefresh()
    const [fireDamperUsed] = useParameter('$(GM_BASE).System.Operation.FireDamperUsed', false)
    const [systemUpTime] = useParameter("Globals.SystemUpTime", 0)
    const [systemUpTimeString, setSystemUpTimeString] = useState('')
    const [components] = useParameter('Globals.Components', '')
    const [alarms] = useParameterObject('$(GM_BASE).Alarm.Active', {} as any)
    const [alarmList, setAlarmList] = useState([] as { path: string, state: boolean }[])
    const [showDiagram, setShowDiagram] = useState(false)
    const location = useLocale()
    const [unitSupplyAir, supplyAirDecimals] = useAirUnit('Supply')
    const [unitExtractAir, extractAirDecimals] = useAirUnit('Extract')
    useEffect(() => {
        refresh()
    }, [refresh])
    useEffect(() => {
        const items = aInObject ? Object.entries(aInObject).filter(entry => entry[0].indexOf('_Error') > 0).map(item => `${item[0].split('_E')[0].replace('_', '.')}`) : undefined
        if (items)
            setAInErrors(items)
    }, [aInObject, setAInErrors])
    useEffect(() => {
        setSystemUpTimeString(humanizeDuration(systemUpTime * 1000, { language: location, delimiter: ' ', units: ["d", "h", "s"], maxDecimalPoints: 2 } ))
    }, [systemUpTime, setSystemUpTimeString, location])
    useEffect(() => {
        if (plcState !== AdsState.Invalid && plcState !== AdsState.Run && plcState !== AdsState.Stop)
            notify('Invalid PLC state (RUN or STOP required)', 'warning')
    }, [plcState, notify, version])
    useEffect(() => {
        const list = []
        if (Object.keys(alarms).length) {
            for (let kind in alarms) {
                for (let al in alarms[kind]) {
                    let state = alarms[kind][al]
                    list.push({ path: kind + '.' + al, state })
                }
            }
            setAlarmList(list)
        }
    }, [alarms])
    const unitAIN = ["°C", "°C", "°C", "°C", "°C", "°C", "°C", "°C", "Pa", "Pa", "Pa", "Pa", "Pa", "l/s", "l/s"]
    const decimalsAIN = [1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0]
    const unitAOUT = ["%", "%", "%", "%", "%"]
    const decimalsAOUT = [0, 0, 0, 0, 0]
    return (
        <Box display="flex" flexDirection="column" justifyContent="spaceEvenly">
            <Title title={translate('custom.title') + ' ' + appInfo.hostName + " / " + translate('custom.dashboard')} />
            <Card className={classes.root} >
                <CardHeader title={translate("custom.operation")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" >
                        <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
                            <TextField
                                label="PLC"
                                multiline
                                rowsMax={4}
                                value={plcStateString}
                                InputLabelProps={{ style: { fontSize: '110%' } }}
                                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
                            />
                        </div>
                        <PlcTextField plcVar="$(GM_BASE).System.Operation.SystemName" label={translate("custom.systemName")} />
                        {/*}<PlcTextField plcVar="Globals.Components" label={translate("custom.components")} multiline />{*/}
                        <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" style={{ margin: '3px', border: 'solid 2px lightgray', borderRadius: '5px', padding: '5x 5px 5px 5px',  }} >
                            <p style={{ fontSize: '75%', color: 'gray', margin: '3px', }} >{translate("custom.components")}</p>
                            <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="flex-start" alignItems="center" style={{ margin: '3px', padding: '5x 5px 5px 5px',  }} >
                                { components ? components.split(',').map((item, index) => <Chip key={index.toString()} label={ item } style={{ margin: '1em' }} /> ) : null }
                            </Box>
                        </Box>

                        <PlcTextField plcVar="$(GM_BASE).System.Operation.State" label={translate("custom.systemState")} />
                        <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
                            <TextField
                                label={ translate("custom.systemUpTime") }
                                multiline
                                rowsMax={10}
                                value={ systemUpTimeString }
                                InputLabelProps={{ style: { fontSize: '110%' } }}
                                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
                                style={{ width: '15em', }}
                            />
                        </div>
                        <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).System.Operation.EN"
                                label="Operation" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DIn.Auto"
                                label="AUTO" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DIn.Hand"
                                label="HAND" inverted={false} colorFalse="gray" colorTrue="orange" style={{}} />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            { (components.indexOf('GM_OPT_CTH') >= 0) ? <span>
                <Card className={classes.root} >
                    <CardHeader title={translate("custom.chalmersStatus")} />
                    <CardContent>
                        <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Control.SP" label={translate("custom.temperatureSP")} template={ '{0} °C' } />
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Control.PV" label={translate("custom.temperaturePV")} template={ '{0} °C' } />
                        </Box>
                        <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP" decimals={ supplyAirDecimals } label={translate("custom.supplySP")} template={ `{0} ${ unitSupplyAir }` } />
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.SupplyAir.Control.PV" decimals={ supplyAirDecimals } label={translate("custom.supplyPV")} template={ `{0} ${ unitSupplyAir }` } />
                        </Box>
                        <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP" decimals={ extractAirDecimals } label={translate("custom.extractSP")} template={ `{0} ${ unitExtractAir }` } />
                            <PlcNumberField plcVar="$(GM_BASE).Regulation.ExtractAir.Control.PV" decimals={ extractAirDecimals } label={translate("custom.extractPV")} template={ `{0} ${ unitExtractAir }` } />
                        </Box>
                    </CardContent>
                </Card>
                <p></p>
            </span> : null }
            <Card className={classes.root} >
                <CardHeader title={translate("custom.controlStatus")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Control.SP" label={translate("custom.temperatureSP")} template={ '{0} °C' } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Control.CSP" label={translate("custom.temperatureCSP")} template={ '{0} °C' } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Control.PV" label={translate("custom.temperaturePV")} template={ '{0} °C' } />
                    </Box>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.SupplyAir.Control.SP" decimals={ supplyAirDecimals } label={translate("custom.supplySP")} template={ `{0} ${ unitSupplyAir }` } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.SupplyAir.Control.CSP" decimals={supplyAirDecimals} label={translate("custom.supplyCSP")} template={ '{0} Pa' } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.SupplyAir.Control.PV" decimals={ supplyAirDecimals } label={translate("custom.supplyPV")} template={ `{0} ${ unitSupplyAir }` } />
                    </Box>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.ExtractAir.Control.SP" decimals={ extractAirDecimals } label={translate("custom.extractSP")} template={ `{0} ${ unitExtractAir }` } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.ExtractAir.Control.CSP" decimals={extractAirDecimals} label={translate("custom.extractCSP")} template={ '{0} Pa' } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.ExtractAir.Control.PV" decimals={ extractAirDecimals } label={translate("custom.extractPV")} template={ `{0} ${ unitExtractAir }` } />
                    </Box>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        <PlcTextField plcVar="$(GM_BASE).Regulation.CurrentTemperatureCompensationSource" label={translate("custom.regulationCompensationSource")} />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.CompensationTemperature" label={translate("custom.compensationTemperature")} template={ '{0} °C' } />
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.supplyAir")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly" alignItems="center" >
                        <PlcNumberField plcVar="$(GM_BASE).IO.AIn.T_BT2" decimals={1} onScale={(value: number) => value} label={translate("custom.outdoorAirTemperature")} template={ '{0} °C' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AOut.T_GQ1" onScale={(value: number) => value * 100} label={translate("custom.fanSpeedPercent")} decimals={0} template={ '{0} %' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AOut.F_QN1" onScale={(value: number) => value * 100} label={translate("custom.heatExchangerPercentOpen")} decimals={0} template={ '{0} %' } />
                        <PlcNumberField plcVar="$(GM_BASE).Regulation.Temperature.Efficiency" onScale={(value: number) => value * 100} label={translate("custom.efficiency")} decimals={0} template={ '{0} %' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AOut.H_QN1" onScale={(value: number) => value * 100} label={translate("custom.heatingValvepercentOpen")} decimals={0} template={ '{0} %' } />
                        <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DOut.H_GP1"
                            label="H.GP1" inverted={false} colorFalse="gray" colorTrue="orange" style={{}} />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AOut.C_QN1" onScale={(value: number) => value * 100} label={translate("custom.coolingValvePercentOpen")} decimals={0} template={ '{0} %' } />
                        <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DOut.C_GP1"
                            label="C.GP1" inverted={false} colorFalse="gray" colorTrue="blue" style={{}} />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AIn.T_BT1" decimals={1} onScale={(value: number) => value} label={translate("custom.supplyAirTemperature")} template={ '{0} °C' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AIn.T_BF1" decimals={0} onScale={(value: number) => value} label={translate("custom.supplyAirFlow")} template={ '{0} l/s' } />
                        <PlcNumberField plcVar="$(GM_IO).ModBusRTU.T_BF1" decimals={0} label={translate("custom.supplyAirPressure")} template={ '{0} Pa' } />
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.extractAir")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly" alignItems="flex-start" >
                        <PlcNumberField plcVar="$(GM_BASE).IO.AIn.F_BT1" decimals={1} onScale={(value: number) => value} label={translate("custom.extractAirTemperature")} template={ '{0} °C' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AOut.F_GQ1" onScale={(value: number) => value * 100} label={translate("custom.fanSpeedPercent")} decimals={0} template={ '{0} %' } />
                        <PlcNumberField plcVar="$(GM_BASE).IO.AIn.F_BF1" decimals={0} onScale={(value: number) => value} label={translate("custom.extractAirFlow")} template={ '{0} l/s' } />
                        <PlcNumberField plcVar="$(GM_IO).ModBusRTU.F_BF1" decimals={0} label={translate("custom.extractAirPressure")} template={ '{0} Pa' } />
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.dampers")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="spaceEvenly">
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DOut.T_QM3"
                                label="T.QM3" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                        </Box>

                        <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="spaceEvenly">
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DOut.F_QM1"
                                label="F.QM1" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                        </Box>

                        {fireDamperUsed && <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="spaceEvenly">
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DOut.F_QM2"
                                label="F.QM2" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DIn.F_QM2_Closed"
                                label="F.QM2 Closed" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                            <PlcIcon iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar="$(GM_BASE).IO.DIn.F_QM2_Open"
                                label="F.QM2 Open" inverted={false} colorFalse="gray" colorTrue="green" style={{}} />
                        </Box>}

                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.alarm")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                        {alarmList ? <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="spaceEvenly">
                            {alarmList.map((item, index) => <Box key={index.toString()} display="flex" flexWrap="nowrap" flexDirection="row" alignItems="center" justifyContent="spaceEvenly" style={{ marginRight: "3px" }}>
                                <AlarmIndicator path={item.path} state={item.state} />
                            </Box>)}
                        </Box> : null}
                    </Box>
                </CardContent>
            </Card >
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.sensorStatus")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        { aInErrors.map((item, index) => <PlcIcon key={index.toString()} iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar={ `$(GM_BASE).IO.AIn.${ item.replace('.', '_') }_Error` } label={ item } inverted={true} colorFalse="red" colorTrue="green" />) }
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.analogInputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        { Object.entries(aInObject).map((item, index) => (typeof item[1] === 'number') ? <PlcNumberField key={index.toString()} plcVar={ `$(GM_BASE).IO.AIn.${ item[0] }` } label={ item[0] } decimals={ decimalsAIN[index] } template={ `{0} ${ unitAIN[index] }` } /> : null) }
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.analogOutputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        { Object.entries(aOutObject).map((item, index) => (typeof item[1] === 'number') ? <PlcNumberField key={index.toString()} plcVar={ `$(GM_BASE).IO.AOut.${ item[0] }` } label={ item[0] } decimals={ decimalsAOUT[index] } template={ `{0} ${ unitAOUT[index] }` } onScale={(value: number) => value * 100} /> : null) }
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.digitalInputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        { Object.entries(dInObject).map((item, index) => (typeof item[1] === 'boolean') ? <PlcIcon key={index.toString()} iconTrue={<CancelOnIcon />} iconFalse={<CheckCircleIcon />} plcVar={ `$(GM_BASE).IO.DIn.${ item[0] }` } label={ item[0] } inverted={true} colorFalse="green" colorTrue="gray" /> : null) }
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.digitalOutputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        { Object.entries(dOutObject).map((item, index) => (typeof item[1] === 'boolean') ? <PlcIcon key={index.toString()} iconTrue={<CancelOnIcon />} iconFalse={<CheckCircleIcon />} plcVar={ `$(GM_BASE).IO.DOut.${ item[0] }` } label={ item[0] } inverted={true} colorFalse="green" colorTrue="gray" /> : null) }
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.diagram")} />
                <CardContent>
                    <Tooltip title="Show diagram">
                        <div>
                            <MyCheckBox
                                color="primary"
                                checked={showDiagram}
                                setChecked={(checked) =>
                                    setShowDiagram(checked)
                                }
                                label="Show diagram"
                            />
                        </div>
                    </Tooltip>
                    {showDiagram ? (<PlcDiagramEditor height={600} />
                    ) : null}
                </CardContent>
            </Card>
            <p></p>
        </Box>
    )
}
