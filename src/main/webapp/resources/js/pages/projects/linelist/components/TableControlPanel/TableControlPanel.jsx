import React from "react";
import i18n from "i18n";
import PropTypes from "prop-types";
import { Button, Tooltip } from "antd";
import Columns from "./Columns/Columns";

/**
 * Component to handle any controls that affect the table.  This includes
 * column visibility.
 */
export default function TableControlPanel(props) {
  return (
    <div className="control-panel">
      <div className="control-panel--content">
        <Columns {...props} />
      </div>
      <div className="control-panel--buttons">
        <Tooltip title={i18n("linelist.controlPanel.columns.title")} placement="left">
          <Button
            tour="tour-columns"
            shape="circle"
            className="t-columns-panel-toggle"
            onClick={props.togglePanel}
          >
            <i className="fas fa-columns" />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

TableControlPanel.propTypes = {
  /**
   * Function to handle opening and closing the panel
   */
  togglePanel: PropTypes.func.isRequired,
  /**
   * The height of the table.  Requires because the user can change the window height
   * which will affect the table and control panel components.
   */
  height: PropTypes.number.isRequired
};
