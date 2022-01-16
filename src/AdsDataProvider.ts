import { useEffect, useState } from "react"
import { usePermissions } from "react-admin"
import { useTranslate } from "react-admin"
import { i18nProvider } from "./App"
import { AdsClients, AdsConnections, getAdsConnections } from "./ServerConnection"

export let _adsClients: AdsClients

export const useAdsDataProvider = () => {
    const translate = useTranslate()
    const currentPermissions = usePermissions()
    const [adsReady, setAdsReady] = useState(false)
    const [adsDataProvider, setAdsDataProvider] = useState(null as any)
    // log('Information', 'PTA PMB {version} web app starting', appVersion)
    useEffect(() => {
        try {
            (async () => {
                let dev = process.env.NODE_ENV === 'development'
                _adsClients = await getAdsConnections(dev ? AdsConnections.NodeServerConnection : AdsConnections.IpcConnection)
                if (!_adsClients.error) {
                    const foo = async (typ: any, resource: any, params: any, permissions?: any) => {
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
                            switch ((e as any).message) {
                                case 'custom.tcAdsWebServiceTimeout':
                                    (e as any).status = 503
                                    break
                                default:
                                    (e as any).status = 504
                            }
                            let msg = (e as any).message
                            if ((e as any).errorDetails)
                                msg = (e as any).errorDetails.message
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
                        getList: async (resource: any, params: any) => await foo('GET_LIST', resource, params, currentPermissions),
                        getOne: async (resource: any, params: any) => await foo('GET_ONE', resource, params, currentPermissions),
                        getMany: async (resource: any, params: any) => await foo('GET_MANY', resource, params, currentPermissions),
                        getManyReference: async (resource: any, params: any) => await foo('GET_MANY_REFERENCE', resource, params, currentPermissions),
                        update: async (resource: any, params: any) => await foo('UPDATE', resource, params, currentPermissions),
                        updateMany: async (resource: any, params: any) => await foo('UPDATE_MANY', resource, params, currentPermissions),
                        create: async (resource: any, params: any) => await foo('CREATE', resource, params, currentPermissions),
                        delete: async (resource: any, params: any) => await foo('DELETE', resource, params, currentPermissions),
                        deleteMany: async (resource: any, params: any) => await foo('DELETE_MANY', resource, params, currentPermissions),
                        getTree: async (resource: any) => {
                            const tree = await _adsClients.adsDataProvider.getTree(resource)
                            type Item = { title: string, id: string, children: Item[]}
                            const translateItem = (item: Item) => {
                                let translated = i18nProvider.translate("custom.plcTree." + item.id + (item.children.length ? "_NODE" : ""))
                                if (translated && translated.indexOf("custom.plcTree.") < 0)
                                    item.title = translated
                            }
                            if (tree) {
                                for (let item of tree.data) {
                                    translateItem(item as unknown as Item)
                                }
                            }
                            (tree as any).validUntil = new Date()
                            return tree
                        },
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
    }, [currentPermissions, translate])
    return [adsReady, adsDataProvider]
}
