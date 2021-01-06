import React from "react";
import { LaunchDetails } from "./LaunchDetails";
import { SharePipelineResults } from "./SharePipelineResults";
import { ReferenceFiles } from "./references/ReferenceFiles";
import { Anchor, Button, Col, Form, Row, Space } from "antd";
import { IconLaunchPipeline } from "../../components/icons/Icons";
import { useLaunch } from "./launch-context";
import { LaunchFiles } from "./LaunchFiles";
import { launchNewPipeline } from "./launch-dispatch";
import { LaunchParameters } from "./LaunchParameters";

/**
 * React component to handle all form components for launching a pipeline.
 * @returns {JSX.Element}
 * @constructor
 */
export function LaunchForm() {
  const [state, launchDispatch] = useLaunch();
  const [form] = Form.useForm();

  /**
   * Triggered when submitting the launch.
   * This let's us perform any last minute validation and UI updates.
   */
  const onFinish = () => {
    // Add any required extra validation here.
    form
      .validateFields()
      .then((values) => launchNewPipeline(launchDispatch, values, state));
    // Add any required UI updates here.
  };

  return (
    <Form
      form={form}
      onFinish={onFinish}
      name="details"
      layout="vertical"
      initialValues={state.initialValues}
    >
      <Row gutter={[16, 16]}>
        <Col sm={24} md={19}>
          <Space direction="vertical" style={{ width: `100%` }}>
            <LaunchDetails />
            <LaunchParameters form={form} />
            <SharePipelineResults />
            <ReferenceFiles />
            <LaunchFiles />
          </Space>
        </Col>
        <Col sm={24} md={5}>
          <Anchor>
            <Anchor.Link
              href="#launch-details"
              title={i18n("LaunchDetails.label")}
            />
            <Anchor.Link
              href="#launch-sharing"
              title={i18n("SharePipelineResults.label")}
            />
            <Anchor.Link
              href="#launch-references"
              title={i18n("ReferenceFiles.label")}
            />
            <Anchor.Link
              href="#launch-parameters"
              title={i18n("SavedParameters.title")}
            />
            <Anchor.Link
              href="#launch-files"
              title={i18n("LaunchFiles.heading")}
            />
            <Anchor.Link
              href="#launch-files"
              title={
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<IconLaunchPipeline />}
                >
                  {i18n("LaunchContent.submit")}
                </Button>
              }
            />
          </Anchor>
        </Col>
      </Row>
    </Form>
  );
}
