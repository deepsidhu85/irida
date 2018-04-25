import React, { Component } from "react";
import PropTypes from "prop-types";
import { AgGridReact } from "ag-grid-react";
import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";

import { LoadingOverlay } from "../LoadingOverlay";
import { SampleNameRenderer } from "./renderers/SampleNameRenderer";

const localeText = window.PAGE.i18n.agGrid;

export class Table extends Component {
  frameworkComponents = { LoadingOverlay, SampleNameRenderer };

  constructor(props) {
    super(props);

    this.state = {
      entries: props.entries,
      fields: props.fields
    };

    this.onGridReady = this.onGridReady.bind(this);
  }

  /*
  Allow access to the grids API
   */
  onGridReady(params) {
    this.api = params.api;
    this.columnApi = params.columnApi;
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.entries !== null) {
      this.setState({ entries: nextProps.entries });
    }
  }

  render() {
    const containerStyle = {
      boxSizing: "border-box",
      height: 600,
      width: "100%"
    };

    return (
      <div style={containerStyle} className="ag-theme-balham">
        <AgGridReact
          enableSorting={true}
          localeText={localeText}
          columnDefs={this.state.fields}
          rowData={this.state.entries}
          deltaRowDataMode={true}
          getRowNodeId={data => data.code}
          frameworkComponents={this.frameworkComponents}
          loadingOverlayComponent="LoadingOverlay"
          animateRows={true}
          onGridReady={this.onGridReady}
        />
      </div>
    );
  }
}

Table.propTypes = {
  fields: PropTypes.array.isRequired,
  entries: PropTypes.array
};
