import { unwrapResult } from "@reduxjs/toolkit";
import { Button, List, notification, Popconfirm, Tag } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconRemove } from "../../../../../components/icons/Icons";
import {
  deletePipeline,
  fetchAnalysisTemplates,
} from "../../../redux/pipelinesSlice";

/**
 * Display a list of analysis templates (automated pipelines) that are currently
 * existing on the project.
 *
 * @param {number} projectId - project identifier
 * @param {boolean} canManage - if the current user can manage the project
 * @returns {JSX.Element}
 * @constructor
 */
export function AnalysisTemplates({ projectId, canManage }) {
  const dispatch = useDispatch();
  const { templates, loading } = useSelector((state) => state.pipelines);

  React.useEffect(() => {
    dispatch(fetchAnalysisTemplates(projectId));
  }, []);

  const removeAutomatedPipeline = (analysisTemplate) =>
    dispatch(
      deletePipeline({
        analysisTemplateId: analysisTemplate.id,
        projectId,
      })
    )
      .then(unwrapResult)
      .then(({ message }) => notification.success({ message }));

  return (
    <List
      loading={loading}
      bordered
      dataSource={templates}
      renderItem={(template) => (
        <List.Item
          key={`template-${template.id}`}
          actions={
            canManage
              ? [
                  <Popconfirm
                    key={`remove-${template.id}`}
                    placement="topRight"
                    onConfirm={() => removeAutomatedPipeline(template)}
                    title={i18n("AnalysisTemplates.confirm-title")}
                    okButtonProps={{ className: "t-confirm-remove" }}
                  >
                    <Button
                      className="t-remove-template"
                      shape="circle"
                      icon={<IconRemove />}
                    />
                  </Popconfirm>,
                ]
              : []
          }
        >
          <List.Item.Meta
            title={
              <div
                className="t-analysis-template"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                {template.name}
                <Tag color="blue">{template.analysisType}</Tag>
              </div>
            }
            description={template.statusMessage}
          />
        </List.Item>
      )}
    />
  );
}
