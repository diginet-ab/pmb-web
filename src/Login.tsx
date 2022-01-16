import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Field, Form } from 'react-final-form';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { createTheme, makeStyles } from '@material-ui/core/styles';
import { ThemeProvider } from '@material-ui/styles';
import LockIcon from '@material-ui/icons/Lock';
import { Notification, useTranslate, useLogin, useNotify, RefreshButton } from 'react-admin';
import { lightTheme } from './layout/themes';
import { useParameter } from './PlcControl';
import { appInfo } from './App';

const useStyles = makeStyles(theme => ({
    main: {
        display: 'flex',
        flexDirection: "column" as any,
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'flex-start',
        //background: 'url(https://source.unsplash.com/random/1600x900)',
        backgroundColor: 'lightgray',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
    },
    card: {
        minWidth: 300,
        marginTop: '6em',
    },
    avatar: {
        margin: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
    icon: {
        backgroundColor: theme.palette.secondary.main,
    },
    hint: {
        marginTop: '1em',
        display: 'flex',
        justifyContent: 'center',
        color: theme.palette.grey[500],
    },
    form: {
        padding: '0 1em 1em 1em',
    },
    input: {
        marginTop: '1em',
    },
    actions: {
        padding: '0 1em 1em 1em',
    },
}));

const renderInput = ({
    meta: { touched, error } = {} as any,
    input: { ...inputProps },
    ...props
}) => (
    <TextField
        error={!!(touched && error)}
        helperText={touched && error}
        {...inputProps}
        {...props}
        fullWidth
    />
);

const Login = ({ location }: any) => {
    const [loading, setLoading] = useState(false);
    const translate = useTranslate();
    const classes = useStyles();
    const notify = useNotify();
    const login = useLogin();
    const [systemName] = useParameter('$(GM_BASE).System.Operation.SystemName', '')
    const [plcType] = useParameter('GlobalSettings.PlcType', '')

    const handleSubmit = (auth: any) => {
        setLoading(true);
        login(auth, location.state ? location.state.nextPathname : '/').catch(
            (error: { message: any; }) => {
                setLoading(false);
                notify(
                    typeof error === 'string'
                        ? error
                        : typeof error === 'undefined' || !error.message
                            ? 'ra.auth.sign_in_error'
                            : error.message,
                    'warning'
                );
            }
        );
    };

    const validate = (values: { username: any; password: any; }) => {
        const errors = {} as any;
        if (!values.username) {
            errors.username = translate('ra.validation.required');
        }
        if (!values.password) {
            errors.password = translate('ra.validation.required');
        }
        return errors;
    };
    return <Form
        onSubmit={handleSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
            <form onSubmit={handleSubmit} noValidate>
                <div className={classes.main}>
                    <Card className={classes.card}>
                        <div className={classes.avatar}>
                            <Avatar className={classes.icon}>
                                <LockIcon />
                            </Avatar>
                        </div>
                        <div style={{ color: '#283593' }}>
                            <Box display="flex" flexDirection="column" alignItems="center" >
                                <p><b>PTA PMB</b></p>
                                <p>{systemName}</p>
                                <p>{appInfo.hostName}&nbsp;({plcType})</p>
                                <RefreshButton label="" />
                            </Box>
                        </div>
                        <div className={classes.form}>
                            <div className={classes.input}>
                                <Field
                                    autoFocus
                                    name="username"
                                    component={renderInput}
                                    label={translate('custom.email_or_username')}
                                    disabled={loading}
                                />
                            </div>
                            <div className={classes.input}>
                                <Field
                                    name="password"
                                    component={renderInput}
                                    label={translate('custom.password')}
                                    type="password"
                                    disabled={loading}
                                />
                            </div>
                        </div>
                        <CardActions className={classes.actions}>
                            <Box display="flex" flexDirection="column" >
                                <Button
                                    variant="contained"
                                    type="submit"
                                    color="primary"
                                    disabled={loading}
                                    className={classes.input}
                                    fullWidth
                                >
                                    {loading && (
                                        <CircularProgress
                                            size={25}
                                            thickness={2}
                                        />
                                    )}
                                    {translate('ra.auth.sign_in')}
                                </Button>
                            </Box>
                        </CardActions>
                    </Card>
                    <Notification />
                </div>
            </form>
        )}
    />
};

Login.propTypes = {
    authProvider: PropTypes.func,
    previousRoute: PropTypes.string,
};

// We need to put the ThemeProvider decoration in another component
// Because otherwise the useStyles() hook used in Login won't get
// the right theme
const LoginWithTheme = (props: any) => (
    <ThemeProvider theme={createTheme(lightTheme)}>
        <Login {...props} />
    </ThemeProvider>
);

export default LoginWithTheme;