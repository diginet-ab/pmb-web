import React, { FunctionComponent } from 'react';
import compose from 'recompose/compose';
import get from 'lodash/get';
import pure from 'recompose/pure';
import Chip, { ChipProps } from '@material-ui/core/Chip';
import { makeStyles } from '@material-ui/core/styles';
import classnames from 'classnames';
import sanitizeRestProps from './sanitizeRestProps';
import { Record } from 'ra-core';
import PropTypes from 'prop-types';
import moment from 'moment'

type TextAlign = 'right' | 'left';
interface FieldProps {
    addLabel?: boolean;
    sortBy?: string;
    source?: string;
    time?: string;
    source2?: string;
    label?: string;
    sortable?: boolean;
    className?: string;
    cellClassName?: string;
    headerClassName?: string;
    textAlign?: TextAlign;
}

// Props injected by react-admin
interface InjectedFieldProps {
    basePath?: string;
    record?: Record;
}

const fieldPropTypes = {
    addLabel: PropTypes.bool,
    sortBy: PropTypes.string,
    source: PropTypes.string,
    time: PropTypes.string,
    source2: PropTypes.string,
    label: PropTypes.string,
    sortable: PropTypes.bool,
    className: PropTypes.string,
    cellClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    textAlign: PropTypes.oneOf<TextAlign>(['right', 'left']),
};

const useStyles = makeStyles({
    chip: { margin: 4 },
});

export const StatusInfoField: FunctionComponent<
FieldProps & InjectedFieldProps & ChipProps
> = ({ className, classes: classesOverride, source, time, source2, record = {}, ...rest }: any) => {
    const classes = useStyles({ classes: classesOverride });

    return (
        <Chip
            className={classnames(classes.chip, className)}
            label={get(record, source!) + " " + moment.utc(record[time!]).local().fromNow()}
            {...sanitizeRestProps(rest)}
        />
    );
};

const EnhancedStatusInfoFieldField = compose<
    FieldProps & InjectedFieldProps & ChipProps,
    FieldProps & ChipProps
>(pure)(StatusInfoField);

EnhancedStatusInfoFieldField.defaultProps = {
    addLabel: true,
};

EnhancedStatusInfoFieldField.propTypes = {
    ...StatusInfoField.propTypes,
    ...fieldPropTypes,
};

EnhancedStatusInfoFieldField.displayName = 'EnhancedStatusInfoFieldField';

export default EnhancedStatusInfoFieldField;
