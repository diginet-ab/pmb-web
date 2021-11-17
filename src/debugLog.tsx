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
    Responsive,
    SimpleList,
    useTranslate,
    Datagrid,
} from "react-admin"
import { ListActions } from "./CommonActions"
import moment from "moment"
import { getTitleText } from "./parameterList"
import { useMediaQuery } from "@material-ui/core"

const DebugLogFilter = (props: any) => {
    return <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
}

export const DebugLogList = (props: any) => {
    const translate = useTranslate();

    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    return (
        <List {...props} title={getTitleText((props as any).resource, translate, isSmall)} filters={<DebugLogFilter />} sort={{ field: 'time', order: 'DESC' }} >
            <Responsive
                small={
                    <SimpleList linkType={"none"}
                        primaryText={(record: any) => record?.time}
                        secondaryText={(record: any) => record?.message}
                        tertiaryText={(record: any) => ''}
                    />
                }
                medium={
                    <Datagrid >
                        <DateField source="time" showTime />
                        <TextField source="message" />
                        <TextField source="stack" />
                        <ShowButton />
                    </Datagrid>
                }
            />
        </List>
    )
}

export const DebugLogShow = (props: JSX.IntrinsicAttributes) => (
    <Show actions={<ListActions />} title={<DebugLogTitle />} {...props}>
        <SimpleShowLayout>
            <DateField source="time" showTime />
            <TextField source="message" />
            <TextField source="stack" />
        </SimpleShowLayout>
    </Show>
)

const DebugLogTitle = ({ record }: { record?: any }) => {
    return <span>DebugLog {record ? moment(record?.time).format('YYYY-MM-DD HH:mm:ss') : ""}</span>
}
