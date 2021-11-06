import * as React from 'react';
import { FC } from 'react';
import { shallowEqual, useSelector } from 'react-redux';
import DashboardIcon from '@material-ui/icons/Dashboard';
import inflection from 'inflection';
import DefaultIcon from '@material-ui/icons/ViewList';
import { getResources, useTranslate } from 'react-admin';
import { MenuItemCategory, MultiLevelMenu } from '@react-admin/ra-navigation';
import PowerIcon from '@material-ui/icons/PowerSettingsNew';
import SetPointIcon from '@material-ui/icons/PermDataSetting';
import PlayIcon from '@material-ui/icons/PlayArrow';
import StopIcon from '@material-ui/icons/Stop';
import { Checkbox, Divider, Tooltip, Typography } from "@material-ui/core";
import SettingsApplicationsIcon from "@material-ui/icons/Settings";
import { useSystemState, usePlcState, AdsState, useAutoUpdate } from "../PlcControl"

const translatedResourceName = (resource: any, translate: any): string =>
    translate(`resources.${resource.name}.name`, {
        smart_count: 2,
        _:
            resource.options && resource.options.label
                ? translate(resource.options.label, {
                    smart_count: 2,
                    _: resource.options.label,
                })
                : inflection.humanize(inflection.pluralize(resource.name)),
    })

export const MyMenu: FC<MenuProps> = ({ hasDashboard }) => {
    const translate = useTranslate();
    let [plcState] = usePlcState()
    let [systemState] = useSystemState()
    let [autoUpdate, setAutoUpdate] = useAutoUpdate()
    const resources = useSelector(getResources, shallowEqual) as Array<any>;

    return (
        <MultiLevelMenu variant="categories">
            {true && (
                <MenuItemCategory
                    name="dashboard"
                    to="/"
                    exact
                    label={translate('custom.dashboard')}
                    icon={<DashboardIcon />}
                />
            )}
            <MenuItemCategory
                name="system"
                to="/control"
                exact
                label={translate("custom.system")}
                icon={<PowerIcon />}
            />
            <MenuItemCategory
                name="setPoint"
                to="/set-points"
                exact
                label={translate("custom.setPoint", 2)}
                icon={<SetPointIcon />}
            />
            {resources
                .filter(r => r.hasList)
                .map(resource => (
                    <MenuItemCategory
                        key={resource.name}
                        name={resource.name}
                        to={`/${resource.name}`}
                        exact
                        label={translatedResourceName(resource, translate)}
                        icon={
                            resource.icon ? <resource.icon /> : <DefaultIcon />
                        }
                    />
                ))}
            <MenuItemCategory
                name="setup"
                to="/setup"
                exact
                label={translate("custom.settings")}
                icon={
                    <SettingsApplicationsIcon />
                }
            />
            <Divider />
            <div id="hejsanDiv" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', fontSize: '75%' }}>
                <p></p>
                <Tooltip title={translate(systemState ? (plcState === AdsState.Run ? 'custom.systemEN' : 'custom.systemEN_NoPLCRun') : 'custom.systemEN_Not')}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: "white" }}>
                        <p>GM</p> {systemState ?
                            <PlayIcon style={{ fill: plcState === AdsState.Run ? "lightgreen" : "white" }} />
                            :
                            <StopIcon style={{ fill: "white" }} />}
                    </div>
                </Tooltip>
                <Tooltip title={translate(plcState === AdsState.Run ? 'custom.plcRun' : 'custom.plcRun_Not')}>
                    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', color: "white" }}>
                        <p>PLC</p> {
                            plcState === AdsState.Run ?
                                <PlayIcon style={{ fill: "lightgreen" }} />
                                :
                                (
                                    plcState === AdsState.Stop ?
                                        <StopIcon style={{ fill: "white" }} />
                                        :
                                        <StopIcon style={{ fill: "lightred" }} />
                                )
                        }
                    </div>
                </Tooltip>
                <Tooltip title={translate('custom.autoRefresh')}>
                    <div>
                        <Checkbox style={{ padding: '3x' }} size="small" color="secondary" checked={autoUpdate} onChange={event => setAutoUpdate(event.target.checked)} name="checkedG" inputProps={{ 'aria-label': 'primary checkbox' }} />
                        <Typography style={{ fontSize: '75%', textAlign: 'center', color: "white" }}>{translate('custom.auto')}</Typography>
                        <Typography style={{ fontSize: '75%', textAlign: 'center', color: "white" }}>{translate('custom.refresh')}</Typography>
                    </div>
                </Tooltip>
            </div>
        </MultiLevelMenu>
    );
};

export interface MenuProps {
    hasDashboard: boolean;
}
