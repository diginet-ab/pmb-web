import * as React from 'react';
import { useListContext, TextField, EditButton } from 'react-admin';
import { Card, CardContent, Box } from '@material-ui/core';
//import { LetterB, LetterE, LetterN, LetterS, LetterT } from './svg/Letters';
import { CustomValueField } from './parameterList';
import { useTranslate } from 'react-admin';

const cardStyle = {
    width: 300,
    minHeight: 20,
    marginTop: '0.5em',
}

const CustomField = (props: any) => {
    let result: JSX.Element = <div>{ props.record.value }</div>
    result = <TextField {...props} />
    return <div style={{ fontSize: '60%' }}>
        <div >{props.label}</div>
        <div>{result}</div>
    </div>
}

const ParameterGrid = () => {
    const translate = useTranslate()
    const { ids, data, basePath } = useListContext()
    return (
        <div style={{ margin: '1em' }}>
            {ids.map((id: any) =>
                <Card key={id} style={cardStyle}>
                    <CardContent>
                        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                            <CustomField record={data[id]} source="name" label={ translate('resources.parameter.fields.name') } />
                            <CustomField record={data[id]} source="siteName" label={ translate('resources.parameter.fields.siteName') }/>
                            <CustomField record={data[id]} source="component" label={ translate('resources.parameter.fields.component') } />
                        </Box>
                        <p />
                        <Box display="flex" flexDirection="row" flexWrap="wrap" justifyContent="space-between">
                            <CustomField record={data[id]} source="type" label={ translate('resources.parameter.fields.type') } />
                            <CustomValueField record={data[id]} source="value" />
                            <EditButton resource="parameter" basePath={basePath} record={data[id]} />
                        </Box>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}

export const ParameterListSmall = (props: any) => (
    <ParameterGrid {...props} />
)