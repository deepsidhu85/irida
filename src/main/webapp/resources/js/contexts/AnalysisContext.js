/*
 * This file loads basic analysis info from the server.
 */

import React, { useState } from "react";
import { showNotification } from "../modules/notifications";

import { useInterval } from "../hooks";

// Functions required by context
import { updateAnalysis } from "../apis/analysis/analysis";
import { getUpdatedDetails } from "../apis/analysis/analysis";

import { notification } from "antd";

/*
 * Since we are using Steps and only want to display
 * certain ones, we group some of the analysis states
 * together.
 */
export const stateMap = {
  NEW: 0,
  PREPARING: 1,
  PREPARED: 1,
  SUBMITTING: 2,
  RUNNING: 3,
  FINISHED_RUNNING: 3,
  POST_PROCESSING: 4,
  TRANSFERRING: 4,
  COMPLETING: 4,
  COMPLETED: 5
};

export const isAdmin = window.PAGE.isAdmin;

const initialContext = {
  analysis: window.PAGE.analysis,
  analysisName: window.PAGE.analysisName,
  analysisState: window.PAGE.analysisState,
  analysisType: window.PAGE.analysisType.type,
  isCompleted: window.PAGE.analysisState === "COMPLETED",
  isError: window.PAGE.analysisState.includes("ERROR"),
  previousState: window.PAGE.previousState,
  duration: window.PAGE.duration
};

const AnalysisContext = React.createContext(initialContext);

function AnalysisProvider(props) {
  const [analysisContext, setAnalysisContext] = useState(initialContext);

  /* Update the analysis details that are required
   * to display the progression using polling
   */
  const intervalId = useInterval(() => {
    getUpdatedDetails(analysisContext.analysis.identifier).then(res => {
      updateAnalysisState(res.analysisState, res.previousState);
      updateAnalysisDuration(res.duration);
      /*
       * If the analysis has completed or errored we want to clear the interval
       * so we do not keep retrieving the analysis progress
       */
      if(res.analysisState === "COMPLETED" || res.analysisState.includes("ERROR")) {
        clearInterval(intervalId);
      }
    }).catch((message) => {
      notification.error({ message });
      clearInterval(intervalId);
    });
  }, 5000);

  /* This function is used to update the AnalysisContext
   * analysis duration if it has changed from the original
   * load of the page
   */
  function updateAnalysisDuration(duration) {
    if(duration !== analysisContext.duration) {
      setAnalysisContext(analysisContext => {
        return {
          ...analysisContext,
          duration: duration
        };
      });
    }
  }

  /* This function is used to update the AnalysisContext
   * state variables if they have changed from the original
   * load of the page
   */
  function updateAnalysisState(analysisState, previousState) {
    if(analysisState !== analysisContext.analysisState) {
      setAnalysisContext(analysisContext => {
        return {...analysisContext, analysisState: analysisState }
      });

      if(analysisState === "COMPLETED" !== analysisContext.isCompleted) {
        setAnalysisContext(analysisContext => {
          return {...analysisContext, isCompleted: analysisState === "COMPLETED" }
        });
      }

      if(analysisState.includes("ERROR") !== analysisContext.isError) {
        setAnalysisContext(analysisContext => {
          return {...analysisContext, isError: analysisState.includes("ERROR") }
        });
      }

      if(previousState !== analysisContext.previousState) {
        setAnalysisContext(analysisContext => {
          return {...analysisContext, previousState: previousState }
        });
      }
    }
  }

  /*
   * Updates the submission name, displays a notification
   * to the user, and updates the `analysisName` state variable.
   */
  function analysisContextUpdateSubmissionName(updatedAnalysisName) {
    updateAnalysis({
      submissionId: analysisContext.analysis.identifier,
      analysisName: updatedAnalysisName,
      priority: null
    }).then(message => {
      showNotification({ text: message });
      setAnalysisContext(analysisContext => {
        return { ...analysisContext, analysisName: updatedAnalysisName };
      });
    });
  }

  return (
    <AnalysisContext.Provider
      value={{
        analysisContext,
        analysisContextUpdateSubmissionName
      }}
    >
      {props.children}
    </AnalysisContext.Provider>
  );
}
export { AnalysisContext, AnalysisProvider };
