import React, { useEffect, useState } from 'react'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardHeader from '@material-ui/core/CardHeader'
import TextField from '@material-ui/core/TextField'
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { useTranslate, Title } from 'react-admin'
import { PlcNumberField, PlcIcon, PlcTextField, usePlcState, AdsState, useParameter, useParameterObject, usePlcStateString, PlcCheckBox } from '../PlcControl'
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
import { getLocalStorageItem, getLocalStorageItemBoolean } from '../configuration/Configuration'
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
    const [dInObject,] = useParameterObject('$(GM_BASE).IO.DIn', {} as { [key: string]: boolean })
    const [dOutObject,] = useParameterObject('$(GM_BASE).IO.DOut', {} as { [key: string]: boolean })
    const [aInObject,] = useParameterObject('$(GM_BASE).IO.AIn', {} as { [key: string]: number })
    const [aOutObject,] = useParameterObject('$(GM_BASE).IO.AOut', {} as { [key: string]: number })
    const classes = useStyles()
    const translate = useTranslate()
    const [plcState] = usePlcState()
    const plcStateString = usePlcStateString()
    const notify = useNotify()
    const version = useVersion()
    const refresh = useRefresh()
    const [systemUpTime] = useParameter("Globals.SystemUpTime", 0)
    const [systemUpTimeString, setSystemUpTimeString] = useState('')
    const [components] = useParameter('Globals.Components', '')
    const location = useLocale()
    const [linkToWebPort] = useState(getLocalStorageItem("webPortLink", 'http://localhost:8090'))
    const [openInNewTab] = useState(getLocalStorageItemBoolean("webPortLinkNewTab", false))
    useEffect(() => {
        refresh()
    }, [refresh])
    useEffect(() => {
        const items = aInObject ? Object.entries(aInObject).filter(entry => entry[0].indexOf('_Error') > 0).map(item => `${item[0].split('_E')[0].replace('_', '.')}`) : undefined
        if (items)
            setAInErrors(items)
    }, [aInObject, setAInErrors])
    useEffect(() => {
        setSystemUpTimeString(humanizeDuration(systemUpTime * 1000, { language: location, delimiter: ' ', units: ["d", "h", "m", "s"], maxDecimalPoints: 2 }))
    }, [systemUpTime, setSystemUpTimeString, location])
    useEffect(() => {
        if (plcState !== AdsState.Invalid && plcState !== AdsState.Run && plcState !== AdsState.Stop)
            notify('Invalid PLC state (RUN or STOP required)', 'warning')
    }, [plcState, notify, version])
    const unitAIN = ["??C", "??C", "??C", "??C", "??C", "??C", "??C", "??C", "Pa", "Pa", "Pa", "Pa", "Pa", "l/s", "l/s"]
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
                        <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="flex-start" alignItems="flex-start" >
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
                            <PlcTextField plcVar="GlobalSettings.PlcVersion" label={translate("custom.plcVersion")} />
                        </Box>
                        {/*}<PlcTextField plcVar="Globals.Components" label={translate("custom.components")} multiline />{*/}
                        <Box display="flex" flexWrap="wrap" flexDirection="column" justifyContent="flex-start" alignItems="flex-start" style={{ margin: '3px', border: 'solid 2px lightgray', borderRadius: '5px', padding: '5x 5px 5px 5px', }} >
                            <p style={{ fontSize: '75%', color: 'gray', margin: '3px', }} >{translate("custom.components")}</p>
                            <Box display="flex" flexWrap="wrap" flexDirection="row" justifyContent="flex-start" alignItems="center" style={{ margin: '3px', padding: '5x 5px 5px 5px', }} >
                                {components ? components.split(',').map((item, index) => <Chip key={index.toString()} label={item} style={{ margin: '1em' }} />) : null}
                            </Box>
                        </Box>

                        <PlcTextField plcVar="$(GM_BASE).System.Operation.State" label={translate("custom.systemState")} />
                        <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
                            <TextField
                                label={translate("custom.systemUpTime")}
                                multiline
                                rowsMax={10}
                                value={systemUpTimeString}
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
                        <a href={linkToWebPort} target={openInNewTab ? "_blank" : "_self"}>{translate("custom.linkToWebPort")}</a>
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.sensorStatus")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        {aInErrors.map((item, index) => <PlcIcon key={index.toString()} iconTrue={<CheckCircleIcon />} iconFalse={<CancelOnIcon />} plcVar={`$(GM_BASE).IO.AIn.${item.replace('.', '_')}_Error`} label={item} inverted={true} colorFalse="red" colorTrue="green" />)}
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.analogInputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        {Object.entries(aInObject).map((item, index) => (typeof item[1] === 'number') ? <PlcNumberField key={index.toString()} plcVar={`$(GM_BASE).IO.AIn.${item[0]}`} label={item[0]} decimals={decimalsAIN[index]} template={`{0} ${unitAIN[index]}`} /> : null)}
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.analogOutputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        {Object.entries(aOutObject).map((item, index) => (typeof item[1] === 'number') ? <PlcNumberField key={index.toString()} plcVar={`$(GM_BASE).IO.AOut.${item[0]}`} label={item[0]} decimals={decimalsAOUT[index]} template={`{0} ${unitAOUT[index]}`} onScale={(value: number) => value * 100} /> : null)}
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.digitalInputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        {Object.entries(dInObject).map((item, index) => (typeof item[1] === 'boolean') ? <PlcIcon key={index.toString()} iconTrue={<CancelOnIcon />} iconFalse={<CheckCircleIcon />} plcVar={`$(GM_BASE).IO.DIn.${item[0]}`} label={item[0]} inverted={true} colorFalse="green" colorTrue="gray" /> : null)}
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card className={classes.root} >
                <CardHeader title={translate("custom.digitalOutputs")} />
                <CardContent>
                    <Box display="flex" flexWrap="wrap" flex-direction="row" justifyContent="spaceEvenly">
                        {Object.entries(dOutObject).map((item, index) => (typeof item[1] === 'boolean') ? <PlcIcon key={index.toString()} iconTrue={<CancelOnIcon />} iconFalse={<CheckCircleIcon />} plcVar={`$(GM_BASE).IO.DOut.${item[0]}`} label={item[0]} inverted={true} colorFalse="green" colorTrue="gray" /> : null)}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    )
}
