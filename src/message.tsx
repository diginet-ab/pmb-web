import React, { useState, useEffect, useRef } from "react"
import {
    EmailField,
    ShowButton,
    Show,
    SimpleShowLayout,
    UrlField,
    PasswordField,
    List,
    Datagrid,
    TextField,
    NumberField,
    DateField,
    DateTimeInput,
    ReferenceField,
    EditButton,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    TextInput,
    NumberInput,
    DateInput,
    Edit,
    Create,
    Filter,
    Responsive,
    ReferenceManyField,
    SingleFieldList,
    SimpleList,
    translate,
    useTranslate,
} from "react-admin"
import { ListActions, ListEditActions, ListShowActions } from "./CommonActions"
import moment from 'moment'
import EventLinkField from './EventLinkField'
import StatusInfoField from './StatusInfoField'

const MessageFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
        <DateInput source="time_gte" label="custom.dateAfter" />
        <TextInput source="time_gte_x" label="custom.timeAfter" />
        <DateInput source="time_lte" label="custom.dateBefore" />
        <TextInput source="time_lte_x" label="custom.timeBefore" />
        <TextInput source="providerMessageId" />
        <ReferenceInput source="userId" reference="user">
                <SelectInput optionText="name" />
        </ReferenceInput>
        <ReferenceInput source="providerId" reference="provider">
            <SelectInput optionText="name" />
        </ReferenceInput>
        <TextInput source="to" />
        <TextInput source="from" />
        <TextInput source="status" />
        <TextInput source="content" />
        <TextInput source="metaData" />
    </Filter>
)

export const MessageList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate();
    return <List {...props} filters={<MessageFilter />} sort={{ field: 'timeCreated', order: 'DESC' }} >
        <Responsive
            small={<SimpleList rowClick="show"
                        primaryText={(record: any) => (
                            `Sent ${moment.utc(record.timeCreated).format("YYYY-MM-DD HH:mm.ss")} (${moment(record.timeCreated).fromNow()})`
                        )}
                        secondaryText={(record: any) => {
                            let items = []
                            items.push("From ")
                            items.push(<ReferenceField source="userId" reference="user" basePath="user" record={record} link="show" >
                                    <TextField source="name" />
                                </ReferenceField>)
                            items.push(" (")
                            items.push(record.from)
                            items.push(") to ")
                            items.push(record.to)
                            items.push(<div>{`Ref ID ${ record.referenceId}`}</div>)
                            if (record.providerId) {
                                items.push(<div>
                                    <ReferenceField source="providerId" reference="provider" basePath="provider" record={record} link="show" >
                                        <TextField source="name" />
                                    </ReferenceField>
                                    { record.providerMessageId ?
                                        <span>{` ID: ${record.providerMessageId}`}</span>
                                        : null
                                    }
                                </div>)
                            }
                            items.push(<span>{`Updated ${moment.utc(record.timeStatus).format("YYYY-MM-DD HH:mm.ss")} (${moment(record.timeStatus).fromNow()})`}</span>)
                            return items
                        }}
                        tertiaryText={(record: any) => record.status}
            />}
            medium={
                <Datagrid>
                    <TextField source="id"/>
                    <DateField source="timeCreated" label={ translate("resources.message.fields.timeCreated") } showTime />
                    <ReferenceField source="userId" reference="user" link="show" label={ translate("resources.message.fields.userId") } >
                        <TextField source="name" />
                    </ReferenceField>
                    <TextField source="from" label={ translate("resources.message.fields.from") } />
                    <TextField source="to" label={ translate("resources.message.fields.to") } />
                    <TextField source="status" label={ translate("resources.message.fields.status") } />
                    <NumberField source="statusCode" label={ translate("resources.message.fields.statusCode") } />
                    <DateField source="timeStatus" label={ translate("resources.message.fields.timeStatus") } showTime />
                    <ReferenceManyField label="Events" reference="event" target="messageId">
                        <SingleFieldList  linkType="show">
                            <StatusInfoField time="time" source="status" source2="statusCode" />
                        </SingleFieldList>
                    </ReferenceManyField>
                    <EventLinkField source="referenceId" label={ translate("resources.message.fields.referenceId") } />
                    <ReferenceField source="providerId" reference="provider" link="show" label={ translate("resources.message.fields.providerId") } >
                        <TextField source="name" />
                    </ReferenceField>
                    <EventLinkField source="providerMessageId" label={ translate("resources.message.fields.providerMessageId") } />
                    <ShowButton />
                </Datagrid>
            }
        />
    </List>
}

export const MessageShow = (props: any) => {
    const translate = useTranslate()
    return <Show actions={<ListActions />} title={<MessageTitle />} {...props}>
        <SimpleShowLayout>
            <DateField source="timeCreated" label={ translate("resources.message.fields.timeCreated") } showTime />
            <TextField source="to" />
            <TextField source="from" />
            <ReferenceField source="userId" reference="user" link="" >
                <TextField source="name" />
            </ReferenceField>
            <TextField source="status" />
            <NumberField source="statusCode" />
            <DateField source="timeStatus" label={ translate("resources.message.fields.timeStatus") } showTime />
            <ReferenceField source="providerId" reference="provider" link="" >
                <TextField source="name" />
            </ReferenceField>
            <EventLinkField source="providerMessageId" />
            <EventLinkField source="referenceId" />
            <TextField source="content" />
            <TextField source="metaData" />
        </SimpleShowLayout>
    </Show>
}

const MessageTitle = translate(({ translate, record }: { translate?: any, record?: any }) => {
    return <span>{translate("custom.message")} {translate("custom.to")} {record ? record.to : ""}</span>
})

export const MessageEdit = (props: JSX.IntrinsicAttributes) => (
    <Edit actions={<ListShowActions />} title={<MessageTitle />} {...props}>
        <SimpleForm>
            <ReferenceInput source="userId" reference="user">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="providerId" reference="provider">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <TextInput source="providerMessageId" />
            <TextInput source="to" />
            <TextInput source="from" />
            <TextInput source="status" />
            <NumberInput source="status" />
            <TextInput source="content" />
            <TextInput source="metaData" />
        </SimpleForm>
    </Edit>
)

export const MessageCreate = (props: JSX.IntrinsicAttributes) => (
    <Create actions={<ListActions />} {...props}>
        <SimpleForm>
            <ReferenceInput source="userId" reference="user">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput source="providerId" reference="provider">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <TextInput source="to" />
            <TextInput source="from" />
            <TextInput source="status" />
            <NumberInput source="status" />
            <TextInput source="content" />
            <TextInput source="metaData" />
            <TextInput source="status" />
        </SimpleForm>
    </Create>
)
