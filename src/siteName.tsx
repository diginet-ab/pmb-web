//import moment from 'moment';
import { Button, CardActions, useMediaQuery } from '@material-ui/core';
import React, { } from 'react';
import {
    ExportButton, Show, SimpleShowLayout, List, Datagrid, TextField, EditButton, SimpleForm, TextInput, Edit, Filter,
    Responsive, SimpleList, useTranslate, useDataProvider, useRefresh
} from 'react-admin';
import { ListEditActions, ListShowActions } from "./CommonActions"
import InputFiles from './InputFiles'
import CloudUploadIcon from '@material-ui/icons/CloudUpload'
import neatCsv from 'neat-csv'
import { getTitleText } from './parameter';

const SiteNameFilter = (props: any) => {
    return <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
}

const SiteNameActions = ({
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
    const translate = useTranslate()
    const dataProvider = useDataProvider()
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
            } catch(e) {                
            }
        }}>
            <Button variant="contained" style={{ color: "#b71c1c" }} startIcon={<CloudUploadIcon />} >{ translate('custom.import') }</Button>
        </InputFiles>
    </CardActions>
}

export const SiteNameList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate()
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    return <List {...props} actions={<SiteNameActions />}
        title={ getTitleText((props as any).resource, translate, isSmall) }
        filters={<SiteNameFilter />}
        sort={{ field: 'path', order: 'ASC' }}
    >
        <Responsive
            small={
                <SimpleList
                    primaryText={(record: any) => record?.path}
                    secondaryText={(record: any) => (record?.siteName)}
                    tertiaryText={(record: any) => ''}
                />
            }
            medium={
                <Datagrid rowClick="edit">
                    <TextField source="path" />
                    <TextField source="siteName" />
                    <EditButton />
                </Datagrid>
            }
        />
    </List>
}

export const SiteNameShow = (props: JSX.IntrinsicAttributes) => {
    return <Show actions={<ListEditActions />} title={<SiteNameTitle />} {...props}>
        <SimpleShowLayout>
            <TextField source="path" />
            <TextField source="siteName" />
        </SimpleShowLayout>
    </Show>
}

const SiteNameTitle = ({ record }: { record?: any }) => {
    return <span>SiteName {record ? record.name : ''}</span>;
};

export const SiteNameEdit = (props: JSX.IntrinsicAttributes) => {
    return <Edit actions={<ListShowActions />} title={<SiteNameTitle />} {...props}>
        <SimpleForm>
            <TextField source="path" />
            <TextInput source="siteName" />
        </SimpleForm>
    </Edit>
}

