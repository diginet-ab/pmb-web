import React, { Fragment, useEffect } from 'react';
import {
    useLocale, useTranslate, useRefresh} from 'react-admin';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { TreeWithDetails, TreeWithDetailsProps, useTreeController, NodeActions } from '@react-admin/ra-tree'
import { getTitleText, ParameterList as ParameterGridList } from './parameterList'

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
    const refresh = useRefresh()
    const locale = useLocale()
    useEffect(() => {
        refresh()
    }, [locale, refresh])
    return <TreeWithDetails {...props} classes={classes} nodeActions={<Fragment />}/>
 }

export const ParameterList = (props: JSX.IntrinsicAttributes) => {
    const translate = useTranslate()
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))

    const { handleExpand } = useTreeController({
        resource: (props as any).resource as string,
        titleField: 'name',
    });

    useEffect(() => {
        handleExpand(['5']);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);    
    return <MyTreeWithDetails {...props} titleField="title" showLine nodeActions={<MyActions />}
        edit={ParameterEdit}        
        title={getTitleText((props as any).resource, translate, isSmall)}
        />
}

const MyActions = (props: any) => (
    <NodeActions {...props}>
    </NodeActions>
  )

const ParameterEdit = (props: JSX.IntrinsicAttributes) => {
    return <ParameterGridList {...props} filter={{ z: `${ (props as any).id }` }} />
}
