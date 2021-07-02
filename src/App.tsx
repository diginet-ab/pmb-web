import React, { useEffect, useState } from 'react';
import { Resource, resolveBrowserLocale, useTranslate, Title } from 'react-admin';
import { Admin } from '@react-admin/ra-enterprise'
import polyglotI18nProvider from 'ra-i18n-polyglot'
import { ParameterList, ParameterShow, ParameterEdit } from './parameter';
import { SiteNameList, SiteNameShow, SiteNameEdit } from './siteName';
import { EventList, EventShow } from './event';
import { AlarmList, AlarmShow, AlarmEdit } from './alarm';
import { UserList, UserShow, UserEdit, UserCreate } from './user';
import { ComponentList, ComponentShow, ComponentEdit, ComponentCreate } from './component';
import { DebugLogList, DebugLogShow } from './debugLog';
import ParameterIcon from '@material-ui/icons/Settings';
import SiteNameIcon from '@material-ui/icons/Label';
import EventIcon from '@material-ui/icons/Event';
import UserIcon from '@material-ui/icons/Group';
import AlarmIcon from '@material-ui/icons/Whatshot';
import IoIcon from '@material-ui/icons/SettingsInputComponent';
import DebugLogIcon from '@material-ui/icons/ErrorOutline';
import ComponentIcon from '@material-ui/icons/ViewCompact';
import Dashboard from './dashboard/Dashboard';
import authProvider from './authProvider';
import Login from './Login';
import MyLayout from './layout/MyLayout';
import customRoutes from './CustomRoutes';
import themeReducer from './themeReducer'
import Loader from 'react-loader-spinner'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"

// interface translations
import englishMessages from 'ra-language-english';
import swedishMessages from 'ra-language-swedish';

// domain translations
//import { domainMessages } from './i18n/i18n';
import { AdsClients, AdsConnections, getAdsConnections } from './ServerConnection';
// import { log } from './SeqLogger';

import { hot } from 'react-hot-loader';
import { PaletteType } from '@material-ui/core';
// import { DataProviderContext } from 'react-admin';
// import { useDataProvider } from 'react-admin';
import svLang from './i18n/locales/sv.json'
import enLang from './i18n/locales/en.json'
import { CheckPlcConnection, globalSession } from './PlcControl';
import { reducer as tree, raTreeLanguageEnglish } from '@react-admin/ra-tree'

declare const module: any;

const messages = {
    //sv: { ...swedishMessages, ...domainMessages.sv },
    //en: { ...englishMessages, ...domainMessages.en },
    sv: { ...swedishMessages, ...svLang, ...raTreeLanguageEnglish },
    en: { ...englishMessages, ...enLang, ...raTreeLanguageEnglish },
} as { [key: string]: any };

messages.sv.ra.page.empty = 'Inga användare ännu.'
messages.sv.ra.page.invite = 'Vill du lägga till en?'

const getLocale = () => {
    if (localStorage.getItem("language")) {
        return localStorage.getItem("language");
    }
    else {
        return resolveBrowserLocale();
    }
}

const i18nProvider = polyglotI18nProvider(locale => messages[locale], getLocale())

export const appInfo = {
    appTitle: '',
    hostName: ''
}

export const getAppTitle = (caption: string) => {
    return appInfo.appTitle + (caption ? ' / ' : '') + caption
}

export const AppTitle = ({ ...props }: any) => {
    return <Title {...props} title={getAppTitle(props.caption)} />
}

const commonThemeProps = {
    typography: {
        // Use the system font instead of the default Roboto font.
        fontSize: 12,
        fontFamily: [
            'Helvetica',
            'sans-serif',
            /*            
                        '-apple-system',
                        'BlinkMacSystemFont',
                        '"Segoe UI"',
                        'Arial',
                        'sans-serif',
            */
        ].join(',')
    },
    overrides: {
        MuiTableRow: {
            head: {
                //backgroundColor: 'lightgray',
                "& > th ": {
                    color: 'black',
                    fontWeight: 'bold',
                    textDecoration: 'underline',
                    margin: '5 5 5 5'
                },
                height: '20px'
            },
            root: {
                height: '20px',
            },
        },
        MuiToolbar: {
            root: {
            },

        }
    }
}

const lightTheme = {
    palette: {
        type: 'light' as PaletteType, // Don't forget to specify the palette type
        //primary: { main: red[900] },
        secondary: { main: '#BF2329' },
        //secondary: { main: '#002F4C' },
        white: { main: '#ffffff' },
    },
    ...commonThemeProps,
}

const darkTheme = {
    palette: {
        type: 'dark' as PaletteType, // Don't forget to specify the palette type
        secondary: { main: '#BF2329' },
        white: { main: '#ffffff' },
        /*
        primary: {
            main: '#263238',
        },
        secondary: {
            main: '#757575',
        },
*/
    },
    ...commonThemeProps,
}

export let _adsClients: AdsClients

export const appVersion = { version: '0.23' }

const App = () => {
    const [adsReady, setAdsReady] = useState(false)
    const [adsDataProvider, setAdsDataProvider] = useState(null as any)
    const translate = useTranslate()
    // log('Information', 'NIBE AirSite GreenMaster {version} web app starting', appVersion)
    useEffect(() => {
        try {
            (async () => {
                let dev = process.env.NODE_ENV === 'development'
                _adsClients = await getAdsConnections(dev ? AdsConnections.NodeServerConnection : AdsConnections.IpcConnection)
                if (!_adsClients.error) {
                    const foo = async (typ: any, resource: any, params: any) => {
                        let result: any
                        let rejectVar = {
                            rejector: (e: Error): void => undefined,
                            timeout: setTimeout(() => {
                                if (rejectVar)
                                    rejectVar.rejector?.(new Error('custom.tcAdsWebServiceTimeout'))
                            }, 30000)
                        }
                        try {
                            let auth = 0
                            let storedAuth = sessionStorage.getItem('auth')

                            if (storedAuth)
                                auth = parseInt(storedAuth)
                            result = await Promise.race(
                                [
                                    _adsClients.adsDataProvider.request(typ, resource, params, auth),
                                    new Promise((resolve, reject) => { rejectVar.rejector = reject }),
                                ])
                            if (rejectVar.timeout)
                                clearTimeout(rejectVar.timeout)
                        } catch (e) {
                            // log('Error', 'Error in dataprovider', { message: e.message })
                            console.log('DataProvider error: ', e)
                            switch (e.message) {
                                case 'custom.tcAdsWebServiceTimeout':
                                    e.status = 503
                                    break
                                default:
                                    e.status = 504
                            }
                            let msg = e.message
                            if (e.errorDetails)
                                msg = e.errorDetails.message
                            throw (new Error(msg))
                        }
                        if (result.error) {
                            let msg = result.message
                            if (result.errorDetails)
                                msg = result.errorDetails.message
                            let e: Error = new Error(msg)
                                ; (e as any).status = 503
                            throw (e)
                        }
                        return result
                    }
                    //await new Promise(resolve => setTimeout(resolve, 2000))
                    let dataProvider = {
                        getList: (resource: any, params: any) => foo('GET_LIST', resource, params),
                        getOne: (resource: any, params: any) => foo('GET_ONE', resource, params),
                        getMany: (resource: any, params: any) => foo('GET_MANY', resource, params),
                        getManyReference: (resource: any, params: any) => foo('GET_MANY_REFERENCE', resource, params),
                        update: (resource: any, params: any) => foo('UPDATE', resource, params),
                        updateMany: (resource: any, params: any) => foo('UPDATE_MANY', resource, params),
                        create: (resource: any, params: any) => foo('CREATE', resource, params),
                        delete: (resource: any, params: any) => foo('DELETE', resource, params),
                        deleteMany: (resource: any, params: any) => foo('DELETE_MANY', resource, params),
                        getTree: async (resource: any) => await _adsClients.adsDataProvider.getTree(resource),
                        getRootNodes: async (resource: any) => await _adsClients.adsDataProvider.getRootNodes(resource),
                        getParentNode: async (resource: any, params: any) => await _adsClients.adsDataProvider.getParentNode(resource, params),
                        getChildNodes: async (resource: any, params: any) => await _adsClients.adsDataProvider.getChildNodes(resource, params),
                        moveAsNthChildOf: async (resource: any, params: any) => await _adsClients.adsDataProvider.moveAsNthChildOf(resource, params),
                        moveAsNthSiblingOf: async (resource: any, params: any) => await _adsClients.adsDataProvider.moveAsNthSiblingOf(resource, params),
                        addRootNode: async (resource: any, params: any) => await _adsClients.adsDataProvider.addRootNode(resource, params),
                        addChildNode: async (resource: any, params: any) => await _adsClients.adsDataProvider.addChildNode(resource, params),
                        deleteBranch: async (resource: any, params: any) => await _adsClients.adsDataProvider.deleteBranch(resource, params),

                    }

                    setAdsDataProvider(dataProvider)
                    setAdsReady(true)
                }
            })()
        } catch {
        }
    }, [])
    useEffect(() => {
        (async () => {
            if (translate && adsDataProvider && _adsClients) {
                let hostName = await _adsClients.adsDataProvider.readValue('Globals.Hostname', globalSession)
                appInfo.appTitle = translate('custom.title') + ' ' + hostName
                appInfo.hostName = hostName
            }
        })()
    }, [translate, adsDataProvider])
    return (adsReady && adsDataProvider) ? <CheckPlcConnection render={<Admin
        disableTelemetry
        customRoutes={customRoutes}
        layout={MyLayout}
        title={<AppTitle />}
        i18nProvider={i18nProvider}
        //theme={myTheme} 
        lightTheme={lightTheme}
        darkTheme={darkTheme}
        customReducers={{ theme: themeReducer, tree }}
        dashboard={Dashboard}
        authProvider={authProvider}
        dataProvider={adsDataProvider}
        loginPage={Login} >
        {(permissions: any) => [
            <Resource name="alarm" list={AlarmList} show={AlarmShow} edit={AlarmEdit} icon={AlarmIcon} />,
            <Resource name="parameter" list={ParameterList} icon={ParameterIcon} />,
            <Resource name="io" list={ParameterList} show={ParameterShow} edit={ParameterEdit} icon={IoIcon} />,
            permissions >= 1 ? <Resource name="siteName" list={SiteNameList} show={SiteNameShow} edit={SiteNameEdit} icon={SiteNameIcon} /> : null,
            permissions < 1 ? <Resource name="siteName" /> : null,
            <Resource name="event" list={EventList} show={EventShow} icon={EventIcon} />,
            permissions >= 2 ? <Resource name="user" list={UserList} show={UserShow} edit={UserEdit} create={UserCreate} icon={UserIcon} /> : null,
            permissions >= 2 ? <Resource name="debugLog" list={DebugLogList} show={DebugLogShow} icon={DebugLogIcon} /> : null,
            permissions >= 2 ? <Resource name="component" list={ComponentList} show={ComponentShow} edit={ComponentEdit} create={ComponentCreate} icon={ComponentIcon} /> : null,
            permissions < 2 ? <Resource name="component" /> : null,
            <Resource name="path1" />,
            <Resource name="path2" />,
        ]}
    </Admin>}/> :
        <div style={{ position: 'absolute', left: '50%', top: '50%', color: '#283593', transform: 'translate(-50%, -50%)' }} >
            <b>NIBE AirSite GreenMaster {appVersion.version}</b>
            <Loader
                type="Puff"
                color="#00BFFF"
                height={100}
                width={100}
                timeout={3000} //3 secs
            />
        </div>
}

//export default App;
export default hot(module)(App);