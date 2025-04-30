import Stack from "@mui/material/Stack"
import { Descriptions } from "antd"
import { DescriptionLabel, TextWithLinkIcon } from "../Shared/DescriptionComponents"
import { GDC_URL } from "../../../../const/constants"
import { H6 } from "../../../styledComponents/styledHTMLTags"

const CaseSummary = ({ data }) => (
    <Stack>
            <H6 sx={{ fontSize: 32, fontWeight: 600, marginTop: '32px', marginBottom: '16px' }}>
                SUMMARY
            </H6>
            <SummaryDescription data={data}/>
    </Stack>
)

const SummaryDescription = ({ data }) => {
    const summaryDescriptionItems = createSummaryDescriptionItems(data)

    return (
        <Descriptions
            bordered
            items={summaryDescriptionItems}
            column={2}
        />
    )
}

const createSummaryDescriptionItems = (data) => [
    {
        key: 'caseId',
        label: <DescriptionLabel text={'Case ID'}/>,
        children: data['submitter_id']
    },
    {
        key: 'caseUUID',
        label: <DescriptionLabel text={'Case UUID'}/>,
        children: data['case_id']
    },
    {
        key: 'diseaseType',
        label: <DescriptionLabel text={'Disease Type'}/>,
        children: data['disease_type']
    },
    {
        key: 'primarySite',
        label: <DescriptionLabel text={'Primary Site'}/>,
        children: data['primary_site']
    },
    {
        key: 'program',
        label: <DescriptionLabel text={'Program'}/>,
        children: data['belong_to_project']['program']
    },
    {
        key: 'project',
        label: <DescriptionLabel text={'Project'}/>,
        children: (
            <TextWithLinkIcon
                text={data['belong_to_project']['project']}
                href={`${process.env.NEXT_PUBLIC_SITE_URL}/view/${data['belong_to_project']['project']}`}
            />
        )
    },
    {
        key: 'projectName',
        label: <DescriptionLabel text={'Project Name'}/>,
        children: data['belong_to_project']['project_name'],
        span: 2,
    },
    {
        key: 'originalLink',
        label: <DescriptionLabel text={'Original Link'}/>,
        children: (
            <TextWithLinkIcon
                text={`${GDC_URL}/cases/${data['case_id']}`}
                href={`${GDC_URL}/cases/${data['case_id']}`}
            />
        ),
        span: 2
    }
]

export default CaseSummary
