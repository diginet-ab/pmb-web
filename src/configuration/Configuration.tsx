import React, { useEffect, useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { useTranslate, useLocale, useSetLocale, Title } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { appInfo } from '../App';
import { Box, CardHeader, Checkbox, FormControlLabel, TextField } from '@material-ui/core';

export const getLocalStorageItem = (key: string, def: string = "") => localStorage.getItem(key) ? localStorage.getItem(key)! : def
export const setLocalStorageItem = (key: string, value: string) => localStorage.setItem(key, value)
export const getLocalStorageItemBoolean = (key: string, def: boolean = false) => localStorage.getItem(key) ? localStorage.getItem(key) !== "false" : def
export const setLocalStorageItemBoolean = (key: string, value: boolean) => localStorage.setItem(key, value ? "true" : "false")

const useStyles = makeStyles({
    label: { width: '10em', display: 'inline-block' },
    button: { margin: '1em' },
});

const Configuration = () => {
    const [allUserMessages] = useState(getLocalStorageItemBoolean("allUserMessages", true))
    const [device, setDevice] = useState(getLocalStorageItem("webPortDevice", 'PMB'))
    const [linkToWebPort, setLinkToWebPort] = useState(getLocalStorageItem("webPortLink", 'http://localhost:8090'))
    const [openInNewTab, setOpenInNewTab] = useState(getLocalStorageItemBoolean("webPortLinkNewTab", false))
    useEffect(() => {
        setLocalStorageItemBoolean("allUserMessages", allUserMessages)
    }, [allUserMessages])
    const translate = useTranslate();
    const locale = useLocale();
    const setLocale = useSetLocale()
    const mySetLocale = (lang: string) => {
        setLocale(lang)
        localStorage.setItem("language", lang)
    }
    const classes = useStyles();

    const deviceChange = (e: any) => {
        setDevice(e.target.value)
        setLocalStorageItem('webPortDevice', e.target.value)
    }
    const linkToWebPortChange = (e: any) => {
        setLinkToWebPort(e.target.value)
        setLocalStorageItem('webPortLink', e.target.value)
    }
    const openInNewTabChange = (e: any, checked: boolean) => {
        setOpenInNewTab(checked)
        setLocalStorageItemBoolean('webPortLinkNewTab', checked)
    }
    return (
        <>
            <Card>
                <CardHeader title={translate("custom.userInterfaceSettings")} />
                {/*}
            <CardContent>
                <div className={classes.label}>
                    {translate('pos.theme.name')}
                </div>
                <Button
                    variant="contained"
                    className={classes.button}
                    color={theme === 'light' ? 'primary' : 'default'}
                    onClick={() => dispatch(changeTheme('light'))}
                >
                    {translate('pos.theme.light')}
                </Button>
                <Button
                    variant="contained"
                    className={classes.button}
                    color={theme === 'dark' ? 'primary' : 'default'}
                    onClick={() => dispatch(changeTheme('dark'))}
                >
                    {translate('pos.theme.dark')}
                </Button>
            </CardContent>
            {*/}
                <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="left" >
                        <Box display="flex" flexDirection="row" alignItems="center" >
                            <div className={classes.label}>{translate('pos.language')}</div>
                            <Button
                                variant="contained"
                                className={classes.button}
                                color={locale === 'sv' ? 'primary' : 'default'}
                                onClick={() => mySetLocale('sv')}
                            >
                                sv
                            </Button>
                            <Button
                                variant="contained"
                                className={classes.button}
                                color={locale === 'en' ? 'primary' : 'default'}
                                onClick={() => mySetLocale('en')}
                            >
                                en
                            </Button>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
            <p></p>
            <Card>
                <CardHeader title={translate("custom.WebPort")} />
                <CardContent>
                    <Box display="flex" flexDirection="column" alignItems="left" >
                        <Box display="flex" flexDirection="row" alignItems="center" >
                            <div className={classes.label} >{translate('pos.deviceNameInWebPort')}</div>
                            <TextField value={device} onChange={deviceChange} />
                            <div className={classes.label} style={{width: "350px"}}>{translate('custom.usedInComponentExport')}</div>
                        </Box>
                        <p></p>
                        <Box display="flex" flexDirection="row" alignItems="center" >
                            <div className={classes.label}>{translate('pos.externalLink')}</div>
                            <TextField value={linkToWebPort} onChange={linkToWebPortChange} style={{width: "250px"}}/>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={openInNewTab}
                                        onChange={openInNewTabChange}
                                    />
                                }
                                label={translate("cusom.openInNewTab")}
                            />
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </>
    );
};

export default Configuration;