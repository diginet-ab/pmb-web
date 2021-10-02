//import moment from 'moment';
import React, { FC, useEffect, useRef, useState } from 'react';
import {
    NumberInput, SelectField, useRedirect, useNotify, ExportButton, BooleanInput, BooleanField, useLocale, FunctionField, ReferenceInput, SelectInput, Show, SimpleShowLayout, TextField, TextInput, Filter,
    useTranslate, useDataProvider, useRefresh, usePermissions, AutocompleteInput, Pagination, useListContext, List, SimpleList, Datagrid, ArrayField, ShowButton, EditButton
} from 'react-admin';
import { ListEditActions, ListShowActions } from "./CommonActions"
import { Button, CardActions, Checkbox, makeStyles, Toolbar, Tooltip, Typography, useMediaQuery } from '@material-ui/core';
import InputFiles from './InputFiles';
import neatCsv from 'neat-csv';
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import moment from 'moment';
import removeTrailingZeros from 'remove-trailing-zeros'
import { ParameterListSmall } from './ParameterListSmall';
import { EditableDatagrid, RowForm } from '@react-admin/ra-editable-datagrid'
import { clearIntervalAsync, setIntervalAsync } from 'set-interval-async/fixed';
import { SelectColumnsButton, useSelectedColumns, usePreferences } from '@react-admin/ra-preferences'
import momentDurationFormatSetup from 'moment-duration-format'
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { appInfo } from './App';
//import { DataProviderContext } from 'react-admin';
import { EditNode, SimpleForm, TreeWithDetails, TreeWithDetailsProps, useTreeController, NodeActions } from '@react-admin/ra-tree'
import { ParameterList as ParameterGridList } from './parameterList'

momentDurationFormatSetup(moment)

const ParameterFilter = (props: any) => {
    const translate = useTranslate()
    return <Filter {...props}>
        <TextInput label={translate('pos.search')} source="q" alwaysOn />
        <ReferenceInput source="path1Id" reference="path1" filter={{ source: props.resource }} sort={{ field: 'path', order: 'ASC' }} perPage={1000} label={translate("custom.grouping")} >
            <SelectInput optionText="id" />
        </ReferenceInput>
        <ReferenceInput source="path2Id" reference="path2" filter={{ source: props.resource }} sort={{ field: 'path', order: 'ASC' }} perPage={1000} label={translate("custom.subGrouping")} >
            <SelectInput optionText="id" />
        </ReferenceInput>
        <SelectInput source="type" choices={[
            { id: 'BOOL', name: 'BOOL' },
            { id: 'WORD', name: 'WORD' },
            { id: 'REAL', name: 'REAL' },
            { id: 'LREAL', name: 'LREAL' },
            { id: 'TIME', name: 'TIME' },
            { id: 'LTIME', name: 'LTIME' },
            { id: 'STRING', name: 'STRING' },
        ]} />
        <ReferenceInput source="component" reference="component" filter={{ EN: true }} label={translate("custom.component")} >
            <SelectInput optionText="name" />
        </ReferenceInput>
    </Filter>
}

const formatValue = (value: any, record: any, editValue: boolean = false) => {
    let result = value
    if (!editValue) {
        if (typeof value === 'boolean')
            result = value ? '1' : '0'
        else if (record?.enumInfo)
            result = value
        else if (typeof record?.value === 'number') {
            let v = value as number
            if (record?.commentOptions?.scale) {
                let ranges = record.commentOptions.scale.split(' ')
                if (ranges.length === 4 && ranges[1] !== ranges[0]) {
                    v = (v / (ranges[1] - ranges[0])) * (ranges[3] - ranges[2])
                }
            }
            //result = v.toFixed(record.decimals ? record.decimals : 1)
            if (record.type === 'LREAL' || record.type === 'REAL')
                result = v.toFixed(record.decimals ? record.decimals : 1)
            else
                result = v.toFixed(0)
            result = removeTrailingZeros(result)
        } else if (record?.commentOptions?.time) {
            let duration = moment.duration(value)
            result = (duration as any).format(record.commentOptions.time)
        } else if (record?.type === 'TIME') {
            let duration = moment.duration(record.value)
            result = duration.asSeconds().toString()
        }
    }
    return result
}

let updateOnChange = false

const ParameterActions = ({
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
    const locale = useLocale()
    const { permissions } = usePermissions()
    const dataProvider = useDataProvider()
    const refresh = useRefresh()
    const [checked, setChecked] = useState(false)
    useEffect(() => {
        updateOnChange = checked
    }, [checked])
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
        <ExportButton variant="contained"
            disabled={total === 0}
            resource={resource}
            sort={currentSort}
            filter={filterValues}
            exporter={exporter}
        />
        <InputFiles onChange={async (files: any) => {
            try {
                let str = await files[0].text()
                let items = await neatCsv(str)
                for (let item of items)
                    delete item._id
                await dataProvider.create('siteName', { data: items })
                refresh()
            } catch (e) {
            }
        }}>
            <Tooltip title="Upload">
                <CloudUploadIcon color="primary" />
            </Tooltip>
            {/*}<Button variant="contained" style={{ color: "#b71c1c" }} startIcon={<CloudUploadIcon />} >{translate('custom.import')}</Button>{*/}
        </InputFiles>
        <SelectColumnsButton
            preference="parameter.list.columns"
            columns={getParameterListColumns(locale, permissions)}
        />
        <div>
            <Tooltip title="Write on change">
                <Checkbox color="primary"
                    checked={checked}
                    onChange={event => setChecked(event.target.checked)}
                />
            </Tooltip>
            {/*}<FormControlLabel 
                control={
                    <Checkbox 
                        checked={checked} 
                        onChange={event => setChecked(event.target.checked)} 
                    />
                }
                label="Fast write"
            />{*/}
        </div>
    </CardActions>
}

export const CustomListValueField = (props: any) => {

    let result: JSX.Element
    if (typeof props.record.value === 'boolean')
        result = <BooleanField {...props} />
    else
        result = <FunctionField {...props} render={(record: any) => formatValue(record.value, record, true)} />
    return result
}

export const CustomValueField = (props: any) => {
    const translate = useTranslate()
    let result: JSX.Element = <div>{props.record.value}</div>
    if (typeof props.record.value === 'boolean')
        result = <BooleanField {...props} />
    else if (typeof props.record.value === 'number')
        result = <FunctionField {...props} render={(record: any) => formatValue(record.value, record)} />
    return <div >
        <div style={{ fontSize: '60%' }}>{translate('resources.parameter.fields.value')}</div>
        <div style={{ fontSize: '75%' }}>{result}</div>
    </div>
}

const getParameterListColumns = (locale: string, permissions: number) => {
    let columns = {
        path: <FunctionField source="path" label='resources.parameter.fields.group' render={(record: any) => (record.path as string).substring(0, (record.path as string).lastIndexOf('.'))} />,
        name: <TextField source="name" />,
        value: <CustomListValueField source="value" />,
        type: <TextField source="type" />,
        unit: <FunctionField source="unit" render={(record: any) => record.commentOptions.unit ? record.commentOptions.unit : record.type === 'TIME' ? 's' : ''} />,
        siteName: <TextField source="siteName" />,
        comment: <FunctionField source="comment" render={(record: any) => transformLanguage(record.comment, locale)} />,
        component: <TextField source="component" />,
    };
    const restrictedColumns = {
        setup: <BooleanField source="setup" />,
        readPermission: <SelectField source="readPermission" choices={[
            { id: 0, name: 'User' },
            { id: 1, name: 'AdminUser' },
            { id: 2, name: 'SuperUser' },
            { id: 3, name: 'NoOne' },
        ]} />,
        writePermission: <SelectField source="writePermission" choices={[
            { id: 0, name: 'User' },
            { id: 1, name: 'AdminUser' },
            { id: 2, name: 'SuperUser' },
            { id: 3, name: 'NoOne' },
        ]} />,
    }
    if (permissions >= 2)
        columns = { ...columns, ...restrictedColumns }
    return columns
}

export const getTitleText = (resource: string, translate: (resource: string) => string, isSmall: boolean) => {
    let result = ''
    if (!isSmall)
        result = translate('custom.title') + ' ' + appInfo.hostName + " / " + translate('resources.' + resource + '.name')
    else
        result = appInfo.hostName + " / " + translate('resources.' + resource + '.name')
    return result
}

const ParameterPagination = (props: any) => <Pagination rowsPerPageOptions={[10, 25, 50, 100]} {...props} />

const PostPagination = (props: any) => {
    const { page, perPage, total, setPage } = useListContext()
    const nbPages = Math.ceil(total / perPage) || 1
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    return (
        isSmall ? <Toolbar>
            {(page > 1 && nbPages > 1) &&
                <Button color="primary" key="prev" onClick={() => setPage(page - 1)}>
                    <ChevronLeft />
                    Prev
                </Button>
            }
            {(page !== nbPages && nbPages > 1) &&
                <Button color="primary" key="next" onClick={() => setPage(page + 1)}>
                    Next
                    <ChevronRight />
                </Button>
            }
            <Typography color="primary" >Page {page} of {nbPages} ({perPage} per page)</Typography>
        </Toolbar>
            :
            <ParameterPagination {...props} />
    )
}

const useStyles = makeStyles({
    root: {
        '& .MuiCardContent-root': {
            overflowY: 'auto',
            maxHeight: '80vh', // You might have to tweak this value
        }
    }
})

const MyTreeWithDetails = (props: TreeWithDetailsProps) => {
    const classes = useStyles(props);
    return <TreeWithDetails {...props} className={classes.root} />
 }

export const ParameterList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate()
    const locale = useLocale()
    const { permissions } = usePermissions()
    //const dataProvider = useDataProvider()
    //const dataProvider2 = useContext(DataProviderContext) as any
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    const columns = useSelectedColumns({
        preferences: 'parameter.list.columns',
        columns: getParameterListColumns(locale, permissions),
        omit: ['setup, readPermission, writePermission'],
    });

    const { handleExpand } = useTreeController({
        resource: (props as any).resource as string,
        titleField: 'name',
    });

    useEffect(() => {
        handleExpand(['5']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);    
    /*
    (async () => {
        let result = await dataProvider.getList('component', {})
        console.log('dataProvider: ' + result)
    })()
    ;(async () => {
        let result = await dataProvider2.getList('io', {})
        console.log('dataProvider2: ' + result)
    })()
    */
    return <MyTreeWithDetails {...props} allowMultipleRoots titleField="title" showLine nodeActions={<MyActions />}
        edit={ParameterEdit}        
        title={getTitleText((props as any).resource, translate, isSmall)}
        />
}

const MyActions = (props: any) => (
    <NodeActions {...props}>
    </NodeActions>
  )

// const rowClick = (id: string, basePath: string, record: any) => 'edit' // record.write ? 'edit' : 'show'

export const transformLanguage = (comment: string, locale?: string) => {
    let result = comment === undefined ? "" : comment
    if (result) {
        let langs = result.split('||||')
        if (locale === 'en')
            result = langs[0]
        if (langs.length > 1 && locale === 'sv')
            result = langs[1]
    }
    return result
}

export const getUnit = (comment: string, locale?: string) => {
    return ''
}
/*
const ConditionalEditButton = (props: any) => {
    const { permissions } = usePermissions()
    return (props.record.writePermission <= permissions) ? <EditButton {...props} /> : <span></span>
}
*/
export const ParameterShow = (props: JSX.IntrinsicAttributes) => {
    const locale = useLocale()
    const { permissions } = usePermissions()
    return <Show actions={<ListEditActions />} title={<ParameterTitle />} {...props}>
        <SimpleShowLayout>
            <TextField source="name" />
            <TextField source="path" />
            <TextField source="component" />
            <CustomValueField source="value" />
            <TextField source="type" />
            <TextField source="siteName" />
            <FunctionField source="comment" render={(record: any) => transformLanguage(record.comment, locale)} />
            {permissions >= 2 && <BooleanField source="setup" />}
            {permissions >= 2 && <SelectField source="readPermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
            {permissions >= 2 && <SelectField source="writePermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
        </SimpleShowLayout>
    </Show>
}

const ParameterTitle = ({ record }: { record?: any }) => {
    return <span>Parameter {record ? record.name : ''}</span>;
}

/*
const Aside = () => {
    const [checked, setChecked] = useState(false)
    useEffect(() => {
        updateOnChange = checked
    }, [checked])
    return <div style={{ width: 200, margin: '1em' }}>
        <Tooltip title="Write on change">
            <Checkbox style={{ padding: '3x' }} size="small" color="secondary" checked={checked} onChange={event => setChecked(event.target.checked)} name="checkedG" inputProps={{ 'aria-label': 'primary checkbox' }} />
        </Tooltip>
    </div>
}
*/

export const ParameterEdit = (props: JSX.IntrinsicAttributes) => {
    const locale = useLocale()
    const refresh = useRefresh()
    const redirect = useRedirect()
    const notify = useNotify()
    const permissions = usePermissions()
    const dataProvider = useDataProvider()
    const [item, setItem] = useState<any | undefined>()
    const [loading, setLoading] = useState("")
    const [error, setError] = useState<any | undefined>()
    useEffect(() => {
        (async () => {
            try {
                const data = await dataProvider.getOne((props as any).resource, { id: (props as any).id })
                if (data && data.data) {
                    data.data.props_id = (props as any).id
                    setItem(data.data);
                }
                setLoading((props as any).id);
            } catch (error) {
                console.log(error)
                setError(error);
                //setLoading("");
            }
        })()
    }, [dataProvider, (props as any).resource, (props as any).id])
    if (!item || item.props_id !== (props as any).id) {
        return <div/>
    }
    return <>
        { item.id ? <EditNode /*aside={<Aside />}*/ undoable={false} actions={<ListShowActions />} title={<ParameterTitle />} {...props} onSuccess={(rec: any) => {
        notify(`Changes to parameter "${rec.data.path}" saved`)
        redirect(`/${(props as any).resource}`)
        refresh()
    }} onFailure={(rec: any) => {
        notify(`Changes to parameter "${rec.data.path}" FAILED`, 'warning')
        redirect(`/${(props as any).resource}`)
        refresh()
    }} ><SimpleForm>
            <TextField source="name" />
            <TextField source="path" />
            <TextField source="component" />
            <CustomInput source="value" />
            <TextField source="type" />
            <TextInput source="siteName" />
            <FunctionField source="comment" render={(record: any) => transformLanguage(record.comment, locale)} />
            {permissions >= 2 && <BooleanField source="setup" />}
            {permissions >= 2 && <SelectField source="readPermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
            {permissions >= 2 && <SelectField source="writePermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
        </SimpleForm></EditNode> : <ParameterGridList {...props} filter={{ z: `${ (props as any).id }` }} />}
    </>
}

const TestList = (props: any) => {
    const translate = useTranslate()
    const isSmall = useMediaQuery(theme => (theme as any).breakpoints.down('sm'))
    return <List {...props} title={getTitleText((props as any).resource, translate, isSmall)} sort={{ field: 'path', order: 'ASC' }} >
    {isSmall ? (
        <SimpleList
            primaryText={(record: any) => record?.name}
            secondaryText={(record: any) => record?.phone ? `Phone ${record.phone}` : ""}
            tertiaryText={(record: any) => record?.email}
        />
    ) : (
            <Datagrid rowClick="toggleSelection">
                <TextField source="path" />
                <CustomListValueField source="value" />
                <TextField source="type" />
                <ShowButton />
                <ConditionalEditButton />
            </Datagrid>
        )}
</List>
}

const ConditionalEditButton = (props: any) => {
    return !props.record.required ? <EditButton {...props} /> : <span></span>
}

const CustomInput = (props: any) => {
    const dataProvider = useDataProvider()
    const refValue = useRef(null as any)
    useEffect(() => {
        let interval = setIntervalAsync(async () => {
            try {
                if (updateOnChange && props.record.value !== refValue.current) {
                    if (refValue.current !== null) {
                        props.record.value = refValue.current
                        await dataProvider.update(props.resource, { id: props.record.id, data: props.record })
                    }
                }
            } catch (e) {
            }

        }, 500)
        return () => { clearIntervalAsync(interval) }
    }, [refValue, dataProvider, props.record, props.resource])
    const doChange = (item: any) => {
        refValue.current = item
        //console.log(item)
        return item
    }
    let result = <TextInput {...props} onChange={doChange} />
    if (typeof props.record.value === 'boolean')
        result = <BooleanInput {...props} onChange={doChange} />
    else if (props.record.enumInfo) {
        let choices = [
            ...(props.record.enumInfo.map((item: any) => ({ id: item.name, name: item.name })))
        ]
        result = <AutocompleteInput {...props} optionText="name" optionValue="id" choices={choices} translateChoice={false} />
    } else if (typeof props.record.value === 'number') {
        result = <NumberInput
            {...props}
            min={props.record.commentOptions.min ? props.record.commentOptions.min : undefined}
            max={props.record.commentOptions.max ? props.record.commentOptions.max : undefined}
            step={props.record.commentOptions.step ? props.record.commentOptions.step : undefined}
            format={(v: any) => formatValue(v, props.record, true)} parse={(item: string) => {
                return item //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                // eslint-disable-next-line no-unreachable
                let v = parseFloat(item)
                if (props.record?.commentOptions) {
                    if (props.record.commentOptions.min !== undefined && v < props.record.commentOptions.min)
                        v = props.record.commentOptions.min
                    if (props.record?.commentOptions.max !== undefined && v > props.record.commentOptions.max)
                        v = props.record.commentOptions.max
                }
                if (props.record?.commentOptions?.scale) {
                    let ranges = props.record.commentOptions.scale.split(' ')
                    if (ranges.length === 4 && ranges[3] !== ranges[2]) {
                        v = (v / (ranges[3] - ranges[2])) * (ranges[1] - ranges[0])
                    }
                }
                refValue.current = v
                return v
            }} autoComplete="off" />
    }
    return result
}

const EditForm: FC = props => {
    const permissions = usePermissions()
    const locale = useLocale()
    const [columns] = usePreferences('parameter.list.columns')
    return (
        <RowForm {...props}>
            { columns.includes('path') && <TextField source="path" />}
            { columns.includes('name') && <TextField source="name" />}
            { columns.includes('value') && <CustomInput source="value" />}
            { columns.includes('type') && <TextField source="type" />}
            { columns.includes('unit') && <TextField source="unit" />}
            { columns.includes('siteName') && <TextInput source="siteName" />}
            { columns.includes('comment') && <FunctionField source="comment" label="Comment" render={(record: any) => transformLanguage(record.comment, locale)} />}
            { columns.includes('component') && <TextField source="component" />}
            { columns.includes('setup') && permissions >= 2 && <BooleanField source="setup" />}
            { columns.includes('readPermission') && permissions >= 2 && <SelectField source="readPermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
            { columns.includes('writePermission') && permissions >= 2 && <SelectField source="writePermission" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
                { id: 3, name: 'NoOne' },
            ]} />}
        </RowForm>
    );
}
