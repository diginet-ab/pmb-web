import React from 'react';
import { Layout } from '@react-admin/ra-enterprise';
import { AppLocationContext } from '@react-admin/ra-navigation'
import MyAppBar from './MyAppBar';
import { MyMenu } from './MyMenu';
import { ConfirmProvider } from 'material-ui-confirm';

const MyLayout = (props: JSX.IntrinsicAttributes) => <ConfirmProvider><AppLocationContext><Layout {...props} menu={MyMenu} appBar={MyAppBar} /></AppLocationContext></ConfirmProvider>;

export default MyLayout;
