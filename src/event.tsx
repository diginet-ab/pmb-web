import React, { } from "react"
import {
    ShowButton,
    DateField,
    Show,
    SimpleShowLayout,
    List,
    TextField,
    TextInput,
    Filter,
    SimpleList,
    useTranslate,
    FunctionField,
    Datagrid
} from "react-admin"
import { ListActions } from "./CommonActions"
import moment from "moment"
import { getTitleText } from "./parameter"
import { useMediaQuery } from "@material-ui/core"
import ReactJson from 'react-json-view'
import JSON_STR from 'json-stringify-date'
import { useLocale } from "react-admin"

const EventFilter = (props: any) => {
    return <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
}

export const EventList = (props: any) => {
    const translate = useTranslate();
    const locale = useLocale()

    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    let isDark = false
    let prefs = localStorage.getItem('preferences')
    if (prefs) {
        let p = JSON.parse(prefs)
        isDark = p.theme === 'dark'
    }

    return (
        <List {...props} bulkActionButtons={false} title={getTitleText((props as any).resource, translate, isSmall)} filters={<EventFilter />} sort={{ field: 'time', order: 'DESC' }} >
            {isSmall ?
                <SimpleList linkType={"none"}
                    primaryText={(record: any) => record?.time}
                    secondaryText={(record: any) => record ? buildEventMessage(record) : '' }
                    tertiaryText={(record: any) => record?.kind}
                />
                :
                <Datagrid >
                    <DateField source="time" showTime locales={locale} />
                    <TextField source="kind" />
                    <FunctionField source="message" label="resources.event.fields.message" render={(record: any) => buildEventMessage(record) } />
                    <FunctionField source="json" label="Data" render={(record: any) => ( (record.json && record.json !== '') ? <ReactJson displayDataTypes={ false } displayObjectSize={ false } theme={ isDark ? "monokai" : "bright:inverted" }  name={false} collapsed enableClipboard={false} src={ JSON.parse(record.json) } /> : <div/>) } />
                    <TextField source="template" label="resources.event.fields.template"/>
                    <ShowButton />
                </Datagrid>
            }
        </List>
    )
}

const buildEventMessage = (record: any) => {
    let result: string = record.message
    const replaceArgument = (obj: {[key: string]: any}, template: string, preFix: string = '') => {
        let result = template
        for (let prop in obj) {
            if (typeof obj[prop] !== 'object')
            result = result.replace(new RegExp(`\\\${${ preFix + prop }}`), obj[prop].toString())
            else
                result = replaceArgument(obj[prop], result, prop + '\\.')
        }
        return result
    }
    if (record.json && record.json !== '') {
        let jsonObj = JSON_STR.parse(record.json)
        result = replaceArgument(jsonObj, result)
    }
    return result
}

export const EventShow = (props: JSX.IntrinsicAttributes) => (
    <Show actions={<ListActions />} title={<EventTitle />} {...props}>
        <SimpleShowLayout>
            <DateField source="time" showTime />
            <TextField source="message" />
        </SimpleShowLayout>
    </Show>
)

const EventTitle = ({ record }: { record?: any }) => {
    return <span>Event {record ? moment(record?.time).format('YYYY-MM-DD HH:mm:ss') : ""}</span>
}
