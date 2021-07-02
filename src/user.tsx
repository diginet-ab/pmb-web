import { useMediaQuery } from '@material-ui/core';
import React from 'react';
import {
    SelectInput, SelectField, EmailField, ShowButton, Show, SimpleShowLayout, List, Datagrid, TextField, EditButton, SimpleForm, TextInput, Edit, Create, Filter,
    SimpleList, useTranslate, usePermissions
} from 'react-admin';
import { ListActions, ListShowCloneActions } from "./CommonActions"
import { getTitleText } from './parameter';

const UserFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
);

export const UserList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate()
    const isSmall = useMediaQuery(theme => (theme as any).breakpoints.down('sm'))
    return <List {...props} title={ getTitleText((props as any).resource, translate, isSmall) } filters={<UserFilter />} sort={{ field: 'name', order: 'ASC' }} >
        {isSmall ? (
            <SimpleList
                primaryText={(record: any) => record?.name}
                secondaryText={(record: any) => record?.phone ? `Phone ${record.phone}` : ""}
                tertiaryText={(record: any) => record?.email}
            />
        ) : (
                <Datagrid rowClick="edit">
                    <EmailField source="email" />
                    <TextField source="name" />
                    <TextField source="phone" />
                    <SelectField source="permissions" choices={[
                        { id: 0, name: 'User' },
                        { id: 1, name: 'AdminUser' },
                        { id: 2, name: 'SuperUser' },
                    ]} />
                    <ShowButton />
                    <EditButton />
                </Datagrid>
            )}
    </List>
}

export const UserShow = (props: JSX.IntrinsicAttributes) => {
    return <Show actions={<ListShowCloneActions />} title={<UserTitle />} {...props}>
        <SimpleShowLayout>
            <EmailField source="email" />
            <TextField source="name" />
            <TextField source="phone" />
            <SelectField source="permissions" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                { id: 2, name: 'SuperUser' },
            ]} />
        </SimpleShowLayout>
    </Show>
}

const UserTitle = ({ record }: { record?: any }) => {
    return <span>User {record ? record.name : ''}</span>;
};

export const UserEdit = (props: JSX.IntrinsicAttributes) => {
    const { permissions } = usePermissions()
    return <Edit actions={<ListShowCloneActions />} title={<UserTitle />} {...props}>
        <SimpleForm>
            <TextInput source="email" type="email" label="Email *" />
            <TextInput source="password" type="password" label="Password *" />
            <TextInput source="name" />
            <TextInput source="phone" />
            <SelectInput source="permissions" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                ...(permissions >= 2 ? [{ id: 2, name: 'SuperUser' }] : []),
            ]} />
        </SimpleForm>
    </Edit>
}

export const UserCreate = (props: JSX.IntrinsicAttributes) => {
    const { permissions } = usePermissions()
    return <Create actions={<ListActions />} {...props}>
        <SimpleForm>
            <TextInput source="email" type="email" label="Email *" />
            <TextInput source="password" type="password" label="Password *" />
            <TextInput source="name" />
            <TextInput source="phone" />
            <SelectInput source="permissions" choices={[
                { id: 0, name: 'User' },
                { id: 1, name: 'AdminUser' },
                ...(permissions >= 2 ? [{ id: 2, name: 'SuperUser' }] : []),
            ]} />
        </SimpleForm>
    </Create>
}
