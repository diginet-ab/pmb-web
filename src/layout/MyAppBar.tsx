import * as React from "react";
import { AppBar } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';

import { Logo } from './Logo';
import { useMediaQuery } from "@material-ui/core";
import { ToggleThemeButton } from "@react-admin/ra-preferences";
import MyLanguageSwitcher from './MyLanguageSwitcher'

const useStyles = makeStyles({
    title: {
        flex: 1,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
    },
    spacer: {
        flex: 1,
    },
});

const MyAppBar = (props: any) => {
    const classes = useStyles()
    const isSmall = useMediaQuery((theme: any) => theme.breakpoints.down('sm'))
    return (
        <AppBar {...props}>
            {/*}
            <Typography
                variant="h6"
                color="inherit"
                className={classes.title}
                id="react-admin-title"
            />
            {*/}
            { isSmall ? null : <Logo /> }
            <span className={classes.spacer} />
            <ToggleThemeButton />
            <MyLanguageSwitcher
            languages={[
                { locale: 'en', name: 'ᴇɴ' },
                { locale: 'sv', name: 'ꜱᴠ' },
                        ]}
            defaultLanguage="English"
        />
        </AppBar>
    )
}

export default MyAppBar;