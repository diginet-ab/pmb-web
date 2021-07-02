import React from "react"
import {
    DateField,
    ShowButton,
    Show,
    SimpleShowLayout,
    NumberField,
    UrlField,
    PasswordField,
    DateInput,
    List,
    Datagrid,
    TextField,
    ReferenceField,
    EditButton,
    SimpleForm,
    ReferenceInput,
    SelectInput,
    TextInput,
    Edit,
    Create,
    Filter,
    Responsive,
    SimpleList
} from "react-admin"
import { ListActions, ListEditActions, ListShowActions } from "./CommonActions"
import { translate } from "ra-core"
import { useLocale } from "react-admin"

const LogFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
)

export const LogList = (props: any) => {
    const locale = useLocale()
    return <List {...props} filters={<LogFilter />}>
        <Responsive
            small={
                <SimpleList
                    primaryText={(record: any) => `${record.timestamp}`}
                    secondaryText={(record: any) => `${record.messageTemplate}`}
                    tertiaryText={(record: any) => ""}
                />
            }
            medium={
                <Datagrid>
                    <DateField source="timestamp" showTime locales={locale}/>
                    <NumberField source="level" />
                    <TextField source="messageTemplate" />
                    <ShowButton />
                </Datagrid>
            }
        />
    </List>
}

export const LogShow = (props: JSX.IntrinsicAttributes) => (
    <Show actions={<ListEditActions />} title={<LogTitle />} {...props}>
        <SimpleShowLayout>
            <DateField source="timestamp" showTime />
            <NumberField source="level" />
            <TextField source="messageTemplate" />
        </SimpleShowLayout>
    </Show>
)

const LogTitle = ({ record }: { record?: any }) => {
    return <span>Log {record ? record.timestamp : ""}</span>
}
