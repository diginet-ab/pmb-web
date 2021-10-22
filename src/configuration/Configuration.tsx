import React, { useEffect, useState } from 'react';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import { useTranslate, useLocale, useSetLocale, Title } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { appInfo } from '../App';
import { CardHeader, TextField } from '@material-ui/core';

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
    const [device, setDevice] = useState(getLocalStorageItem("webPortDevice", 'OBJECT_LB01'))
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
            </CardContent>
        </Card>
        <p></p>
        <Card>
            
            <CardContent>
                <CardHeader title={translate("custom.WebPort")} />
                <TextField value={device} onChange={deviceChange} />
            </CardContent>
        </Card>
        </>
    );
};

export default Configuration;