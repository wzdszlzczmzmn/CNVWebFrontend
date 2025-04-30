import { Descriptions } from "antd"
import { EmptyState } from "../Shared/EmptyState"
import { DescriptionLabel, formatDays } from "../Shared/DescriptionComponents"

const CaseDemographic = ({ data }) => {
    const { demographics } = data

    return (
        <>
            {
                demographics.length !== 0 ? (
                    <DemographicDescription demographic={demographics[0]}/>
                ) : (
                    <EmptyState description='No Demographics'/>
                )
            }
        </>
    )
}

const DemographicDescription = ({ demographic }) => {
    const demographicsDescriptionItems = createDemographicDescription(demographic)

    return (
        <Descriptions
            bordered
            items={demographicsDescriptionItems}
            column={2}
        />
    )
}

const createDemographicDescription = (demographic) => [
    {
        key: 'demographicId',
        label: <DescriptionLabel text={'Demographic ID'}/>,
        children: demographic['submitter_id']
    },
    {
        key: 'demographicUUID',
        label: <DescriptionLabel text={'Demographic UUID'}/>,
        children: demographic['demographic_id']
    },
    {
        key: 'ethnicity',
        label: <DescriptionLabel text={'Ethnicity'}/>,
        children: demographic['ethnicity']
    },
    {
        key: 'gender',
        label: <DescriptionLabel text={'Gender'}/>,
        children: demographic['gender']
    },
    {
        key: 'race',
        label: <DescriptionLabel text={'Race'}/>,
        children: demographic['race']
    },
    {
        key: 'daysToBirth',
        label: <DescriptionLabel text={'Day To Birth'}/>,
        children: formatDays(demographic['days_to_birth'])
    },
    {
        key: 'daysToDeath',
        label: <DescriptionLabel text={'Day To death'}/>,
        children: formatDays(demographic['days_to_death'])
    },
    {
        key: 'vitalStatus',
        label: <DescriptionLabel text={'Vital Status'}/>,
        children: demographic['vital_status']
    }
]

export default CaseDemographic
