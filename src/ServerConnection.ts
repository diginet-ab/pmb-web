import { BrowserWebSocketTransport, RpcClient, IDsModule, Converter } from '@decthings/ds-nodes'
//import { AdsDataProvider, AdsWebClient } from '@diginet/ads-web-client'
import { AdsDataProvider } from '@diginet/ads-web-client'
import { AdsWebClient } from '@diginet/ads-web-client'
import JSON_STR from 'json-stringify-date'
import { getLocalStorageItem } from './configuration/Configuration'

export interface AdsClients {
    error?: { code: boolean, message: string }
    adsWebClient: AdsWebClient
    adsDataProvider: AdsDataProvider
}

export function JsonDateStringifier<T = any>(sources?: IDsModule<any, any>[]) {
    return new Converter<T, string>(sources || [], message => {
        return JSON_STR.stringify(message)
    })
}

export function JsonDateParser<T = any>(sources?: IDsModule<any, string>[]) {
    return new Converter<string, T>(sources || [], message => {
        return JSON_STR.parse(message)
    })
}


export enum AdsConnections { IpcConnection, NodeServerConnection}

export const getAdsConnections = async (viaNodeServer: AdsConnections = AdsConnections.IpcConnection, url?: string, plcName: string = "PLC1", symbolFileUrl?: string) => {

    let result: { adsWebClient: AdsWebClient, adsDataProvider: AdsDataProvider }

    if (viaNodeServer === AdsConnections.IpcConnection) {

        if (!url)
            url = document.location.protocol + "//" + document.location.host
        if (document.location.hostname === "localhost") {
            url = "http://localhost:8080/http://192.168.2.225"
            symbolFileUrl = "http://localhost:8080/http://localhost:8082"
        }
        const adsWebClient = new AdsWebClient(url, getLocalStorageItem('plcName', plcName), symbolFileUrl, parseInt(getLocalStorageItem('adsPortNr', '851')))
        await adsWebClient.ready()
        const adsDataProvider = new AdsDataProvider(adsWebClient)
        await adsDataProvider.ready()

        let response = await fetch(url)

        result = { error: (response.status === 200) ? undefined : { code: response.status, message: response.statusText }, adsWebClient, adsDataProvider } as AdsClients
    } else
        result = await getServerProxies(url)

    return result
}

const getServerProxies = async (nodeServerUrl: string = 'ws://localhost:3001') => {
    // Create a WebSocket client which connects to the server
    // For use in broser, use BrowserWebSocketTransport instead
    let transport = new BrowserWebSocketTransport([], { address: nodeServerUrl })

    // Parse each incoming message
    let parser = JsonDateParser([transport])

    // Send each parsed message to a RPC client
    let rpcClient = new RpcClient([parser])

    // Serialize each outgoing message
    let stringifier = JsonDateStringifier([rpcClient])
    stringifier.pipe(transport)

    let adsWebClient = rpcClient.api('AdsWebClient') as AdsWebClient
    let adsDataProvider = rpcClient.api('AdsDataProvider') as AdsDataProvider

    return { error: undefined, adsWebClient, adsDataProvider } as AdsClients

}