import React from "react";
import PropTypes from "prop-types";
import ImmutablePropTypes from "react-immutable-proptypes";
import { showUndoNotification } from "../../../../../modules/notifications";
import { AgGridReact } from "ag-grid-react";
import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";
// Excel export support
import XLSX from "xlsx";

import { LoadingOverlay } from "./LoadingOverlay";
import { SampleNameRenderer } from "./renderers/SampleNameRenderer";

const { i18n } = window.PAGE;

/**
 * React component to render the ag-grid to the page.
 */
export class Table extends React.Component {
  state = {
    entries: null
  };

  /*
  Regular expression to clean the project and template names for export.
   */
  nameRegex = /([^\w]+)/gi;

  /*
  This is a flag for handling when a column is dragged and dropped on the table.
  This is required because the table can be modified externally through the columns
  panel.  If we don't flag this, it tries to update itself a second time throwing
  errors.
   */
  colDropped = false;

  /*
  External custom components used by ag-grid.
   */
  frameworkComponents = { LoadingOverlay, SampleNameRenderer };

  /**
   * Apply a Metadata template to the table.  This will reorder the columns and
   * toggle column visibility.
   * @param {Array} templateFields
   */
  applyTemplate = templateFields => {
    /*
    Get the current state of the table.  This hold critical information so we
    only want to modify the order and visible of the columns.
     */
    const columnState = this.columnApi.getColumnState();

    /*
    Sample name always needs to be first so let's take it off and re-add
    it after we get everything sorted.
     */
    const sampleIndex = columnState.findIndex(
      c => c.colId === i18n.linelist.agGrid.sampleName
    );
    const sample = columnState.splice(sampleIndex, 1)[0];

    /*
   From the new template (or modified template) determine the order and
   visibility of the columns.  All templates know all the available fields
   in the table, if there are not visible they are just added to the end of
   the template.
    */
    const final = templateFields
      .map(field => {
        const index = columnState.findIndex(c => {
          return c.colId === field.label;
        });
        if (index > -1) {
          const col = columnState.splice(index, 1)[0];

          /*
          Determine the visibility of the column based on the template field.
          */
          col.hide = field.hide;
          return col;
        }
      })
      .filter(c => typeof c !== "undefined");

    /*
    Combine back the sample name plus the new ordered state for the table.
     */
    this.columnApi.setColumnState([sample, ...final]);
  };

  /*
  Allow access to the grids API
   */
  onGridReady = params => {
    this.api = params.api;
    this.columnApi = params.columnApi;
  };

  /**
   * Event handler for if a user drags a column to a new spot on the current
   * table.
   */
  onColumnDropped = () => {
    const colOrder = this.columnApi.getColumnState();

    /*
    Remove the hidden ones and just get the field identifiers
    and remove the sample name column since this is just for the table.
     */
    let list = colOrder
      .map(c => ({ label: c.colId, hide: c.hide }))
      .filter(
        c =>
          c.label !== i18n.linelist.agGrid.sampleName && c.label !== "sampleId"
      );

    // Don't let the table perform a modified update since it handles it on its own
    this.colDropped = true;
    this.props.tableModified(list);
  };

  /**
   * Generate the name for the type of file to be exported from the grid
   * @param {string} ext extension for the file.
   * @returns {string}
   */
  generateFileName = ext => {
    // YYYY-MM-dd-project-X-<metadata template name>.csv
    const fullDate = new Date();
    const date = `${fullDate.getFullYear()}-${fullDate.getMonth() +
      1}-${fullDate.getDate()}`;
    const project = window.PAGE.project.label.replace(this.nameRegex, "_");
    const template = this.props.templates
      .getIn([this.props.current, "name"])
      .replace(this.nameRegex, "_");
    return `${date}-${project}-${template}.${ext}`;
  };

  createFile = ext => {
    const colOrder = this.columnApi.getColumnState().filter(c => !c.hide);

    /*
    Set up the excel file
     */
    const fileName = this.generateFileName(ext);
    const workbook = {};
    workbook.Sheets = {};
    workbook.Props = {};
    workbook.SSF = {};
    workbook.SheetNames = [];
    /* create worksheet: */
    const ws = {};

    /* the range object is used to keep track of the range of the sheet */
    const range = { s: { c: 0, r: 0 }, e: { c: 0, r: 0 } };

    /*
    Add the headers
     */
    const cell = { v: "Sample Id", t: "s" };
    const cell_ref = XLSX.utils.encode_cell({ c: 0, r: 0 });
    ws[cell_ref] = cell;
    colOrder.forEach((col, i) => {
      const index = i + 1;
      if (range.e.c < index) range.e.c = index;
      const cell = { v: col.colId, t: "s" };
      const cell_ref = XLSX.utils.encode_cell({ c: index, r: 0 });
      ws[cell_ref] = cell;
    });

    /*
    Add all the entries
     */
    this.api.forEachNodeAfterFilterAndSort((node, r) => {
      const entry = node.data;
      /*
      Offset to allow for the header row.
       */
      const row = r + 1;
      if (range.e.r < row) range.e.r = row;

      // Need to add the sample identifier
      const idCell = { v: entry.sampleId, t: "n", z: "0" };
      const idRef = XLSX.utils.encode_cell({ c: 0, r: row });
      ws[idRef] = idCell;

      for (let c = 0; c < colOrder.length; c++) {
        const column = colOrder[c];
        /*
        Offset to allow for the sample id column
         */
        const col = c + 1;
        /* create cell object: .v is the actual data */
        const cell = { v: entry[column.colId] };
        if (cell.v !== null) {
          /* create the correct cell reference */
          const cell_ref = XLSX.utils.encode_cell({ c: col, r: row });

          /* determine the cell type */
          if (typeof cell.v === "number") cell.t = "n";
          else if (typeof cell.v === "boolean") cell.t = "b";
          else cell.t = "s";

          /* add to structure */
          ws[cell_ref] = cell;
        }
      }
    });

    ws["!ref"] = XLSX.utils.encode_range(range);

    /* add worksheet to workbook using the template name */
    const template = this.props.templates
      .getIn([this.props.current, "name"])
      .replace(this.nameRegex, "_");
    workbook.SheetNames.push(template);
    workbook.Sheets[template] = ws;

    /* write file */
    XLSX.writeFile(workbook, fileName);
  };

  addSamplesToCart = () => {
    const nodes = this.api.getSelectedNodes().map(n => n.data);
    this.props.addSelectedToCart(nodes);
  };

  /**
   * Export the currently visible columns as a CSV file.
   */
  exportCSV = () => {
    this.createFile("csv");
  };

  /**
   * Export the currently visible columns as an XLSX file.
   */
  exportXLSX = () => {
    this.createFile("xlsx");
  };

  onSelectionChange = () => {
    this.props.selectionChange(this.api.getSelectedNodes().length);
  };

  static getDerivedStateFromProps(props, state) {
    const { entries } = props;

    if (entries !== null) {
      /*
      Format the sample metadata into a usable map.
       */
      state.entries = entries.toJS().map(entry => {
        const metadata = entry.metadata;
        metadata.sampleId = entry.id;
        metadata[i18n.linelist.agGrid.sampleName] = entry.label;
        metadata.projectId = entry.projectId;
        metadata.projectLabel = entry.projectLabel;
        return metadata;
      });
    }

    return state;
  }

  /**
   * When a cell is edited, store the value in case it needs to be reversed
   * @param {object} event - the cell edit event
   */
  onCellEditingStarted = event => {
    this.cellEditedValue = event.value || "";
  };

  /**
   * After the cell has been edited give the user a chance to undo the edit.
   * @param {object} event - cell edit event
   */
  onCellEditingStopped = event => {
    // Get the table header for the cell that was edited
    const field = event.column.colId;
    // Get the previous value
    const previousValue = this.cellEditedValue;
    // Get the new value for the cell
    const data = event.data;

    // Make sure that the data for saving is valid.
    if (typeof event.value !== "undefined" && previousValue !== event.value) {
      /*
      Update the value on the server (this way, if the user closes the page the
      server already has the update.
       */
      this.props.entryEdited(data, field);
      /*
      Show a notification that allows the user to reverse the change to the value.
       */
      const text = Boolean(data[field])
        ? i18n.linelist.editing.undo.full
        : i18n.linelist.editing.undo.empty;
      showUndoNotification(
        {
          text: text
            .replace(
              "[SAMPLE_NAME]",
              `<strong>${data[i18n.linelist.agGrid.sampleName]}</strong>`
            )
            .replace("[FIELD]", `<strong>${field}</strong>`)
            .replace("[NEW_VALUE]", `<strong>${data[field]}</strong>`)
        },
        () => {
          /**
           * Callback to reverse the change.
           */
          data[field] = previousValue;
          this.props.entryEdited(data, field);
          event.node.setDataValue(event.colDef.field, previousValue);
        }
      );
    }
    // Remove the stored value for the cell
    delete this.cellEditedValue;
  };

  render() {
    return (
      <div className="ag-grid-table-wrapper"
           style={{ height: this.props.height }}>
        <AgGridReact
          id="linelist-grid"
          rowSelection="multiple"
          enableFilter={true}
          enableSorting={true}
          enableColResize={true}
          localeText={i18n.linelist.agGrid}
          columnDefs={this.props.fields.toJS()}
          rowData={this.state.entries}
          frameworkComponents={this.frameworkComponents}
          loadingOverlayComponent="LoadingOverlay"
          animateRows={true}
          onGridReady={this.onGridReady}
          onDragStopped={this.onColumnDropped}
          rowDeselection={true}
          suppressRowClickSelection={true}
          onSelectionChanged={this.onSelectionChange}
          defaultColDef={{
            editable: true
          }}
          enableCellChangeFlash={true}
          onCellEditingStarted={this.onCellEditingStarted}
          onCellEditingStopped={this.onCellEditingStopped}
        />
      </div>
    );
  }
}

Table.propTypes = {
  height: PropTypes.number.isRequired,
  tableModified: PropTypes.func.isRequired,
  fields: ImmutablePropTypes.list.isRequired,
  entries: ImmutablePropTypes.list,
  templates: ImmutablePropTypes.list,
  current: PropTypes.number.isRequired
};
