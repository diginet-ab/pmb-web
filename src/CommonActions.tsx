import { ChevronLeft } from "@material-ui/icons"
import * as React from "react"
import {
    TopToolbar, ListButton, EditButton, CloneButton, ShowButton
} from 'react-admin'

export const ListEditActions = ({ basePath, data, resources }: any) => (
    <TopToolbar >
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />}/>
        <EditButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListEditCloneActions = ({ basePath, data, resources }: any) => (
    <TopToolbar >
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <EditButton  basePath={basePath} record={data} />
        <CloneButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListShowActions = ({ basePath, data, resource }: any) => (
    <TopToolbar>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <ShowButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListShowCloneActions = ({ basePath, data, resource }: any) => (
    <TopToolbar >
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <ShowButton  basePath={basePath} record={data} />
        <CloneButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListActions = ({ basePath, data, resource }: any) => (
    <TopToolbar >
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
    </TopToolbar>
)
