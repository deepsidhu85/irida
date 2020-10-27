/*
 * This file renders the OverRepresentedSequences component.
 */

import React, { useEffect, useState } from "react";
import { Layout, Table, Typography } from "antd";
import { SPACE_MD } from "../../../styles/spacing";
import { grey1 } from "../../../styles/colors";
import { TabPaneContent } from "../../../components/tabs/TabPaneContent";
import { getOverRepresentedSequences } from "../../../apis/files/sequence-files";
import {
  seqObjId,
  seqFileId
} from "../fastqc-constants";
import { Monospace } from "../../../components/typography";

export default function OverRepresentedSequences() {
  const [fastQC, setFastQC] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOverRepresentedSequences(seqObjId, seqFileId).then(analysisFastQC => {
      setFastQC(analysisFastQC);
      setLoading(false);
    });
  }, []);

  const columns = [
    {
      title: i18n("FastQC.overrepresented.sequence"),
      key: "sequence",
      dataIndex: "sequence",
      render(data) {
        return <Monospace>{data}</Monospace>;
      }
    },
    {
      title: i18n("FastQC.overrepresented.percentage"),
      key: "percentage",
      dataIndex: "percentage",
      render(data) {
        return `${(Math.round(data * 10) / 10).toFixed(1)} %`;
      }
    },
    {
      title: i18n("FastQC.overrepresented.count"),
      key: "overrepresentedSequenceCount",
      dataIndex: "overrepresentedSequenceCount",
    },
    {
      title: i18n("FastQC.overrepresented.possibleSource"),
      key: "possibleSource",
      dataIndex: "possibleSource",
    },
  ]

  return (
    <Layout style={{ paddingLeft: SPACE_MD, backgroundColor: grey1 }}>
      <TabPaneContent title={i18n("FastQC.overrepresentedSequences")}>
        <Typography.Paragraph className="text-info">{fastQC.description}</Typography.Paragraph>
        <Table
          bordered
          rowKey={(item) => item.identifier}
          loading={loading}
          columns={columns}
          dataSource={fastQC.overrepresentedSequences}
          className="t-overrepresented-sequences-table"
        />
      </TabPaneContent>
    </Layout>
  );
}