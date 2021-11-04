import * as React from 'react';
import { UserMenu, MenuItemLink } from 'react-admin';
import SettingsIcon from '@material-ui/icons/Settings';
import { forwardRef } from 'react';

const ConfigurationMenu = forwardRef<any, any>(({ onClick }, ref) => (
    <MenuItemLink
        ref={ref}
        to="/configuration"
        primaryText="Configuration"
        leftIcon={<SettingsIcon />}
        onClick={onClick} // close the menu on click
    />
));

export const MyUserMenu = (props: JSX.IntrinsicAttributes) => (
    <UserMenu {...props}>
        <ConfigurationMenu onClick={() => undefined}/>
    </UserMenu>
);


