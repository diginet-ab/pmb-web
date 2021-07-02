import * as React from 'react';
import { useListContext, TextField, EditButton } from 'react-admin';
import { Card, CardContent, Box } from '@material-ui/core';
//import { LetterB, LetterE, LetterN, LetterS, LetterT } from './svg/Letters';
import { CustomValueField } from './parameter';
import { useTranslate } from 'react-admin';

/*
const getTypeIcon = (aType: string) => {
    let result = <LetterE />
    switch (aType) {
        case 'BOOL':
            result = <LetterB />
            break;
        case 'TIME':
        case 'LTIME':
            result = <LetterT />
            break;
        case 'BYTE':
        case 'WORD':
        case 'DWORD':
        case 'SINT':
        case 'INT':
        case 'UINT':
        case 'DINT':
        case 'UDINT':
        case 'LINT':
        case 'ULINT':
        case 'REAL':
        case 'LREAL':
            result = <LetterN />
            break
        default:
            if (aType.indexOf('STRING') >= 0)
                result = <LetterS />
    }
    return result
}
*/

const cardStyle = {
    width: 300,
    minHeight: 20,
    marginTop: '0.5em',
    //display: 'inline-block',
    //verticalAlign: 'top'
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
/*
export const ParameterListSmall = (props: any) => (
    <List title="Parameters" {...props} >
        <ParameterGrid />
    </List>
)
*/
export const ParameterListSmall = (props: any) => (
    <ParameterGrid {...props} />
)