import React from "react"
import {
    EditButton,
    TextInput,
    BooleanField,
    BooleanInput,
    Datagrid,
    ExportButton,
    DateField,
    ShowButton,
    ArrayField,
    Show,
    SimpleShowLayout,
    List,
    Edit,
    SimpleForm,
    TextField,
    Filter,
    Responsive,
    SimpleList,
    useTranslate,
    useRefresh,
    FunctionField,
} from "react-admin"
import { ListActions, ListShowActions } from "./CommonActions"
//import { translate } from "ra-core"
import ResetAlarmIcon from '@material-ui/icons/Check'
//import { VolumeOff } from '@material-ui/icons';
import moment from "moment"
import { CardActions, Button, useMediaQuery } from "@material-ui/core"
//import ResetAlarmsButton from "./ResetAlarmsButton"
import { _adsClients } from "./AdsDataProvider"
import { getTitleText } from "./parameterList"
import ReactJson from "react-json-view"
import { useLocale } from "react-admin"

const AlarmFilter = (props: any) => {
    return <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
}

const AlarmActions = ({
    bulkActions,
    basePath,
    currentSort,
    displayedFilters,
    exporter,
    filters,
    filterValues,
    onUnselectItems,
    resource,
    selectedIds,
    showFilter,
    total
}: any) => {
    //const [autoUpdate, setAutoUpdate] = useState(false)
    const translate = useTranslate()
    //const dataProvider = useDataProvider()
    const refresh = useRefresh()
    return <CardActions>
        {bulkActions && React.cloneElement(bulkActions, {
            basePath,
            filterValues,
            resource,
            selectedIds,
            onUnselectItems,
        })}
        {filters && React.cloneElement(filters, {
            resource,
            showFilter,
            displayedFilters,
            filterValues,
            context: 'button',
        })}
        <Button variant="contained" style={{ color: "#b71c1c" }} onClick={async () => {
            try {
                await _adsClients.adsDataProvider.write('$(GM_BASE).Alarm.Control.ResetAlarms', true)
                await new Promise(r => setTimeout(r, 2000))
                await _adsClients.adsDataProvider.write('$(GM_BASE).Alarm.Control.ResetAlarms', false)
                await new Promise(r => setTimeout(r, 2000))
                refresh()
            } catch (e) {                
            }
        }} startIcon={<ResetAlarmIcon />} >{translate('custom.resetAllAlarms')}</Button>
        <Button variant="contained" style={{ color: "#b71c1c" }} onClick={async () => {
            try {
                await _adsClients.adsDataProvider.write('Globals.AlarmLog.Head', 0)
                await _adsClients.adsDataProvider.write('Globals.AlarmLog.Tail', 0)
                refresh()
            } catch (e) {                
            }
        }} startIcon={<ResetAlarmIcon />} >{translate('custom.deleteAllAlarms')}</Button>
        <ExportButton variant="contained"
            disabled={total === 0}
            resource={resource}
            sort={currentSort}
            filter={filterValues}
            exporter={exporter}
        />
    </CardActions>
}

/*
const AlarmBulkActionButtons = (props: any) => {
    const translate = useTranslate();
    return <Fragment>
        <ResetAlarmsButton label={ translate('custom.ackAlarm') } icon={ <VolumeOff /> } {...props} />
        <ResetAlarmsButton label={ translate('custom.resetAlarm') } icon={ <ResetAlarmIcon /> } {...props} />
        <BulkDeleteButton {...props} />
    </Fragment>
}
*/

export const AlarmList = (props: any) => {
    const translate = useTranslate();
    const locale = useLocale()
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

    return (
        <List {...props} actions={<AlarmActions />} bulkActionButtons={false} title={ getTitleText((props as any).resource, translate, isSmall) } filters={<AlarmFilter />} sort={{ field: 'time', order: 'DESC' }} >
            <Responsive
                small={
                    <SimpleList linkType={"none"}
                        primaryText={(record: any) => moment(record?.time).format('YYYY-MM-DD HH:mm:ss')}
                        secondaryText={(record: any) => record?.message}
                        tertiaryText={(record: any) => ''}
                    />
                }
                medium={
                    <Datagrid >
                        <DateField source="time" showTime locales={ locale }/>
                        <TagsField  source="alarms" alarm/>
                        <TagsField  source="status" />
                        <FunctionField source="json" label={translate('custom.details')} render={(record: any) => ( (record.json && record.json !== '') ? <ReactJson displayDataTypes={ false } displayObjectSize={ false } theme="bright:inverted" name={false} collapsed enableClipboard={false} src={ JSON.parse(record.json) } /> : <div/>) } />
                        <TextField source="notes" />
                        {/*}
                        <BooleanField source="acknowledged" />
                        <TextField source="acknowledgedBy" />
                        <DateField source="acknowledgedTime" />
                        <BooleanField source="reset" />
                        <TextField source="resetBy" />
                        <DateField source="resetTime" />
                        {*/}
                        <ShowButton />
                        <EditButton />
                    </Datagrid>
                }
            />
        </List>
    )
}

const getAlarmColor = (name: string) => {
    let result: string = 'black'
    switch (name[0]) {
        case 'A':
            result = 'red'
            break
        case 'B':
            result = 'orange'
            break
        case 'C':
            result = 'olive'
            break
        }
    return result
}

const TagsField = ({ source, record, alarm }: any) => (
    record ? (record[source]?.length ?  <span> 
        { record[source].map((item: any) => (
            <p style={{ color: getAlarmColor(item.name) }} key={item.name}><b>{ alarm ? "⚠️ " + item.name : item.name}</b></p>
        ))}
     </span> : <p><b>{ `No ${ source }` }</b></p>) : <span></span>
)
TagsField.defaultProps = {
    addLabel: true
}

const OldTagsField = ({ record }: any) => (
    record.alarms.length ? <ul>
        {record.alarms.map((item: any) => (
            <li key={item.name}>{item.name}</li>
        ))}
    </ul> : <span>No alarms</span>
)
OldTagsField.defaultProps = {
    addLabel: true
}

export const AlarmShow = (props: JSX.IntrinsicAttributes) => (
    <Show actions={<ListActions />} title={<AlarmTitle />} {...props}>
        <SimpleShowLayout>
            <DateField source="time" showTime />
            <ArrayField source="alarms" >
                <Datagrid>
                    <TextField source="name" />
                </Datagrid>
            </ArrayField>
            <BooleanField source="acknowledged" />
            <TextField source="acknowledgedBy" />
            <DateField source="acknowledgedTime" />
            <BooleanField source="reset" />
            <TextField source="resetBy" />
            <DateField source="resetTime" />
            <TextField source="notes" />
        </SimpleShowLayout>
    </Show>
)

const AlarmTitle = ({ record }: { record?: any }) => {
    return <span>Alarm {record ? moment(record.time).format('YYYY-MM-DD HH:mm:ss') : ""}</span>
}

export const AlarmEdit = (props: JSX.IntrinsicAttributes) => (
    <Edit actions={<ListShowActions />} title={<AlarmTitle />} {...props} transform={ (data: any) => { 
            let mod = { ...data }
            try {
                if (mod?.acknowledgedTime?.getYear() === 1970 && mod.acknowledged) {
                    mod.acknowledgedTime = Date.now()
                    mod.acknowledgedBy = sessionStorage.removeItem('userName')
                }
                if (mod?.resetTime?.getYear() === 1970 && mod.reset) {
                    mod.resetTime = Date.now()
                    mod.resetBy = sessionStorage.removeItem('userName')
                }
            } catch (e) {
            }
            return mod
        }}>
        <SimpleForm>
            <ArrayField source="alarms" >
                <Datagrid>
                    <TextField source="name" />
                </Datagrid>
            </ArrayField>
            <BooleanInput source="acknowledged" />
            <TextField source="acknowledgedBy" />
            <DateField source="acknowledgedTime" />
            <BooleanInput source="reset" />
            <TextField source="resetBy" />
            <DateField source="resetTime" />
            <TextInput source="notes" />
        </SimpleForm>
    </Edit>
);

