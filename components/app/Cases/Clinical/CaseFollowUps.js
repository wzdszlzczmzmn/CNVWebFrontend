import { EmptyState } from "../Shared/EmptyState"
import { Span } from "../../../styledComponents/styledHTMLTags"
import { Badge, Descriptions, Divider, Tree } from "antd"
import { useState } from "react"
import SplitterLayout from "../Shared/SplitterLayout"
import { DescriptionLabel } from "../Shared/DescriptionComponents"

const CaseFollowUps = ({ data }) => {
    const followUps = data['follow_ups']
    const [selectedItem, setSelectedItem] = useState(
        {
            key: followUps[0]?.['follow_up_id'],
            type: 'followUp'
        }
    )

    return (
        <>
            {
                followUps.length !== 0 ? (
                    <SplitterLayout
                        leftPanel={
                            <FollowUpsTree
                                followUps={followUps}
                                selectedItem={selectedItem}
                                setSelectedItem={setSelectedItem}
                            />
                        }
                        rightPanel={
                            <DescriptionWrapper followUps={followUps} selectedItem={selectedItem} />
                        }
                    />
                ) : (
                    <EmptyState description='No Follow-Ups'/>
                )
            }
        </>
    )
}

export const FollowUpsLabelContent = ({ data }) => {
    const followUps = data['follow_ups']
    const followUpsNum = followUps.length
    let molecularTestsNum = 0
    let otherAttributesNum = 0

    if (followUpsNum > 0) {
        followUps.forEach((followUp) => {
            molecularTestsNum += followUp.molecularTests.length
        })

        followUps.forEach((followUp) => {
            otherAttributesNum += followUp.otherClinicalAttributes.length
        })
    }

    return (
        <>
            <Span>Follow-Ups</Span>
            <Badge count={followUpsNum} offset={[4, -3]} showZero/>
            <Divider type='vertical' style={{ borderColor: 'rgb(0, 0, 0, 0.4)', height: '18px', marginLeft: '14px' }}/>
            <Span>Molecular Tests</Span>
            <Badge count={molecularTestsNum} offset={[4, -3]} showZero/>
            <Divider type='vertical' style={{ borderColor: 'rgb(0, 0, 0, 0.4)', height: '18px', marginLeft: '14px' }}/>
            <Span>Other Clinical Attributes</Span>
            <Badge count={otherAttributesNum} offset={[4, -3]} showZero/>
        </>
    )
}

const DescriptionWrapper = ({selectedItem, followUps}) => {
    if (selectedItem.type === 'followUp') {
        const targetFollowUp = followUps.find(followUp => followUp['follow_up_id'] === selectedItem.key)

        return <FollowUpDescription followUp={targetFollowUp} />
    } else if (selectedItem.type === 'molecularTest') {
        const targetMolecularTest = followUps.flatMap(
            followUp => followUp['molecularTests']
        ).find(
            molecularTest => molecularTest['molecular_test_id'] === selectedItem.key
        )

        return <MolecularTestDescription molecularTest={targetMolecularTest} />
    } else {
        const targetOtherClinicalAttribute = followUps.flatMap(
            followUp => followUp['otherClinicalAttributes']
        ).find(
            otherClinicalAttribute => otherClinicalAttribute['unique_id'] === selectedItem.key
        )

        return <OtherClinicalAttributesDescription otherClinicalAttribute={targetOtherClinicalAttribute} />
    }
}

const FollowUpDescription = ({ followUp }) => {
    const followUpDescriptionItems = createFollowUpsDescriptionItems(followUp)

    return <Descriptions
        bordered
        items={followUpDescriptionItems}
        column={1}
    />
}

const MolecularTestDescription = ({ molecularTest }) => {
    const molecularTestDescriptionItems = createMolecularTestDescriptionItems(molecularTest)

    return <Descriptions
        bordered
        items={molecularTestDescriptionItems}
        column={1}
    />
}

const OtherClinicalAttributesDescription = ({ otherClinicalAttribute }) => {
    const otherClinicalAttributesDescriptionItems = createOtherClinicalAttributesDescriptionItems(otherClinicalAttribute)

    return <Descriptions
        bordered
        items={otherClinicalAttributesDescriptionItems}
        column={1}
    />
}

const FollowUpsTree = ({ followUps, selectedItem, setSelectedItem }) => {
    const followUpTree = transformFollowUpsToTree(followUps)
    const defaultExpandedKeys = followUps.map(followUp => followUp['follow_up_id'])

    const handleSelect = (selectedKeys, e) => {
        if (selectedKeys.length !== 0) {
            setSelectedItem(
                {
                    key: e.selectedNodes[0].key,
                    type: e.selectedNodes[0].type
                }
            )
        }
    }

    return <Tree
        blockNode
        treeData={followUpTree}
        selectedKeys={[selectedItem.key]}
        defaultExpandedKeys={defaultExpandedKeys}
        onSelect={handleSelect}
    />
}

const createFollowUpsDescriptionItems = (followUps) => [
    {
        key: 'followUpId',
        label: <DescriptionLabel text={'Follow Up ID'}/>,
        children: followUps['submitter_id']
    },
    {
        key: 'followUpUUID',
        label: <DescriptionLabel text={'Follow Up UUID'}/>,
        children: followUps['follow_up_id']
    },
    {
        key: 'daysToFollowUp',
        label: <DescriptionLabel text={'Days To Follow Up'}/>,
        children: followUps['days_to_follow_up']
    },
    {
        key: 'progressionOrRecurrenceType',
        label: <DescriptionLabel text={'Progression Or Recurrence Type'}/>,
        children: followUps['progression_or_recurrence_type']
    },
    {
        key: 'progressionOrRecurrence',
        label: <DescriptionLabel text={'Progression Or Recurrence'}/>,
        children: followUps['progression_or_recurrence']
    },
    {
        key: 'diseaseResponse',
        label: <DescriptionLabel text={'Disease Response'}/>,
        children: followUps['disease_response']
    },
    {
        key: 'ECOGPerformanceStatus',
        label: <DescriptionLabel text={'ECOG Performance Status'}/>,
        children: followUps['ecog_performance_status']
    },
    {
        key: 'karnofskyPerformanceStatus',
        label: <DescriptionLabel text={'Karnofsky Performance Status'}/>,
        children: followUps['karnofsky_performance_status']
    },
    {
        key: 'progressionOrRecurrenceAnatomicSite',
        label: <DescriptionLabel text={'Progression Or Recurrence Anatomic Site'}/>,
        children: followUps['progression_or_recurrence_anatomic_site']
    }
]

const createMolecularTestDescriptionItems = (molecularTest) => [
    {
        key: 'molecularTestId',
        label: <DescriptionLabel text={'Molecular Test ID'}/>,
        children: molecularTest['submitter_id']
    },
    {
        key: 'molecularTestUUID',
        label: <DescriptionLabel text={'Molecular Test UUID'}/>,
        children: molecularTest['molecular_test_id']
    },
    {
        key: 'geneSymbol',
        label: <DescriptionLabel text={'Gene Symbol'}/>,
        children: molecularTest['gene_symbol']
    },
    {
        key: 'secondGeneSymbol',
        label: <DescriptionLabel text={'Second Gene Symbol'}/>,
        children: molecularTest['second_gene_symbol']
    },
    {
        key: 'molecularAnalysisMethod',
        label: <DescriptionLabel text={'Molecular Analysis Method'}/>,
        children: molecularTest['molecular_analysis_method']
    },
    {
        key: 'laboratoryTest',
        label: <DescriptionLabel text={'Laboratory Test'}/>,
        children: molecularTest['laboratory_test']
    },
    {
        key: 'testValue',
        label: <DescriptionLabel text={'Test Value'}/>,
        children: molecularTest['test_value']
    },
    {
        key: 'testResult',
        label: <DescriptionLabel text={'Test Result'}/>,
        children: molecularTest['test_result']
    },
    {
        key: 'testUnits',
        label: <DescriptionLabel text={'Test Units'}/>,
        children: molecularTest['test_units']
    },
    {
        key: 'biospecimenType',
        label: <DescriptionLabel text={'Biospecimen Type'}/>,
        children: molecularTest['biospecimen_type']
    },
    {
        key: 'variantType',
        label: <DescriptionLabel text={'Variant Type'}/>,
        children: molecularTest['variant_type']
    },
    {
        key: 'chromosome',
        label: <DescriptionLabel text={'Chromosome'}/>,
        children: molecularTest['chromosome']
    },
    {
        key: 'AAChange',
        label: <DescriptionLabel text={'AA Change'}/>,
        children: molecularTest['aa_change']
    },
    {
        key: 'antigen',
        label: <DescriptionLabel text={'Antigen'}/>,
        children: molecularTest['antigen']
    },
    {
        key: 'mismatchRepairMutation',
        label: <DescriptionLabel text={'Mismatch Repair Mutation'}/>,
        children: molecularTest['mismatch_repair_mutation']
    }
]

const createOtherClinicalAttributesDescriptionItems = (otherClinicalAttribute) => [
    {
        key: 'timepointCategory',
        label: <DescriptionLabel text={'Timepoint Category'}/>,
        children: otherClinicalAttribute['timepoint_category']
    },
    {
        key: 'weight',
        label: <DescriptionLabel text={'Weight'}/>,
        children: otherClinicalAttribute['weight']
    },
    {
        key: 'height',
        label: <DescriptionLabel text={'Height'}/>,
        children: otherClinicalAttribute['height']
    },
    {
        key: 'bmi',
        label: <DescriptionLabel text={'BMI'}/>,
        children: otherClinicalAttribute['bmi']
    }
]

const transformFollowUpsToTree = (followUps) => [
    {
        title: 'Follow-Ups',
        key: 'followUps',
        selectable: false,
        children: followUps.map(followUp => {
            const followUpNode = {
                title: followUp['submitter_id'],
                key: followUp['follow_up_id'],
                type: 'followUp',
                children: []
            }

            if (Array.isArray(followUp['molecularTests']) && followUp['molecularTests'].length > 0) {
                followUpNode.children.push({
                    title: 'Molecular Tests',
                    key: `${followUp['follow_up_id']}-molecularTests`,
                    selectable: false,
                    children: followUp['molecularTests'].map(molecularTest => ({
                        title: molecularTest['submitter_id'],
                        key: molecularTest['molecular_test_id'],
                        type: 'molecularTest'
                    }))
                })
            }

            if (Array.isArray(followUp['otherClinicalAttributes']) && followUp['otherClinicalAttributes'].length > 0) {
                followUpNode.children.push({
                    title: 'Other Clinical Attributes',
                    key: `${followUp['follow_up_id']}-otherClinicalAttributes`,
                    selectable: false,
                    children: followUp['otherClinicalAttributes'].map((otherClinicalAttribute, index) => ({
                        title: `Other Clinical Attribute ${index + 1}`,
                        key: otherClinicalAttribute['unique_id'],
                        type: 'otherClinicalAttribute'
                    }))
                })
            }

            return followUpNode
        })
    }
]

export default CaseFollowUps
