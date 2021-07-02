import React, {  SyntheticEvent } from 'react';
import PropTypes from 'prop-types';
import { Portal } from 'react-portal';

export type Props = {
  children: any,
  onChange: (
    files: Array<File>,
    e: SyntheticEvent<HTMLInputElement>,
  ) => void | Promise<void>,
  accept?: string,
  style?: Object,
  multiple?: boolean,
};

class InputFiles extends React.PureComponent<Props> {
  static propTypes = {
    children: PropTypes.node.isRequired,
    onChange: PropTypes.func, // (files: Array<File>, e: SyntheticEvent<HTMLInputElement>) => void,
    accept: PropTypes.string,
    style: PropTypes.object, // eslint-disable-line
    multiple: PropTypes.bool,
  };

  static defaultProps = {
    accept: '.csv',
  };

  input = React.createRef<React.ElementRef<'input'>>();

  onClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    event.preventDefault();
    const input = this.input.current;
    if (input) input.click();
  };

  onChange = (e: any) => {
    const { onChange } = this.props;
    onChange(e.target.files, e);
  };

  render() {
    const { children, accept, style, multiple } = this.props;
    const { input, onClick, onChange } = this;

    return (
      <div>
        <div
          onClick={onClick}
          role="button"
          tabIndex={0}
          style={{ display: 'inline-block', ...style }}
        >
          {children}
        </div>

        <Portal>
          <input
            ref={input}
            type="file"
            accept={accept}
            onChange={onChange}
            style={{ display: 'none' }}
            multiple={multiple}
          />
        </Portal>
      </div>
    );
  }
}

export default InputFiles
