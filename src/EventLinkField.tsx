import React, { FunctionComponent, HtmlHTMLAttributes } from 'react';
import { pure } from 'recompose';
import sanitizeRestProps from './sanitizeRestProps';
import { Record } from 'ra-core';
import PropTypes from 'prop-types';

type TextAlign = 'right' | 'left';
export interface FieldProps {
    addLabel?: boolean;
    sortBy?: string;
    source?: string;
    label?: string;
    sortable?: boolean;
    className?: string;
    cellClassName?: string;
    headerClassName?: string;
    textAlign?: TextAlign;
}

// Props injected by react-admin
export interface InjectedFieldProps {
    basePath?: string;
    record?: Record;
}

export const fieldPropTypes = {
    addLabel: PropTypes.bool,
    sortBy: PropTypes.string,
    source: PropTypes.string,
    label: PropTypes.string,
    sortable: PropTypes.bool,
    className: PropTypes.string,
    cellClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    textAlign: PropTypes.oneOf<TextAlign>(['right', 'left']),
};

const UrlField: FunctionComponent<FieldProps & InjectedFieldProps & HtmlHTMLAttributes<HTMLAnchorElement>
> = ({ className, source, record = {}, ...rest }: any) => (
    <a
        className={className}
        href={ encodeURI(`${ window.location.pathname }#/event?filter={"${ source }":"${ record[source] }"}&order=DESC&page=1&perPage=100&sort=time`) }
        {...sanitizeRestProps(rest)}
    >
        {record[source]}
    </a>
);

const EnhancedUrlField = pure<FieldProps & HtmlHTMLAttributes<HTMLAnchorElement>
>(UrlField);

EnhancedUrlField.defaultProps = {
    addLabel: true,
};

EnhancedUrlField.propTypes = fieldPropTypes;
EnhancedUrlField.displayName = 'EnhancedUrlField';

export default EnhancedUrlField;
