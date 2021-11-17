import { Box, Button, Card, CardContent, CardHeader, makeStyles, Modal, Slide, useMediaQuery } from '@material-ui/core';
import React, { Fragment, useRef, useState } from 'react';
import {
    ArrayInput, SimpleFormIterator, ArrayField, BooleanInput, ShowButton, Show, SimpleShowLayout, List, Datagrid, TextField, EditButton, SimpleForm, TextInput, Edit, Create, Filter,
    SimpleList, useTranslate, BooleanField, BulkDeleteButton
} from 'react-admin';
import { _adsClients } from './AdsDataProvider';
import { ListActions, ListEditActions, ListShowActions } from "./CommonActions"
import { getTitleText } from './parameterList';
import UploadIcon from '@material-ui/icons/CloudUpload'
import DownloadIcon from '@material-ui/icons/CloudDownload'
import { saveAs } from 'file-saver'
import moment from 'moment';
import { useParameter } from './PlcControl'
import rdiff from 'recursive-diff'
import JSON_STR from 'json-stringify-date'
import ReactJson from 'react-json-view';
import lodash from 'lodash'
import deepdash from 'deepdash'
const _ = deepdash(lodash)

const useStyles = makeStyles(theme => ({
    paper: {
        position: 'absolute',
        width: theme.spacing(1) * 50,
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(1) * 4,
    },
}))

function getModalStyle() {
    const top = 25
    const left = 25

    return {
        top: `${top}%`,
        margin: 'auto',
        left: `${left}%`,
        transform: `translate(-${top}%, -${left}%)`,
        maxHeight: '50%',
        overflow: 'auto',
        width: '50%',
    }
}


const ComponentFilter = (props: any) => (
    <Filter {...props}>
        <TextInput label="Search" source="q" alwaysOn />
    </Filter>
);

const ComponentActions = (props: any) => {
    const translate = useTranslate()
    const [systemName] = useParameter('$(GM_BASE).System.Operation.SystemName', 'GM')
    //const [components] = useParameter('GlobalSettings.Components', {})
    const [openDiffDialog, setOpenDiffDialog] = useState(false)
    const [uploadObj, setUploadObj] = useState({})
    const [currentObj, setCurrentObj] = useState({})
    const [arrDiff, setArrDiff] = useState([] as rdiff.rdiffResult[])
    const [arrAccept, setArrAccept] = useState([] as boolean[])
    const [changeIndex, setChangeIndex] = useState(0)
    const [slideDirection, setSlideDirection] = useState('right')
    const classes = useStyles()
    const refFile = useRef<HTMLInputElement>()
    let isDark = false
    let prefs = localStorage.getItem('preferences')
    if (prefs) {
        let p = JSON.parse(prefs)
        isDark = p.theme === 'dark'
    }

    const loadObjs = async () => {
        let sumObj = {} as { [key: string]: any }
        try {
            if (props.selectedIds.length > 0) {
                for (let id of props.selectedIds) {
                    let obj = await _adsClients.adsDataProvider.readValue(`$(${id})`)
                    sumObj[id] = obj
                }
                function sortObjKeysAlphabetically(obj: any) {
                    return Object.keys(obj).sort((a, b) => a > b ? 1 : a < b ? -1 : 0).reduce((result: any, key) => {
                        result[key] = obj[key];
                        return result;
                    }, {});
                }
                sumObj = sortObjKeysAlphabetically(sumObj)
            }
        } catch (e) {
        }
        return sumObj
    }

    const showChange = (changeIndex: number, arrDiff: rdiff.rdiffResult[]) => {
        let result = ''
        if (arrDiff[changeIndex]) {
            let path = arrDiff[changeIndex].path.join('.')
            switch (arrDiff[changeIndex].op) {
                case 'update':
                    result = `${arrDiff[changeIndex].op} ${ path } from ${ _.get(currentObj, path) } to ${ _.get(uploadObj, path) }`
                    break
                default:
                    result = `${arrDiff[changeIndex].op} ${ path } not supported`
                    break
                }
        }
        return result
    }

    const acceptedCount = () => arrAccept.reduce((prev, item) => prev += item ? 1 : 0, 0)

    return <Fragment>
        <Box display="flex" flexDirection="row" style={{ padding: '5px' }}>
            <Button variant="contained" style={{ color: "#b71c1c", margin: '5px' }} onClick={async () => {
                try {
                    const sumObj = await loadObjs()
                    let blob = new Blob([JSON.stringify(sumObj, null, 2)], { type: "text/plain;charset=utf-8" });
                    saveAs(blob, `${systemName} - ${moment().format()}.json`)
                } catch (e) {
                }
            }} startIcon={<UploadIcon />} >{translate('custom.downloadparameters')}</Button>
            <Button variant="contained" component="label" style={{ backgroundColor: "red", margin: '5px' }} startIcon={<DownloadIcon />} >
                {translate('custom.uploadParameters')}
                <input ref={el => { refFile.current = el! }} type="file" hidden onChange={(evt: any) => {
                    const fileReader = new FileReader()

                    fileReader.onload = async (e: any) => {
                        const uploaded = JSON_STR.parse(e.target.result)
                        setUploadObj(uploaded)
                        const plcObj = await loadObjs()
                        setCurrentObj(plcObj)
                        const diff = rdiff.getDiff(plcObj, uploaded)
                        setArrDiff(diff)
                        setChangeIndex(0)
                        setArrAccept([])
                        setSlideDirection('right')
                        setOpenDiffDialog(true)
                    }
                    fileReader.readAsText(evt.target.files[0])
                }} />
                <Modal
                    disableEnforceFocus
                    open={openDiffDialog}
                    onClose={() => {
                        setOpenDiffDialog(false)
                        refFile.current!.value = ''
                    }}
                    style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                    <Slide direction={slideDirection as any} in={openDiffDialog} mountOnEnter unmountOnExit>
                        <div style={getModalStyle()} className={classes.paper}>
                            <Card>
                                <CardHeader title={`Upload changes to ${systemName}`} />
                                <CardContent>
                                    <Box display="flex" flexDirection="row" width="50%" justifyContent="space-between">
                                        <div>Total changes: {arrDiff.length}</div>
                                        <div>Accepted changes: {acceptedCount()}</div>
                                    </Box>
                                    <p />
                                    <p />
                                    <Box display="flex" flexDirection="column">
                                        <p style={{ color: arrAccept[changeIndex] ? 'green' : typeof arrAccept[changeIndex] === 'undefined' ? 'black' : 'red' }}>{changeIndex + 1}: {showChange(changeIndex, arrDiff)}</p>
                                        <Box>
                                            <Button onClick={() => {
                                                if ((changeIndex > 0))
                                                    setChangeIndex(changeIndex - 1)
                                            }}>
                                                Previous
                                            </Button>
                                            <Button onClick={() => {
                                                if ((changeIndex <= arrDiff.length - 1)) {
                                                    const acc = [...arrAccept]
                                                    acc[changeIndex] = false
                                                    setArrAccept(acc)
                                                    if ((changeIndex < arrDiff.length - 1))
                                                        setChangeIndex(changeIndex + 1)
                                                }
                                            }}>
                                                Reject
                                            </Button>
                                            <Button onClick={() => {
                                                if ((changeIndex <= arrDiff.length - 1)) {
                                                    const acc = [...arrAccept]
                                                    acc[changeIndex] = true
                                                    setArrAccept(acc)
                                                    if ((changeIndex < arrDiff.length - 1))
                                                        setChangeIndex(changeIndex + 1)
                                                }
                                            }}>
                                                Accept
                                            </Button>
                                            <Button onClick={() => {
                                                if ((changeIndex < arrDiff.length - 1))
                                                    setChangeIndex(changeIndex + 1)
                                            }}>
                                                Next
                                            </Button>
                                        </Box>
                                    </Box>
                                    <Box>
                                        {<Button onClick={() => {
                                            setOpenDiffDialog(false)
                                            refFile.current!.value = ''
                                        }}>
                                            Cancel
                                    </Button>}
                                        {<Button disabled={arrDiff.length !== arrAccept.length || acceptedCount() === 0} onClick={async () => {
                                            for (let n = 0; n < arrAccept.length; n++) {
                                                if (arrAccept[n]) {
                                                    let diff = arrDiff[n]
                                                    let path = `$(${arrDiff[n].path[0]}).${arrDiff[n].path.slice(1).join('.')}`
                                                    await _adsClients.adsDataProvider.write(path, diff.val)
                                                }
                                            }
                                            setSlideDirection('left')
                                            setOpenDiffDialog(false)
                                            refFile.current!.value = ''
                                        }}>
                                            Upload
                                    </Button>}
                                    </Box>
                                    <ReactJson
                                        displayDataTypes={false}
                                        displayObjectSize={false}
                                        theme={isDark ? "monokai" : "bright:inverted"}
                                        name={false}
                                        collapsed
                                        enableClipboard={false}
                                        src={arrDiff}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </Slide>
                </Modal>
            </Button>
            <BulkDeleteButton {...props} />
        </Box>
    </Fragment>
}

export const ComponentList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate()
    const isSmall = useMediaQuery(theme => (theme as any).breakpoints.down('sm'))
    return <List {...props} bulkActionButtons={<ComponentActions />} title={getTitleText((props as any).resource, translate, isSmall)} filters={<ComponentFilter />} sort={{ field: 'name', order: 'ASC' }} >
        {isSmall ? (
            <SimpleList
                primaryText={(record: any) => record?.name}
                secondaryText={(record: any) => record?.phone ? `Phone ${record.phone}` : ""}
                tertiaryText={(record: any) => record?.email}
            />
        ) : (
                <Datagrid rowClick="toggleSelection">
                    <TextField source="name" />
                    <BooleanField source="EN" />
                    <TextField source="path" />
                    <TextField source="resource" />
                    <TextField source="permissions" />
                    <ArrayField source="parameters">
                        <Datagrid>
                            <TextField source="value" />
                        </Datagrid>
                    </ArrayField>
                    <ShowButton />
                    <ConditionalEditButton />
                </Datagrid>
            )}
    </List>
}

const ConditionalEditButton = (props: any) => {
    return !props.record.required ? <EditButton {...props} /> : <span></span>
}

// <ParametersField source="parameters" />
/*
const useStyles = makeStyles((theme) => ({
    funny: {
        border: '1px solid lightgray',
        backgroundColor: 'white',
        '& tr:nth-child(even)': {
            backgroundColor: '#eee'
        },
    },
}));
*/
/*
const ParametersField = ({ source, record }: { record?: any, source: string }) => {
    const classes = useStyles()
    return (
        <table className={record?.parameters?.length ? classes.funny : undefined} >
            <tbody>
                {record?.parameters.map((item: string) => (
                    <tr key={item}>{item}</tr>
                ))}
            </tbody>
        </table>
    );
}
*/

export const ComponentShow = (props: JSX.IntrinsicAttributes) => (
    <Show actions={<ListEditActions />} title={<ComponentTitle />} {...props}>
        <SimpleShowLayout>
            <TextField source="name" />
            <BooleanField source="EN" />
            <TextField source="path" />
            <ArrayField source="parameters">
                <Datagrid>
                    <TextField source="value" />
                </Datagrid>
            </ArrayField>
        </SimpleShowLayout>
    </Show>
);

const ComponentTitle = ({ record }: { record?: any }) => {
    return <span>Component {record ? record.name : ''}</span>;
};

export const ComponentEdit = (props: JSX.IntrinsicAttributes) => (
    <Edit actions={<ListShowActions />} title={<ComponentTitle />} {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <BooleanInput source="EN" />
            <TextInput source="path" />
            <ArrayInput source="parameters">
                <SimpleFormIterator>
                    <TextInput source="value" />
                </SimpleFormIterator>
            </ArrayInput>
        </SimpleForm>
    </Edit>
);

export const ComponentCreate = (props: JSX.IntrinsicAttributes) => (
    <Create actions={<ListActions />} {...props}>
        <SimpleForm>
            <TextInput source="name" />
            <BooleanInput source="EN" />
            <TextInput source="path" />
            <BooleanInput source="parameters" />
        </SimpleForm>
    </Create>
);
