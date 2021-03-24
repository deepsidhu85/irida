import React from "react";
import { Button, Empty, List, notification, Popconfirm, Tag } from "antd";
import { IconDownloadFile, IconRemove } from "../../../components/icons/Icons";
import { setBaseUrl } from "../../../utilities/url-utilities";
import { Link } from "@reach/router";
import { blue6 } from "../../../styles/colors";
import { useDispatch, useSelector } from "react-redux";
import { removeTemplateFromProject } from "../redux/templatesSlice";
import { SPACE_MD } from "../../../styles/spacing";
import { unwrapResult } from "@reduxjs/toolkit";

/**
 * Component to display all metadata templates associated with a project.
 *
 * @param projectId
 * @returns {JSX.Element}
 * @constructor
 */
export function MetadataTemplatesList({ projectId }) {
  const { canManage } = useSelector((state) => state.project);
  const { templates, loading } = useSelector((state) => state.templates);
  const dispatch = useDispatch();
  const [BASE_URL] = React.useState(() =>
    setBaseUrl(`/projects/${projectId}/metadata-templates`)
  );

  /**
   * This crates the "actions" that appear at the right of every row in
   * the table: field count, download template, and remove template (if applicable).
   *
   * @param {Object} template
   * @returns {JSX.Element[]}
   */
  const getActionsForItem = (template) => {
    const actions = [
      <Tag key={`fields-${template.identifier}`}>
        {i18n("ProjectMetadataTemplates.fields", template.fields.length)}
      </Tag>,
      <Button
        shape="circle"
        size="small"
        icon={<IconDownloadFile />}
        href={`${BASE_URL}/${template.identifier}/excel`}
        key={`download-${template.identifier}`}
      />,
    ];
    if (canManage) {
      actions.push(
        <Popconfirm
          key={`remove-${template.id}`}
          placement="bottomRight"
          title={i18n("MetadataTemplatesList.delete-confirm")}
          onConfirm={() => deleteTemplate(template.identifier)}
          okButtonProps={{
            className: "t-t-confirm-remove",
          }}
        >
          <Button
            className="t-t-remove-button"
            shape="circle"
            size="small"
            icon={<IconRemove />}
          />
        </Popconfirm>
      );
    }
    return actions;
  };

  /**
   * Delete a metadata template.
   *
   * @param {number} templateId - identifier for the metadata template to delete
   */
  const deleteTemplate = async (templateId) =>
    dispatch(removeTemplateFromProject({ projectId, templateId }))
      .then(unwrapResult)
      .then(({ message }) => notification.success({ message }))
      .catch((message) => notification.error({ message }));

  return (
    <List
      loading={loading}
      bordered
      itemLayout="horizontal"
      locale={{
        emptyText: (
          <Empty
            description={i18n("MetadataTemplatesList.empty")}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ),
      }}
      dataSource={templates}
      renderItem={(item) => (
        <List.Item className="t-m-template" actions={getActionsForItem(item)}>
          <List.Item.Meta
            title={
              <Link
                className="t-t-name"
                style={{ color: blue6 }}
                to={`${item.identifier}`}
              >
                {item.name}
              </Link>
            }
            description={item.description}
          />
        </List.Item>
      )}
    />
  );
}
