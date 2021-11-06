import React, { useState, useEffect, ReactElement, useRef } from 'react';
import Avatar from '@material-ui/core/Avatar';
import CssBaseline from '@material-ui/core/CssBaseline';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import { useTranslate, useVersion, Title, useRefresh, usePermissions, useNotify } from "react-admin";
import { CheckBoxStyleColor } from './dashboard/Dashboard'
import { Card, CardContent, CardHeader, InputAdornment, TextField, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles'
import { appInfo, appVersion, _adsClients } from './App';
import { useConfirm } from "material-ui-confirm"
import format from 'string-format'
import { clearIntervalAsync, setIntervalAsync, SetIntervalAsyncTimer } from 'set-interval-async/dynamic';
import { clearInterval } from 'timers';

const useStyles = makeStyles((theme) => ({
    main: {
        width: 'auto',
        display: 'block', // Fix IE 11 issue.
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
        [theme.breakpoints.up(400 + theme.spacing(3 * 2))]: {
            width: 400,
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
}))

export const globalSession = 'SessionID: ' + (new Date().getMilliseconds()).toString()

export const useParameter = <T extends unknown>(path: string, def: T, doRefresh: boolean = false) => {
    const version = useVersion()
    const refresh = useRefresh()
    const [value, setValue] = useState(def)
    useEffect(() => {
        (async (path) => {
            let error = false
            do {
                try {
                    let data = await _adsClients.adsDataProvider.readValue(path, globalSession, version)
                    if (data === undefined)
                        console.log(`Bad data returned from server in useParameter: ${path}`)
                    setValue(data)
                    error = false
                } catch (e) {
                    error = true
                }
            } while (error)
        })(path)
    }, [version, path, setValue])
    const writeValue = async (value: T) => {
        let result
        try {
            result = await _adsClients.adsDataProvider.write(path, value)
            setValue(value)
            if (doRefresh)
                refresh()
        } catch (e) {
        }
        return result
    }
    return [value, writeValue] as const
}

export const useParameterObject = <T extends object>(path: string, def: T, doRefresh: boolean = false) => {
    const version = useVersion()
    const refresh = useRefresh()
    const [value, setValue] = useState(def)
    useEffect(() => {
        (async (path) => {
            try {
                let data = await _adsClients.adsDataProvider.readValue(path)
                setValue(data)
            } catch (e) {
            }
        })(path)
    }, [version, path, setValue])
    const writeValue = async (value: T) => {
        let result
        try {
            result = await _adsClients.adsDataProvider.writeValue(path, value)
            setValue(await _adsClients.adsDataProvider.readValue(path))
            if (doRefresh)
                refresh()
        } catch (e) {
        }
        return result
    }
    return [value, writeValue] as const
}

export enum AdsState { Invalid = 0, Idle, Reset, Init, Start, Run, Stop, SaveConfig, LoadConfig, PowerFailure, PowerGood, Error, Shutdown, Suspend, Resume, Config, Reconfig, Maxstates }

export const usePlcState = (retry?: boolean, onRetry?: () => void) => {
    const version = useVersion()
    const [doRetry, setDoRetry] = useState(retry)
    let [plcState, setPlcState] = useState<AdsState>(AdsState.Invalid)
    const updatePlcState = (state: any) => {
        if (state) {
            if (state.error) {
                if (state.error.errorCode === '6')
                    setPlcState(AdsState.Invalid)
                else
                    setPlcState(AdsState.Invalid)
            } else
                setPlcState(state.adsStateCode as AdsState)
        }
    }
    const getPlcState = async () => {
        try {
            const state = await _adsClients.adsDataProvider.readState()
            updatePlcState(state)
        } catch (e) {
            setPlcState(AdsState.Invalid)
        }
    }
    useEffect(() => {
        getPlcState()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [version])
    useEffect(() => {
        let interval: any
        if (doRetry) {
            interval = setInterval(() => {
                onRetry?.()
                getPlcState()
            }, 5000)
        }
        getPlcState()
        return () => interval ? clearInterval(interval) : undefined
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [doRetry, onRetry])
    const writePlcState = async (state: AdsState) => {
        let result = false
        if (await _adsClients.adsWebClient.writeState('', state, 0)) {
            await getPlcState()
            result = true
        }
        return result
    }
    const updateDoRetry = (aRetry: boolean) => {
        if (aRetry !== doRetry)
            setDoRetry(aRetry)
    }
    return [plcState, writePlcState, updateDoRetry] as const
}

export const usePlcStateString = () => {
    const [plcState] = usePlcState()
    const [plcStateAsString, setPlcStateAsString] = useState('')
    useEffect(() => {
        if (plcState !== AdsState.Invalid)
            setPlcStateAsString(AdsState[plcState])
    }, [plcState])
    return plcStateAsString
}

export const useSystemState = () => {
    const version = useVersion()
    const refresh = useRefresh()
    let [systemState, setSystemState] = useState(false)
    useEffect(() => {
        const foo = async () => {
            try {
                let EN = await _adsClients.adsDataProvider.readValue('$(GM_BASE).System.Operation.EN', globalSession, version) as boolean
                setSystemState(EN)
            } catch (e) {
            }
        }
        foo()
    }, [version])
    const writeSystemState = async (state: boolean) => {
        try {
            await _adsClients.adsDataProvider.write('$(GM_BASE).System.Operation.EN', state)
            let EN = await _adsClients.adsDataProvider.readValue('$(GM_BASE).System.Operation.EN', globalSession, version) as boolean
            setSystemState(EN)
            refresh()
        } catch (e) {
        }
        return true
    }
    return [systemState, writeSystemState] as const
}

let autoUpdateState = { autoUpdateInterval: null as null | any }

export const useAutoUpdate = () => {
    const refresh = useRefresh()
    let [autoUpdate, setAutoUpdate] = useState(autoUpdateState.autoUpdateInterval !== null)
    useEffect(() => {
        if (autoUpdate) {
            if (!autoUpdateState.autoUpdateInterval) {
                autoUpdateState.autoUpdateInterval = setIntervalAsync(() => {
                    if (autoUpdate)
                        refresh()
                }, 1500)
                setTimeout(() => {
                    setAutoUpdate(false)
                    if (autoUpdateState.autoUpdateInterval) {
                        clearInterval(autoUpdateState.autoUpdateInterval)
                        autoUpdateState.autoUpdateInterval = null
                    }
                }, 30 * 60 * 1000)
                refresh()
            }
        } else {
            if (autoUpdateState.autoUpdateInterval) {
                clearIntervalAsync(autoUpdateState.autoUpdateInterval)
                autoUpdateState.autoUpdateInterval = null
            }
        }
    }, [autoUpdate, refresh])
    const writeAutoUpdate = (state: boolean) => {
        setAutoUpdate(state)
        return true
    }
    return [autoUpdate, writeAutoUpdate] as const
}

const PlcControl = (props: { classes: any; translate?: any; }) => {

    const classes = useStyles()
    const translate = useTranslate()
    const [plcState, setPlcState] = usePlcState()
    const refPlcState = useRef(plcState)
    const { loaded, permissions } = usePermissions()
    const notify = useNotify()
    const version = useVersion()
    const refresh = useRefresh()
    const confirm = useConfirm()

    useEffect(() => {
        refresh()
    }, [refresh])
    useEffect(() => {
        refPlcState.current = plcState
    }, [plcState])
    useEffect(() => {
        if (plcState !== AdsState.Invalid && plcState !== AdsState.Run && plcState !== AdsState.Stop)
            notify('Invalid PLC state (RUN or STOP required)', 'warning')
    }, [plcState, notify, version])

    const okToReset = async () => {
        await confirm({ description: `RESET PLC` })
        await setPlcState(AdsState.Reset)
        await new Promise(r => setTimeout(r, 100))
        refresh()
        if (refPlcState.current !== AdsState.Stop) {
            await new Promise(r => setTimeout(r, 1000))
            refresh()
        }
        if (refPlcState.current === AdsState.Stop) {
            await new Promise(r => setTimeout(r, 1000))
            await setPlcState(AdsState.Run)
            await new Promise(r => setTimeout(r, 100))
            refresh()
            // @ts-ignore
            if (refPlcState.current !== AdsState.Run) {
                await new Promise(r => setTimeout(r, 1000))
                refresh()
            }
        }
    }

    return (loaded ? (permissions >= 0 ? <div className={classes.main}>
        <Title title={translate('custom.title') + ' ' + appInfo.hostName + " / " + translate('custom.system', 2)} />
        <CssBaseline />
        <Paper className={classes.paper}>
            <Avatar className={classes.avatar}>
                <PowerIcon />
            </Avatar>
            <Box display="flex" flexDirection="column" >
                <Card>
                    <CardHeader title={translate("custom.operation")} />
                    <CardContent>
                        <PlcCheckBox plcVar="$(GM_BASE).System.Operation.EN" label={translate("custom.ON")} />
                        <PlcCheckBox plcVar="$(GM_BASE).System.Operation.RemoteEN" label={translate("custom.RemoteEN")} />
                        <PlcCheckBox plcVar="$(GM_BASE).System.Operation.Simulation" label={translate("custom.simulation")} />
                        <div style={{ border: '2px solid lightgray', width: "75px", borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
                            <TextField
                                label="PLC"
                                multiline
                                rowsMax={4}
                                value={AdsState[plcState]}
                                InputLabelProps={{ style: { fontSize: '110%' } }}
                                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
                            />
                        </div>

                        <p />
                        <Box display="flex" flexDirection="row" >
                            {/*}
                            <Button size="small" color="secondary" variant="contained" style={{ marginRight: 10, color: "#b71c1c" }} onClick={async event => {
                                await setPlcState(AdsState.Stop)
                                await new Promise(r => setTimeout(r, 100))
                                refresh()
                                if (refPlcState.current !== AdsState.Stop) {
                                    await new Promise(r => setTimeout(r, 1000))
                                    refresh()
                                }
                            }} >
                                <span style={{ color: "white" }} >
                                    Stop PLC
                                </span>
                            </Button>
                            {*/}
                            <Button size="small" color="primary" variant="contained" style={{ marginRight: 10 }} onClick={async event => {
                                await setPlcState(AdsState.Run)
                                await new Promise(r => setTimeout(r, 100))
                                refresh()
                                if (refPlcState.current !== AdsState.Run) {
                                    await new Promise(r => setTimeout(r, 1000))
                                    refresh()
                                }
                            }} >
                                Start PLC
                            </Button>
                            <Button size="small" color="primary" variant="contained" onClick={async event => {
                                okToReset()
                            }} >
                                Reset PLC
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
            <p></p>
        </Paper>
        <p></p>
    </div> : null)
        : null);
}

const useButtonStyles = makeStyles((theme) => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 175,
    },
    textEdit: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 160,
    },
    margin: {
        margin: theme.spacing(1),
    },
}))

export const PlcNumberField = (props: { plcVar: string, label: string, decimals?: number, onScale?: (value: number) => number, template?: string }) => {
    const classes = useButtonStyles()
    const [parameter] = useParameter(props.plcVar, 0)
    let par = parameter
    if (typeof par !== 'number')
        par = -1
    let decimals = props.decimals
    if (decimals === undefined)
        decimals = 1
    let onScale = props.onScale ? props.onScale : (v: number) => v
    let onFormat = (value: string) => format(props.template ? props.template : '{0}', value)
    return <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
        <Tooltip title={props.plcVar} >
            <TextField
                label={props.label}
                className={classes.textField}
                value={onFormat(onScale(par).toFixed(decimals))}
                //margin="normal"
                //inputProps={{ style: { fontSize: '110%' } }}
                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
                InputLabelProps={{ style: { fontSize: '110%' } }} />
        </Tooltip>
    </div>
}

export const PlcTextField = (props: { plcVar: string, label: string, multiline?: boolean }) => {
    const classes = useButtonStyles()
    const [parameter] = useParameter(props.plcVar, ' ')
    return <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
        <Tooltip title={props.plcVar} >
            <TextField
                multiline
                rowsMax={4}
                label={props.label}
                className={classes.textField}
                //margin="normal"
                value={parameter}
                InputLabelProps={{ style: { fontSize: '110%' } }}
                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
            />
        </Tooltip>
    </div>
}

export const PlcDateTimeField = (props: { plcVar: string, label: string }) => {
    const [parameter] = useParameter(props.plcVar, 0.0)
    return <div style={{ border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }} >
        <Tooltip title={props.plcVar} >
            <TextField
                label={props.label}
                value={parameter}
                InputLabelProps={{ style: { fontSize: '110%' } }}
                InputProps={{ disableUnderline: true, style: { fontSize: '110%' } }}
            />
        </Tooltip>
    </div>
}

export const PlcNumberEdit = (props: { plcVar: string, label: string, decimals?: number, unit?: string, step?: number, min?: number, max?: number, writeOnChange?: boolean }) => {
    const classes = useButtonStyles()
    const state = useRef({ editing: false, written: false })
    const [value, setValue] = useState('')
    const [parameter, setParameter] = useParameter(props.plcVar, 0)
    const [buttonDisabled, setButtonDisabled] = useState(true)
    const [buttonStyle, setButtonStyle] = useState("outlined" as "text" | "outlined" | "contained" | undefined)
    const endAdornment = props.unit ? <InputAdornment position="end">{props.unit}</InputAdornment> : undefined
    const refEditParameter = useRef({ value: null as number | null, editValue: null as number | null })
    useEffect(() => {
        if (!state.current.editing)
            setValue(parameter.toFixed(props.decimals !== undefined ? props.decimals : 1))
        refEditParameter.current.value = parameter
    }, [parameter, props.decimals, refEditParameter])
    useEffect(() => {
        let interval: SetIntervalAsyncTimer
        if (props.writeOnChange) {
            interval = setIntervalAsync(async () => {
                try {
                    if (state.current.editing && refEditParameter.current.editValue !== null && refEditParameter.current.editValue !== refEditParameter.current.value) {
                        setParameter(refEditParameter.current.editValue)
                    }
                } catch (e) {
                }

            }, 500)
        }
        return () => {
            if (interval)
                clearIntervalAsync(interval)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [/*props.writeOnChange, setParameter, refEditParameter*/])

    const doButtonClick = () => {
        if (state.current.editing) {
            state.current.editing = false
            setButtonStyle("outlined")
            setButtonDisabled(true)
            state.current.written = true
            let v = parseFloat(value)
            if (!isNaN(v)) {
                refEditParameter.current.editValue = v
                setParameter(v)
            }
        }
    }


    return <Tooltip title={props.plcVar} >
        <Box display="flex">
            <TextField
                label={props.label}
                style={{ width: "60%"}}
                value={value}
                type="number"
                onKeyPress={async event => {
                    if (event.key === 'Enter') {
                        doButtonClick()
                    }
                }}
                onKeyDown={async event => {
                    if (event.key === 'Tab') {
                        doButtonClick()
                    }
                }}
                onFocus={event => {
                    event.target.select();
                  }}
                onChange={async event => {
                    state.current.editing = true
                    setValue(event.target.value)
                    setButtonStyle("contained")
                    let buttonDisabled = false
                    if (props.writeOnChange && (event.nativeEvent as any).inputType === undefined) {
                        let v = parseFloat(event.target.value)
                        if (!isNaN(v)) {
                            refEditParameter.current.editValue = v
                            buttonDisabled = true
                        }
                    }
                    setButtonDisabled(buttonDisabled)
                }}
                className={classes.textEdit}
                margin="normal"
                InputLabelProps={{ style: { fontSize: '125%' } }}
                InputProps={{ style: { fontSize: '125%' }, endAdornment }}
                inputProps={{ step: props.step, min: props.min, max: props.max }}
            />
            <Button variant={buttonStyle} size="small" color="primary" disabled={buttonDisabled} className={classes.margin} onClick={event => {
                doButtonClick()
            }} >Set</Button>
        </Box>
    </Tooltip>
}

export const PlcCheckBox = (props: { plcVar: string, label: string, readOnly?: boolean, inverted?: boolean, colorTrue?: string, colorFalse?: string, doRefresh?: boolean }) => {
    const [parameter, setParameter] = useParameter(props.plcVar, undefined as never as boolean | undefined, props.doRefresh || true)
    const refresh = useRefresh()
    useEffect(() => {
    }, [parameter])
    return <Tooltip title={props.plcVar} >
        <CheckBoxStyleColor
            checked={parameter === undefined ? false : props.inverted ? !parameter : parameter}
            color={parameter === undefined ? "gray" : parameter ? props.colorTrue ? props.colorTrue : "black" : props.colorFalse ? props.colorFalse : "black"}
            setChecked={async (checked: boolean) => {
                if (!props.readOnly) {
                    await setParameter(props.inverted ? !checked : checked)
                    if (props.doRefresh || true)
                        refresh()
                }
            }} label={props.label} />
    </Tooltip>

}

export const PlcIcon = (props: { iconTrue: ReactElement, iconFalse: ReactElement, plcVar: string, label: string, inverted?: boolean, colorTrue?: string, colorFalse?: string, style?: any }) => {
    const [parameter] = useParameter(props.plcVar, false)
    const [icon, setIcon] = useState(null as ReactElement | null)
    const [iconColor, setIconColor] = useState("")
    useEffect(() => {
        setIcon((props.inverted ? !parameter : parameter) ? props.iconTrue : props.iconFalse)
        setIconColor((props.inverted ? !parameter : parameter) ? props.colorTrue ? props.colorTrue : "black" : props.colorFalse ? props.colorFalse : "black")
    }, [parameter, props.iconTrue, props.iconFalse, props.colorTrue, props.colorFalse, props.inverted])
    return <Tooltip title={props.plcVar} >
        <Box display="flex" flexWrap="nowrap" flexDirection="row" alignItems="center" justifyContent="spaceEvenly" style={{ ...props.style, border: '2px solid lightgray', borderRadius: '5px', padding: '0 5px 0 5px', margin: '3px' }}>
            {icon && React.cloneElement(icon, { style: { color: iconColor } })}
            <p style={{ marginLeft: "0.5em", fontSize: "75% " }} >
                {props.label}
            </p>
        </Box>
    </Tooltip>
}

export const CheckPlcConnection = ({ render }: any) => {
    const [plcState, setPlcState] = useState(null as never as AdsState | null)
    const [plcStateString, setPlcStateString] = useState('Unknown')
    const validPlcState = plcState === (AdsState.Run || AdsState.Stop)
    const [retries, setRetries] = useState(0)
    const [retry, setRetry] = useState(true)
    const refRetry = useRef({
        retries: 0,
        retry: true,
        validPlcState: false
    })
    refRetry.current.validPlcState = validPlcState

    const clearCurrentRetries = () => {
        setRetry(true)
        setRetries(0)
        refRetry.current.retries = 0
        refRetry.current.retry = true
    }
    useEffect(() => {
        let retryCount = 3600 / 5
        let foo = async (inc: boolean) => {
            if (retry) {
                try {
                    let state = await _adsClients.adsWebClient.readState()
                    setPlcState(state.adsStateCode as AdsState)
                    setPlcStateString(state.adsState!)
                    refRetry.current.retry = true
                } catch (e) {
                }
                if (inc)
                    refRetry.current.retries++
                if (refRetry.current.retries >= retryCount)
                    setRetry(false)
                setRetries(refRetry.current.retries)
            }
        }
        let interval = setIntervalAsync(async () => {
            if (!validPlcState)
                await foo(true)
        }, 5000)
        foo(false)
        return () => {
            clearIntervalAsync(interval).then()
        }
    }, [refRetry, retry, setPlcState, setPlcStateString, setRetries, setRetry, validPlcState])

    return (
        validPlcState ?
            render
            :
            <div style={{ position: 'absolute', left: '50%', top: '50%', color: '#283593', transform: 'translate(-50%, -50%)' }} >
                <p><b>NIBE AirSite GreenMaster {appVersion.version}</b></p>
                {plcState && !validPlcState ?
                    <div>
                        <p></p>
                        <p>{`Waiting for connection. PLC is in state ${plcStateString}. Run or Stop required. `}</p>
                        {retry ? <p>Checks: {retries + 1}</p> : <p><button className="square" onClick={() => clearCurrentRetries()}>Retry</button></p>}
                    </div> : null
                }
            </div>
    );
};

export default PlcControl
