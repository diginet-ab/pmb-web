import React, { useState, useEffect, useRef } from "react"
import {
    SimpleFormIterator,
    ArrayField,
    ArrayInput,
    SelectField,
    ShowButton,
    Show,
    SimpleShowLayout,
    UrlField,
    List,
    Datagrid,
    TextField,
    EditButton,
    SimpleForm,
    SelectInput,
    TextInput,
    Edit,
    Create,
    Filter,
    Responsive,
    SimpleList,
    CloneButton
} from "react-admin"
import { ListActions, ListEditActions, ListShowActions } from "./CommonActions"

const ProviderFilter: any = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <TextInput label="Name" source="Name" />
        <TextInput label="Type" source="Type" />
        <TextInput label="User name" source="userName" />
        <TextInput label="URL" source="url" />
        <TextInput label="Parameters" source="parameters" />
    </Filter>
)

const providerNames = [{ id: "Sergel", name: "Sergel" }, { id: "Telia", name: "Telia" }, { id: "TwentyFirst", name: "21st" }]

const ParametersField = ({ source, record = {} as any}: any) => <span>{ record[source] ? record[source].length : 0 }</span>;

export const ProviderList: any = ({ ...props }) => {
    return <List {...props} filters={<ProviderFilter />} sort={{ field: 'name', order: 'asc' }} >
        <Responsive
            small={<SimpleList primaryText={(record: any) => record.name} secondaryText={(record: any) => `Type ${record.type}${record.userName ? ", user " + record.userName : ""}`} tertiaryText={(record: any) => `${record.url}`} />}
            medium={
                <Datagrid rowClick="edit">
                    <TextField source="id" />
                    <TextField source="name" />
                    <SelectField source="type" choices={providerNames} />
                    <TextField source="userName" />
                    <UrlField source="url" />
                    <ParametersField source="parameters" />
                    <ShowButton />
                    <EditButton />
                    <CloneButton />
                </Datagrid>
            }
        >
        </Responsive>
    </List>
}

const ProviderTitle: any = ({ record }: { record?: any }) => {
    return <span>Provider {record ? record.name : ""}</span>
}

interface State {
}

export class ProviderShow extends React.Component<{ classes: any, translate: any }, State> {
    render() {
        return <Show actions={<ListEditActions />} title={<ProviderTitle />} {...this.props}>
            <SimpleShowLayout style={{ width: '100%'}}>
                <TextField source="name" />
                <SelectField source="type" choices={providerNames} />
                <TextField source="userName" />
                <TextField source="password" type="password" />
                <UrlField source="url" />
                <ArrayField source="parameters">
                    <Datagrid>
                        <TextField source="name" />
                        <TextField source="value" />
                    </Datagrid>
                </ArrayField>
            </SimpleShowLayout>
        </Show>
    }
}

/*
*/

export const ProviderEdit: any = (props: JSX.IntrinsicAttributes) => (
    <Edit actions={<ListShowActions />} title={<ProviderTitle />} {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <SelectInput source="type" choices={providerNames} />
            <TextInput source="userName" />
            <TextInput source="password" type="password" />
            <TextInput source="url" />
            <ArrayInput source="parameters">
                <SimpleFormIterator>
                    <TextInput source="name" />
                    <TextInput source="value" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
)

export const ProviderCreate: any = (props: JSX.IntrinsicAttributes) => (
    <Create actions={<ListActions />} {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <SelectInput source="type" choices={providerNames} />
            <TextInput source="userName" />
            <TextInput source="password" type="password" />
            <TextInput source="url" />
            <ArrayInput source="parameters">
                <SimpleFormIterator>
                    <TextInput source="name" />
                    <TextInput source="value" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Create>
)
