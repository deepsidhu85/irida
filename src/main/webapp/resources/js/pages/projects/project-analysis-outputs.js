import $ from "jquery";
import { Grid } from "ag-grid/main";
import { formatDate } from "../../utilities/date-utilities";

import "ag-grid/dist/styles/ag-grid.css";
import "ag-grid/dist/styles/ag-theme-balham.css";

/**
 * Internationalized text from div#messages.hidden
 * @type {Object} map of data attribute key name to i18n text
 */
let MESSAGES = {
  sampleName: "SAMPLE NAME",
  file: "FILE",
  analysisType: "ANALYSIS TYPE",
  pipeline: "PIPELINE",
  analysisSubmissionName: "ANALYSIS SUBMISSION",
  createdDate: "CREATED",
  download: "DOWNLOAD",
  submitter: "SUBMITTER",
  statusCode: "STATUS CODE",
  requestUrl: "REQUEST URL",
  statusText: "STATUS TEXT",
  reqError: "REQUEST ERROR",
  error: "!!!ERROR!!!"
};
MESSAGES = Object.assign(MESSAGES, $("#js-messages").data());

/**
 * Analysis output file path regex to capture filename with extension
 * @type {RegExp}
 */
const FILENAME_REGEX = /.*\/(.+\.\w+)/;

/**
 * Base URL for AJAX requests.
 * @type {string}
 */
const BASE_URL = window.PAGE.URLS.base;

const PROJECT_ID = window.project.id;

/**
 * URL to get analysis output file info via AJAX for a project
 * @type {string}
 */
const AJAX_URL = `${BASE_URL}projects/${PROJECT_ID}/ajax/analysis-outputs`;

/**
 * HTML container for dynamically generating UI for download of output files
 * @type {jQuery|HTMLElement}
 */
const $app = $("#app");

/**
 * ag-grid Grid instance object
 * @type {Grid}
 */
let grid;

/**
 * Get filename from path
 * @param path File path
 */
function getFilename(path) {
  return path.replace(FILENAME_REGEX, "$1");
}

/**
 * Download analysis output files (AOFs) for selected rows in ag-grid table
 *
 * Each selected AOF will be downloaded in a separate request. Multiple files
 * could be downloaded in the same request as a Zipped response stream, but that
 * would require coming up with a way to get around the limit on the query
 * string for an HTTP GET request:
 *
 * Revert "Merge branch 'fix-612-request-uri-too-long' into 'development'"
 * http://gitlab-irida.corefacility.ca/irida/irida/merge_requests/1297
 *
 * @param {Object} api ag-grid grid options API object
 */
function downloadSelected(api) {
  /**
   * Selected rows in the ag-grid Grid corresponding to AOFs
   * @type {*|RowNode[]}
   */
  const selectedNodes = api.getSelectedNodes();

  /**
   * Hidden <a> element for downloading each AOF
   * @type {HTMLAnchorElement}
   */
  const $a = document.createElement("a");
  $a.style.display = "none";
  document.body.appendChild($a);

  // trigger hidden <a> element download of each selected AOF
  for (const node of selectedNodes) {
    const {
      analysisSubmissionId,
      analysisOutputFileId,
      sampleName,
      sampleId,
      filePath
    } = node.data;
    let url = `${BASE_URL}analysis/ajax/download/${analysisSubmissionId}/file/${analysisOutputFileId}`;
    const downloadName = `${sampleName}-sampleId-${sampleId}-analysisSubmissionId-${analysisSubmissionId}-${getFilename(
      filePath
    )}`;
    url += "?" + $.param({ filename: downloadName });
    $a.setAttribute("href", url);
    $a.setAttribute("download", downloadName);
    $a.click();
  }
  document.body.removeChild($a);
}

/**
 * Initialize ag-grid Grid
 * @param {HTMLElement} $grid Element to create Grid in
 * @param {Array<Object<string>>} headers
 * @param {Array<Object>} rows
 * @param {jQuery|HTMLElement} $dlButton
 * @return {Grid} ag-grid object
 */
function initAgGrid($grid, headers, rows, $dlButton) {
  const gridOptions = {
    enableColResize: true,
    columnDefs: headers,
    rowData: rows,
    rowDeselection: true,
    enableSorting: true,
    enableFilter: true,
    rowSelection: "multiple",
    onSelectionChanged: e => {
      const selectedNodes = e.api.getSelectedNodes();
      const selectionLength = selectedNodes.length;
      $dlButton.attr("disabled", selectionLength > 0 ? null : "disabled");
      const badge = selectionLength
        ? `<span class="badge">${selectionLength}</span>`
        : "";
      $dlButton.html(
        `<i class="fa fa-download spaced-right__sm"></i> ${
          MESSAGES.download
        } ${badge}`
      );
    }
  };
  const grid = new Grid($grid, gridOptions);
  gridOptions.api.sizeColumnsToFit();
  $dlButton.on("click", e => {
    e.preventDefault();
    downloadSelected(gridOptions.api);
  });
  return grid;
}

/**
 * Filter for single sample analysis outputs.
 * @param data
 * @returns {Array<Object>}
 */
function filterSingleSampleOutputs(data) {
  // group analysis output file (AOF) info by AOF id
  const groupedDataByAofId = data.reduce((acc, x) => {
    const { analysisOutputFileId } = x;
    if (acc.hasOwnProperty(analysisOutputFileId)) {
      acc[analysisOutputFileId].push(x);
    } else {
      acc[analysisOutputFileId] = [x];
    }
    return acc;
  }, {});
  // return AOF info that only has one Sample assoc with the AOF id, i.e. single
  // sample AOFs
  return Object.keys(groupedDataByAofId)
    .filter(x => groupedDataByAofId[x].length === 1)
    .map(x => groupedDataByAofId[x][0]);
}

/**
 * Get workflow/pipeline info and save to `workflowIds` map.
 * @param {Array<Object>} singleSampleOutputs Single sample analysis output file infos
 * @returns {Object<Object>} Map of workflow id to workflow info map.
 */
function getWorkflowInfo(singleSampleOutputs) {
  const workflowIds = singleSampleOutputs.reduce(
    (acc, x) => Object.assign(acc, { [x.workflowId]: null }),
    {}
  );
  Object.keys(workflowIds).forEach(workflowId => {
    $.get(`${BASE_URL}pipelines/ajax/${workflowId}`).done(wfInfo => {
      workflowIds[workflowId] = wfInfo;
      if (grid) {
        grid.context.beans.gridApi.beanInstance.redrawRows();
      }
    });
  });
  return workflowIds;
}

/**
 * Get analysis output file (AOF) table information and create table.
 */
$.get(AJAX_URL)
  .done(data => {
    const singleSampleOutputs = filterSingleSampleOutputs(data);
    const workflowIds = getWorkflowInfo(singleSampleOutputs);
    /**
     * ag-grid Grid header definitions
     * @type {*[]}
     */
    const HEADERS = [
      {
        field: "sampleName",
        headerName: MESSAGES.sampleName,
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        cellRenderer: p => {
          const { sampleId, sampleName } = p.data;
          return `<a href="${BASE_URL}projects/${PROJECT_ID}/samples/${sampleId}" target="_blank">${sampleName}</a>`;
        }
      },
      {
        field: "filePath",
        headerName: MESSAGES.file,
        cellRenderer: p => {
          const {
            filePath,
            analysisOutputFileKey,
            analysisOutputFileId
          } = p.data;
          const REGEX = /^\d+\/\d+\/(.+)$/;
          const groups = REGEX.exec(filePath);
          if (groups === null) return filePath;
          const filename = groups[1];

          return `${filename} <small>(${analysisOutputFileKey}, id=${analysisOutputFileId})</small>`;
        }
      },
      {
        field: "analysisType",
        headerName: MESSAGES.analysisType
      },
      {
        field: "workflowId",
        headerName: MESSAGES.pipeline,
        cellRenderer: p => {
          const wfInfo = workflowIds[p.data.workflowId];
          if (wfInfo === null) return p.data.workflowId;
          return `${wfInfo.name} (v${wfInfo.version})`;
        }
      },
      {
        field: "analysisSubmissionName",
        headerName: MESSAGES.analysisSubmissionName,
        cellRenderer: p =>
          `<a href="${BASE_URL}analysis/${
            p.data.analysisSubmissionId
          }" target="_blank">${p.data.analysisSubmissionName}</a>`
      },
      {
        field: "userId",
        headerName: MESSAGES.submitter,
        cellRenderer: p => `${p.data.userFirstName} ${p.data.userLastName}`
      },
      {
        field: "createdDate",
        headerName: MESSAGES.createdDate,
        cellRenderer: p => formatDate({ date: p.data.createdDate })
      }
    ];
    const gridId = `grid-outputs`;
    const $grid = $(
      `<div id="${gridId}" class="ag-theme-balham" style="height: 600px; width: 100%; resize: both;"/>`
    );
    const $dlButton = $(
      `<button type="button" class="btn" disabled="disabled">
         <i class="fa fa-download spaced-right__sm"></i>
         ${MESSAGES.download}
       </button>`
    );
    $app.prepend($grid);
    $app.prepend($dlButton);

    /**
     * Set `grid` to initialized ag-grid Grid for access to Grid API.
     * @type {Grid}
     */
    grid = initAgGrid(
      document.getElementById(gridId),
      HEADERS,
      singleSampleOutputs,
      $dlButton
    );
  })
  .fail((xhr, error, exception) => {
    const $alert = $(
      `<div class="alert alert-danger"><h4>${MESSAGES.reqError}</h4></div>`
    );
    if (xhr !== null) {
      $alert.append($(`<p>${MESSAGES.statusCode}: ${xhr.status}</p>`));
      $alert.append($(`<p>${MESSAGES.requestUrl}: ${AJAX_URL}</p>`));
    }
    if (exception !== null) {
      $alert.append($(`<p>${MESSAGES.statusText}: ${exception}</p>`));
    }
    if (error !== null) {
      $alert.append($(`<p>${MESSAGES.error}: "${error}"</p>`));
    }
    $app.append($alert);
  });
