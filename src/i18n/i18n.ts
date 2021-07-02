/* cSpell:disable */
export const domainMessages: any = {
    sv: {
        "Network Error": "Nätverksfel",
        custom: {
            title: "NIBE AirSite GreenMaster",
            email_or_username: "Email eller användarnamn",
            password: 'Lösenord',
            dateAfter: "Datum efter",
            dateBefore: "Datum före",
            timeAfter: "Tid efter",
            timeBefore: "Tid före",
            select: "Välj",
            selectLanguage: "Välj språk",
            aggregatedMessages: "Aggregerade meddelanden",
            aggregatedMessagesPerUser: "Användare",
            aggregatedMessagesPerProvider: "SMS-leverantörer",
            sent: "Sända",
            send: "Skicka",
            save: "Spara",
            delivered: "Levererade",
            tools: "Verktyg",
            system: "Av/på",
            setup: "Språkval",
            setupApplications: "Inställningar för web",
            systemStatus: "Logg",
            errorCount: "0 fel senaste 24 tim",
            english: "Engelska",
            swedish: "Svenska",
            browserDefaultLanguage: "Webbläsaren standardval",
            to: "till",
            message: "Meddelande",
            programStatus: "Programstatus",
            supplyPressureSetPoint: "F.GQ1 SP (pascal)",
            exhaustPressureSetPoint: "T.GQ1 SP (pascal)",
            supplyFlowSetPoint: "F.GQ1 SP (L/s)",
            exhaustFlowSetPoint: "T.GQ1 SP (L/s)",
            temperatureSetPoint: "Temperatur SP (C)",
            ON: "System på/av",
            operation: "Drift",
            supplyAir: "Tilluft",
            fanSpeedPercent: "Fläkthastighet (%)",
            pressurePascal: "Tryck (pascal)",
            pressureSetPointPascal: "Tryck SP (pascal)",
            outdoorAirTemperature: "Utomhustemperatur",
            heatExchangerPercentOpen: "VVX (% öppen)",
            supplyAirTemperature: "Tilluftstemperatur",
            heatingValvepercentOpen: "Värmeventil (%)",
            coolingValvePercentOpen: "Kylventil (%)",
            extractAir: "Frånluft",
            extractAirTemperature: "Frånluftstemperatur",
            alarm: "Larm",
            firealarmCentral: "Brandlarm, centralt",
            fireAlarmSupplyAir:"Brandlarm, tilluft",
            serviceAlarmCentral: "Servicelarm, centralt",
            serviceAlarmSupplyAir: "Servicelarm, tilluft",
            fuseAlarm: "Säkringslarm",
            fanAlarmSupplyAir: "Fläktlarm, tilluft",
            fanAlarmExtractAir: "Fläktlarm, frånluft",
            sensorStatus: "Givarstatus",
            grouping: "Grupper",
            subGrouping: "Undergrupper",
            autoUpdate: 'Auto',
            setPoint: 'Börvärden',
            pressure: 'Tryck',
            flow: 'Flöde',
            temperature: 'Temperatur',
            resetAllAlarms: 'Återställ ALLA larmer',
            resetAlarm: 'Återställt',
            ackAlarm: 'Kvittera',
            overview: 'Diagram',
            systemName: 'Systemnamn',
            import: 'Importera',
            autoRefresh: '1 timma automatisk uppdatering',
            systemEN: 'System aktivt',
            systemEN_Not: 'System ej aktivt',
            systemEN_NoPLCRun: 'System satt som aktivt men PLC stoppad',
            RemoteEN: 'Överordnad styrning',
            plcRun: 'PLC aktiv',
            plcRun_Not: 'PLC ej aktiv',
            auto: 'Auto',
            refresh: 'uppdatera',
            tcAdsWebServiceTimeout: 'TcAdsWebService svarade ej i tid',
            component: 'Komponent',
            components: 'Komponenter',
            plcError: 'PLC i ogiltigt tillstånd (RUN eller STOP krävs)',
            details: "Detaljer",
            dampers: 'Spjäll',
            systemState: 'Systemtillstånd',
            deleteAllAlarms: 'Radera alla',
            alarmPanel: 'Larmpanel',
            diagram: 'Diagram (lab)',
            controlStatus: 'Reglerstatus',
            temperatureSP: 'Temperatur SP',
            temperaturePV: 'Temperatur PV',
            supplySP: 'Tilluft SP',
            supplyPV: 'Tilluft PV',
            extractSP: 'Frånluft SP',
            extractPV: 'Frånluft PV',
            systemUpTime: 'Tid system uppe',
            controlModeSupplyAir: 'Reglermod tilluft',
            controlModeExtractAir: 'Reglermod frånluft',
        },
        pos: {
            search: 'Sök',
            configuration: 'Konfiguration',
            language: 'Språk',
            theme: {
                name: 'Tema',
                light: 'Ljus',
                dark: 'Mörk',
            },
            dashboard: {
            },
            menu: {
                settings: 'Inställningar',
                status: 'Status',
                setup: 'Programinställningar',
            },
        },
        resources: {
            parameter: {
                name: "Parametrar",
                fields: {
                    name: 'Namn',
                    component: 'Komponent',
                    unit: 'Enhet',
                    path: "Sökväg",
                    group: "Grupp",
                    siteName: "Anl. namn",
                    type: "Typ",
                    value: "Värde",
                    comment: "Beskrivning",
                    product: "Produkt",
                },
            },
            io: {
                name: "IO",
                fields: {
                    name: 'Namn',
                    component: 'Komponent',
                    unit: 'Enhet',
                    path: "Sökväg",
                    siteName: "Anl. namn",
                    type: "Typ",
                    value: "Värde",
                    comment: "Beskrivning",
                },
            },
            path1: {
                name: "Path1",
                fields: {
                    path: "Path1",
                },
            },
            path2: {
                name: "Path2",
                fields: {
                    path: "Path2",
                },
            },
            siteName: {
                name: "Anl. namn",
                fields: {
                    path: "Sökväg",
                    siteName: "Anl. namn",
                },
            },
            alarm: {
                name: "Larm",
                fields: {
                    time: 'Tid',
                    alarms: 'Larmer',
                    notes: 'Noteringar',
                    timeCreated: "Skapad",
                    status: "Status",
                    statusCode: "Statuskod",
                },
            },
            event: {
                name: "Händelser",
                fields: {
                    time: 'Tid',
                    kind: 'Typ',
                    timeCreated: "Skapad",
                    message: "Meddelande",
                    template: "Mall",
                    status: "Status",
                    statusCode: "Statuskod",
                },
            },
            debugLog: {
                name: "Debug log",
                fields: {
                    time: "Tid",
                    message: 'Meddelande',
                    stack: 'Stack',
                    status: "Status",
                },
            },
            user: {
                name: "Användare",
                fields: {
                    name: "Namn",
                    email: "E-mail / användarnamn",
                    permissions: 'Behörighet',
                    phone: "Telefon",
                    password: "Lösenord",
                }
            },
            component: {
                name: "Komponenter",
                fields: {
                    name: "Namn",
                    EN: "EN",
                    path: "Sökväg",
                    resource: "Resurs",
                    permissions: 'Behörighet',
                    parameters: 'Parametrar',
                }
            },
        },
    },
    en: {
        "Network Error": "Network Error",
        custom: {
            title: "NIBE AirSite GreenMaster",
            email_or_username: "Email or Username",
            password: 'Password',
            dateAfter: "Date after",
            dateBefore: "Date before",
            timeAfter: "Time after",
            timeBefore: "Time before",
            select: "Select",
            selectLanguage: "Select language",
            aggregatedMessages: "Aggregated messages",
            aggregatedMessagesPerUser: "Users",
            aggregatedMessagesPerProvider: "Providers",
            sent: "Sent",
            send: "Send",
            save: "Save",
            delivered: "Delivered",
            tools: "Tools",
            system: "On/off",
            setup: "Language",
            setupApplications: "Web setup",
            systemStatus: "Log",
            errorCount: "0 errors in last 24h",
            english: "English",
            swedish: "Swedish",
            browserDefaultLanguage: "Browser default",
            to: "to",
            message: "Message",
            programStatus: "Program status",
            supplyPressureSetPoint: "F.GQ1 pressure set point",
            exhaustPressureSetPoint: "T.GQ1 pressure set point",
            supplyFlowSetPoint: "F.GQ1 flow set point",
            exhaustFlowSetPoint: "T.GQ1 flow set point",
            temperatureSetPoint: "Temperature SP (C)",
            ON: "System On/Off",
            operation: "Operation",
            supplyAir: "Supply air",
            fanSpeedPercent: "Fan speed (%)",
            pressurePascal: "Pressure (pascal)",
            pressureSetPointPascal: "Pressure SP (pascal)",
            outdoorAirTemperature: "Outdoor temperature",
            heatExchangerPercentOpen: "Heat exchanger (%)",
            supplyAirTemperature: "Supply air temp.",
            heatingValvepercentOpen: "Heating valve (%)",
            coolingValvePercentOpen: "Cooling valve (%)",
            extractAir: "Extract air",
            extractAirTemperature: "Extract air temp.",
            alarm: "Alarm",
            firealarmCentral: "Fire alarm, central",
            fireAlarmSupplyAir:"Fire alarm, supply air",
            serviceAlarmCentral: "Service alarm, central",
            serviceAlarmSupplyAir: "Service alarm, supply air",
            fuseAlarm: "Fuse alarm",
            fanAlarmSupplyAir: "Fan alarm, supply air",
            fanAlarmExtractAir: "Fan alarm, extract air",
            sensorStatus: "Sensor status",
            grouping: "Groups",
            subGrouping: "Subgroups",
            autoUpdate: 'Auto',
            setPoint: 'Set point |||| Set points',
            pressure: 'Pressure',
            flow: 'Flow',
            temperature: 'Temperature',
            resetAllAlarms: 'Reset ALL alarms',
            resetAlarm: 'Reset',
            ackAlarm: 'Acknowledge',
            overview: 'Overview',
            systemName: 'System name',
            import: 'Import',
            autoRefresh: '1 hour auto refresh',
            systemEN: 'System active',
            systemEN_Not: 'System not active',
            systemEN_NoPLCRun: 'System set as active but PLC stopped',
            RemoteEN: 'Supervisor control',
            plcRun: 'PLC active',
            plcRun_Not: 'PLC not active',
            auto: 'Auto',
            refresh: 'refresh',
            tcAdsWebServiceTimeout: 'TcAdsWebService timeout',
            component: 'Component',
            components: 'Components',
            plcError: 'Invalid PLC state (RUN or STOP required)',
            details: "Details",
            dampers: 'Dampers',
            systemState: 'System state',
            deleteAllAlarms: 'Remove all',
            alarmPanel: 'Alarm panel',
            diagram: 'Diagram (lab)',
            controlStatus: 'Regulation status',
            temperatureSP: 'Temperature SP',
            temperaturePV: 'Temperature PV',
            supplySP: 'Supply SP',
            supplyPV: 'Supply PV',
            extractSP: 'Extract SP',
            extractPV: 'Extract PV',
            systemUpTime: 'System up time',
            controlModeSupplyAir: 'Supply air mode',
            controlModeExtractAir: 'Extract air mode',
        },
        pos: {
            search: 'Search',
            configuration: 'Configuration',
            language: 'Language',
            theme: {
                name: 'Theme',
                light: 'Light',
                dark: 'Dark',
            },
            dashboard: {
            },
            menu: {
                settings: 'Settings',
                status: 'Status',
                setup: 'Program setup',
            },
        },
        resources: {
            parameter: {
                name: "Parameters",
                fields: {
                    name: 'Name',
                    siteName: 'Site name',
                    component: 'Component',
                    type: 'Type',
                    value: 'Value',
                    group: 'Group',
                },
            },
            io: {
                name: "IO",
                fields: {
                },
            },
            path1: {
                name: "Path1",
                fields: {
                },
            },
            path2: {
                name: "Path2",
                fields: {
                    path: "Path2",
                },
            },
            siteName: {
                name: "Site names",
                fields: {
                },
            },
            alarm: {
                name: "Alarms",
                fields: {
                    timeCreated: "Created",
                    status: "Status",
                },
            },
            event: {
                name: "Events",
                fields: {
                    timeCreated: "Created",
                    message: 'Message',
                    template: 'Template',
                },
            },
            debugLog: {
                name: "Debug log",
                fields: {
                },
            },
            user: {
                name: "Users",
                email: "E-mail / username",
            },
            component: {
                name: "Components",
                fields: {
                    EN: "EN",
                }
            },
        },
    },
}
