import { ChevronLeft } from "@material-ui/icons"
import * as React from "react"
import { TopToolbar, EditButton, ListButton, ShowButton, CloneButton } from "react-admin"

const topToolbarStyle = {
    zIndex: 2,
    display: "inline-block",
    float: "right",
}

export const ListEditActions = ({ basePath, data, resources }: any) => (
    <TopToolbar style={topToolbarStyle}>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />}/>
        <EditButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListEditCloneActions = ({ basePath, data, resources }: any) => (
    <TopToolbar style={topToolbarStyle}>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <EditButton  basePath={basePath} record={data} />
        <CloneButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListShowActions = ({ basePath, data, resource }: any) => (
    <TopToolbar style={topToolbarStyle}>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <ShowButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListShowCloneActions = ({ basePath, data, resource }: any) => (
    <TopToolbar style={topToolbarStyle}>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
        <ShowButton  basePath={basePath} record={data} />
        <CloneButton  basePath={basePath} record={data} />
    </TopToolbar>
)

export const ListActions = ({ basePath, data, resource }: any) => (
    <TopToolbar style={topToolbarStyle}>
        <ListButton basePath={basePath} label="Back" icon={<ChevronLeft />} />
    </TopToolbar>
)
