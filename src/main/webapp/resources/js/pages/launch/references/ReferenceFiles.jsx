import React from "react";
import { Alert, Form, Radio, Space, Tag } from "antd";
import { useLaunch } from "../launch-context";
import { UploadReferenceFile } from "./UploadReferenceFile";
import { SectionHeading } from "../../../components/ant.design/SectionHeading";

/**
 * React component for selecting and uploading reference files for a pipeline
 * if required.
 *
 * @returns {JSX.Element|null}
 * @constructor
 */
export function ReferenceFiles() {
  const [{ requiresReference, referenceFiles }] = useLaunch();

  return requiresReference ? (
    <Space direction="vertical" style={{ width: `100%` }}>
      <SectionHeading id="launch-references">
        {i18n("ReferenceFiles.label")}
      </SectionHeading>
      <Form.Item
        label={i18n("ReferenceFiles.label")}
        name="reference"
        rules={[{ required: true, message: i18n("ReferenceFiles.required") }]}
      >
        {referenceFiles.length ? (
          <Radio.Group style={{ width: "100%" }}>
            {referenceFiles.map((file) => (
              <Radio key={`ref-${file.id}`} value={file.id}>
                {file.name}
                {file.projectName ? <Tag>{file.projectName}</Tag> : null}
              </Radio>
            ))}
          </Radio.Group>
        ) : (
          <Alert
            type="info"
            showIcon
            message={i18n("ReferenceFiles.not-found.title")}
            description={i18n("ReferenceFiles.not-found.subTitle")}
          />
        )}
      </Form.Item>
      <UploadReferenceFile />
    </Space>
  ) : null;
}
