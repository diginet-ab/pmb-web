import React, { Component } from 'react';
import { connect } from 'react-redux';
import Button from '@material-ui/core/Button';
import { changeLocale as changeLocaleAction } from 'react-admin';

class LocaleSwitcher extends Component<{ changeLocale:any }> {
    switchToFrench = () => this.props.changeLocale('fr');
    switchToEnglish = () => this.props.changeLocale('en');

    render() {
        const { changeLocale } = this.props;
        return (
            <div>
                <div>Language</div>
                <Button onClick={this.switchToEnglish}>en</Button>
                <Button onClick={this.switchToFrench}>fr</Button>
            </div>
        );
    }
}

export default connect(undefined, { changeLocale: changeLocaleAction })(LocaleSwitcher);
