/**
 * Splitter Component for uxcore
 * @author vincent.bian
 *
 * Copyright 2015-2016, Uxcore Team, Alinw.
 * All rights reserved.
 */
import React from 'react';
import classnames from 'classnames';
import assign from 'object-assign';
import Splitter from './SplitBar';

class Pane extends React.Component {

  static displayName = 'Pane'; // eslint-disable-line
  static defaultProps = {
    className: '',
    defaultSize: 'auto',
    size: undefined,
    resizable: false,
    collapsible: false,
    orientation: 'horizontal',
    offset: null,
    onTogglePane: () => {},
    parentSplitter: null,
  }
  static propTypes = {
    className: React.PropTypes.string,
    defaultSize: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    size: React.PropTypes.oneOfType([
      React.PropTypes.string,
      React.PropTypes.number,
    ]),
    resizable: React.PropTypes.bool,
    collapsible: React.PropTypes.bool,
    orientation: React.PropTypes.oneOf(['vertical', 'horizontal']),
    offset: React.PropTypes.object,
    onTogglePane: React.PropTypes.func,
    parentSplitter: React.PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      size: props.size || props.defaultSize,
      paneStyle: {},
      collapsed: false,
      __size: null,
    };
    this.handleToggle = this.handleToggle.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.size === this.props.size) {
      if (nextProps.offset && nextProps.offset.align) {
        this.getPaneStyleByProps(nextProps);
      } else {
        this.setState({
          size: nextProps.size,
        });
      }
    } else {
      this.setState({
        size: nextProps.size,
      }, () => {
        this.props.parentSplitter.calculatePaneOffset();
      });
    }
  }

  handleToggle() {
    const { collapsed, size, __size } = this.state;
    const state = {
      collapsed: !collapsed,
    };
    if (collapsed) {
      assign(state, {
        size: __size,
        __size: 0  
      });
    } else {
      assign(state, {
        __size: size,
      });  
    }
    this.setState(state, () => {
      this.props.onTogglePane();
    });
  }

  getPaneStyleByProps(props) {
    const paneStyle = {};
    const { offset, orientation } = props;
    const size = offset.align !== 'none' ? offset.size: 'auto';
    switch (orientation) {
      case 'vertical':
        if (offset.align === 'left') {
          assign(paneStyle, {
            left: offset.start,
            width: size,
          });
        } else if (offset.align === 'right') {
          assign(paneStyle, {
            right: offset.end,
            width: size,
          });
        } else {
          assign(paneStyle, {
            left: offset.start,
            right: offset.end,
          });
        }
        break;
      case 'horizontal':
      default:
        if (offset.align === 'left') {
          assign(paneStyle, {
            top: offset.start,
            height: size,
          });
        } else if (offset.align === 'right') {
          assign(paneStyle, {
            bottom: offset.end,
            height: size,
          });
        } else {
          assign(paneStyle, {
            top: offset.start,
            bottom: offset.end,
          });
        }
        break;
    }
    this.setState({
      paneStyle,
      size,
    });
  }

  getCurrentSize() {
    const { collapsed } = this.state;
    return collapsed ? 'collapsed' : this.state.size;
  }

  render() {
    const { className, orientation, offset, collapsible } = this.props;
    const { paneStyle, collapsed } = this.state;
    let cls;
    if (offset) {
      cls = classnames(className, {
        [`align-${offset.align}`]: offset,
      })
    } else {
      cls = className;
    }
    return (
      <div
        className={classnames(cls, {
          'pane-collapsed': collapsed,
        })}
        style={paneStyle}
        ref={pane => (this.pane = pane)}
      >
        {
          collapsible ? 
            <div
              className={classnames('toggle-pane', {
                'toggle-pane-collapsed': collapsed,
              })}
              onClick={this.handleToggle}
            ></div> : null 
        }
        { this.renderContent() }
      </div>
    );
  }

  renderContent() {
    const { children } = this.props;
    if (typeof children === 'string') {
      return <div className="pane-content">{children}</div>;
    } else {
      return <div className="pane-content">{React.cloneElement(children, Comp => React.cloneElement(Comp))}</div>;
    }
  }
}

export default Pane;
