/**
 * @file API the ProjectAjaxController
 */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import axios from "axios";
import { setBaseUrl } from "../../utilities/url-utilities";

const URL = setBaseUrl(`ajax/projects`);

const projectsApi = createApi({
  reducerPath: `projectsApi`,
  baseQuery: fetchBaseQuery({
    baseUrl: setBaseUrl(`ajax/projects`),
  }),
});

/**
 * Returns the projects on the current page of the projects table.
 * @param {Object} params
 * @returns {Promise<{}|T>}
 */
export async function getPagedProjectsForUser(params) {
  try {
    const { data } = await axios.post(
      `${URL}?admin=${window.location.href.includes("all")}
  `,
      params
    );
    return data;
  } catch (e) {
    return {};
  }
}

/**
 * Get a list of available project roles
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function getProjectRoles() {
  return await axios.get(`${URL}/roles`).then(({ data }) => data);
}

/**
 * Get information about the current project
 * @param {number} projectId - identifier for a project
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function getProjectDetails(projectId) {
  return axios.get(`${URL}/${projectId}/details`).then(({ data }) => data);
}

/**
 * Update an attribute on a project
 * @param {number} projectId - identifier for a project
 * @param {string} field - attribute to update
 * @param {string} value - new value of the attribute
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function updateProjectAttribute({ projectId, field, value }) {
  try {
    const { data } = await axios.put(`${URL}/${projectId}/details/edit`, {
      field,
      value,
    });
    return data;
  } catch (e) {
    return Promise.reject(e.response.data);
  }
}

/**
 * Get project info (name, permissions)
 * @param {number} projectId - identifier for a project
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function getProjectInfo(projectId) {
  return axios.get(`${URL}/${projectId}/info`).then(({ data }) => data);
}

/**
 * Set a default metadata template for a project
 * @param templateId Identifier of the metadata template
 * @param projectId Identifier of the project
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function setDefaultMetadataTemplate(projectId, templateId) {
  try {
    const { data } = await axios.post(
      `${URL}/${projectId}/details/set-project-default?templateId=${templateId}`
    );
    return data.message;
  } catch (e) {
    return Promise.reject(e.response.data.message);
  }
}
