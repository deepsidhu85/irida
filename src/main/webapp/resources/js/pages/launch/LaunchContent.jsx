import React from "react";
import { LaunchPageHeader } from "./LaunchPageHeader";
import { LaunchDetails } from "./LaunchDetails";
import { Button, Form } from "antd";
import { IconLaunchPipeline } from "../../components/icons/Icons";
import { ParameterWithOptions } from "./ParameterWithOptions";
import { SavedParameters } from "./parameters/SavedParameters";
import { ReferenceFiles } from "./references/ReferenceFiles";
import { ShareResultsWithProjects } from "./components/ShareResultsWithProjects";
import { ShareResultsWithSamples } from "./components/ShareResultsWithSamples";
import { launchNewPipeline, useLaunch } from "./launch-context";

/**
 * React component to layout the content of the pipeline launch.
 * It will act as the top level logic controller.
 */
export function LaunchContent() {
  const [
    { initialValues, pipeline, parameterWithOptions },
    launchDispatch,
  ] = useLaunch();
  const [form] = Form.useForm();

  /**
   * Triggered when submitting the launch.
   * This let's us perform any last minute validation and UI updates.
   */
  const onFinish = () => {
    // Add any required extra validation here.
    form
      .validateFields()
      .then((values) => launchNewPipeline(launchDispatch, values));
    // Add any required UI updates here.
  };

  return (
    <>
      <LaunchPageHeader pipeline={pipeline} />
      <Form
        form={form}
        onFinish={onFinish}
        name="details"
        layout="vertical"
        initialValues={initialValues}
      >
        <LaunchDetails />
        <ShareResultsWithProjects />
        <ShareResultsWithSamples />
        <ReferenceFiles />
        <SavedParameters form={form} />
        <ParameterWithOptions parameters={parameterWithOptions} />
        <Button type="primary" htmlType="submit" icon={<IconLaunchPipeline />}>
          {i18n("LaunchContent.submit")}
        </Button>
      </Form>
    </>
  );
}
